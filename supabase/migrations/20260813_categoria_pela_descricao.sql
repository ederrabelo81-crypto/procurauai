-- ============================================================================
-- Categorização: a descrição vira desempate do trigger
-- ============================================================================
-- Rode no SQL Editor do Supabase. O script é idempotente: pode rodar duas vezes
-- sem efeito colateral.
--
-- Problema que ele resolve
-- ------------------------
-- 383 comércios continuam em `servicos`, e a maioria são os 351 da carga
-- antiga: aquele import gravava `category` como "Serviços" para todo mundo e o
-- nome sozinho não tem palavra-chave ("Alforria", "Casa da Sogra"), então o
-- trigger não achava nada e caía no fallback. Depois de `fix-descriptions.mjs`,
-- a descrição desses registros carrega o tipo do Google já em pt-BR
-- ("Bar em Centro. Nota 4,2 (18 avaliações).") — é o sinal que faltava.
--
-- Por que em duas etapas, e não tudo concatenado
-- ----------------------------------------------
-- A descrição é bom sinal, mas de segunda mão. Jogada junto com o nome, ela
-- passaria a decidir casos que o nome já resolvia bem: "Barbearia do Alisson"
-- com descrição "Loja em Centro" viraria `negocios`. Em duas etapas a descrição
-- só opina sobre quem não tinha opinião nenhuma.
--
-- Espelha src/lib/categoryHeuristics.ts (matchCategorySlug +
-- guessBusinessCategorySlug). As listas de palavras-chave são as mesmas — o
-- teste src/lib/__tests__/categoryHeuristics.test.ts compara os dois lados.
--
-- Efeito colateral que vale saber
-- -------------------------------
-- O trigger passa a ter uma fonte a mais para sobrescrever `category_slug`. Um
-- registro cuja categoria foi corrigida à mão, mas cujo nome não casa nada e a
-- descrição casa outra coisa, volta para o palpite da descrição no próximo
-- UPDATE da linha (mesmo um UPDATE de telefone). O backfill do passo 4 não faz
-- isso — ele só toca em quem está em `servicos` —, mas edições futuras fazem.
-- Se a curadoria manual de categoria virar prática, ela precisa de uma coluna
-- própria ("não recalcule esta linha") em vez de depender do trigger.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Classificador reutilizável: devolve o slug ou NULL quando nada casa.
--    Separar "não casou" de "casou serviço" é o que permite a segunda etapa.
-- ---------------------------------------------------------------------------
create or replace function public.match_business_category_slug(input_text text)
returns text
language sql
stable
as $$
  select case
    when public.unaccent(lower(coalesce(input_text, ''))) ~ '\y(acai|bar|boteco|botequim|burger|cafe|cafeteria|choperia|chopperia|churrascaria|churrasco|confeitaria|creperia|doceria|esfiharia|espetinho|gastro|gastronomia|hamburgueria|hamburguer|lanchonete|lanches|marmita|marmitex|padaria|panificadora|pastelaria|petiscaria|pizza|pizzaria|pub|restaurante|rotisseria|sorveteria|sushi|temakeria)\y'
      then 'comer-agora'
    when public.unaccent(lower(coalesce(input_text, ''))) ~ '\y(acougue|adega|agropecuaria|armazem|atacadista|atacado|autopecas|auto pecas|bazar|boutique|calcados|confeccoes|deposito|distribuidora|drogaria|eletronicos|farmacia|ferragens|floricultura|hortifruti|joalheria|livraria|loja|madeireira|magazine|material de construcao|materiais de construcao|mercado|mercearia|minimercado|moveis|otica|papelaria|pet shop|petshop|presentes|quitanda|relojoaria|sapataria|supermercado|tabacaria|tintas|utilidades|variedades)\y'
      then 'negocios'
    when public.unaccent(lower(coalesce(input_text, ''))) ~ '\y(academia|advocacia|advogado|arquitetura|assistencia tecnica|autoescola|auto center|autocenter|barbearia|borracharia|cabeleireiro|cartorio|chaveiro|clinica|colegio|construtora|consultorio|contabilidade|contador|corretora|costureira|creche|dentista|despachante|eletricista|empreiteira|encanador|engenharia|escola|estetica|fisioterapia|funeraria|funilaria|grafica|guincho|hotel|imobiliaria|laboratorio|lava jato|lava rapido|lavanderia|manicure|marceneiro|mecanica|mecanico|medico|odontologia|oficina|pedreiro|posto de combustivel|posto de gasolina|pousada|provedor|psicologo|refrigeracao|salao|seguros|serralheria|terraplenagem|transportadora|veterinario|vidracaria)\y'
      then 'servicos'
    else null
  end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Trigger: nome + categoria, depois descrição, depois o que já estava lá.
-- ---------------------------------------------------------------------------
create or replace function public.set_business_category_slug()
returns trigger
language plpgsql
as $$
begin
  new.category_slug := coalesce(
    public.match_business_category_slug(
      coalesce(new.name, '') || ' ' || coalesce(new.category, '')
    ),
    public.match_business_category_slug(new.description),
    new.category_slug,
    'servicos'
  );

  return new;
end;
$$;

-- O trigger em si não muda, mas recriar é barato e deixa o script auto-contido
-- em bancos onde ele nunca foi aplicado.
drop trigger if exists businesses_set_category_slug on public.businesses;
create trigger businesses_set_category_slug
before insert or update on public.businesses
for each row execute function public.set_business_category_slug();

-- ---------------------------------------------------------------------------
-- 3. PRÉVIA — rode sozinho antes do passo 4 e confira a lista.
--    Nenhuma linha é alterada aqui.
-- ---------------------------------------------------------------------------
-- select
--   name,
--   category,
--   description,
--   category_slug as slug_atual,
--   public.match_business_category_slug(description) as slug_novo
-- from public.businesses
-- where category_slug = 'servicos'
--   and public.match_business_category_slug(
--         coalesce(name, '') || ' ' || coalesce(category, '')
--       ) is null
--   and public.match_business_category_slug(description) is not null
--   and public.match_business_category_slug(description) <> 'servicos'
-- order by slug_novo, name;

-- Contagem por slug de destino, para bater com o "antes e depois":
-- select
--   public.match_business_category_slug(description) as slug_novo,
--   count(*)
-- from public.businesses
-- where category_slug = 'servicos'
--   and public.match_business_category_slug(
--         coalesce(name, '') || ' ' || coalesce(category, '')
--       ) is null
-- group by 1
-- order by 2 desc;

-- ---------------------------------------------------------------------------
-- 4. Reclassificação dos registros já gravados.
--
--    O filtro `category_slug = 'servicos'` é proposital: reprocessar a tabela
--    inteira reescreveria curadoria manual de quem já está em `comer-agora` ou
--    `negocios`. Aqui só mexe em quem está no balde do fallback.
--
--    O UPDATE não calcula nada: ele reescreve a linha com o mesmo valor e deixa
--    o trigger recomputar. Assim o backfill nunca diverge do trigger.
-- ---------------------------------------------------------------------------
update public.businesses
set category_slug = category_slug
where category_slug = 'servicos';

-- ---------------------------------------------------------------------------
-- 5. Conferência final
-- ---------------------------------------------------------------------------
-- select category_slug, count(*)
-- from public.businesses
-- group by 1
-- order by 2 desc;
