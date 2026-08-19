# Documentação do Procura UAI

Guia de leitura da pasta `docs/`. Documentação em pt-BR; o guia para agentes de
IA fica em [`CLAUDE.md`](../CLAUDE.md), na raiz.

## Técnico

| Documento | Sobre |
| --- | --- |
| [design-system.md](design-system.md) | Design system "Almanaque": tokens, tipografia, classes utilitárias |
| [google-maps.md](google-maps.md) | Integração com o Google Maps e o caminho sem chave de API |
| [coleta-de-dados.md](coleta-de-dados.md) | Coleta via Places API e importação para o Supabase |
| [whatsapp-insights.md](whatsapp-insights.md) | Extração de insights dos grupos de WhatsApp: negócios "fantasma", demanda por categoria, saúde/serviço público |
| [database/README.md](database/README.md) | Schema proposto (PostGIS, chips, painéis de mini-site) |
| [supabase/troubleshooting.md](supabase/troubleshooting.md) | Erros conhecidos do banco e como corrigir |
| [supabase/translation-script.md](supabase/translation-script.md) | Script de tradução de descrições |

## Negócio e expansão

| Documento | Sobre |
| --- | --- |
| [resumo-executivo.md](resumo-executivo.md) | Visão geral: mercado, monetização, diferenciais |
| [analise-negocio-expansao.md](analise-negocio-expansao.md) | Análise de mercado, receita projetada, riscos |
| [expansao-multi-cidades.md](expansao-multi-cidades.md) | Passo a passo para entrar numa cidade nova |
| [implementacao-otimizacao-api.md](implementacao-otimizacao-api.md) | Onde o Maps custa e o que dá para reduzir |

> ⚠️ **Números de negócio são estimativa de planejamento, não medição.**
> População, quantidade de estabelecimentos, taxa de conversão e custo de API
> nesses quatro documentos são hipóteses. Antes de decidir com base neles,
> confira: população no IBGE, custo real em Google Cloud Console → Billing →
> Reports, conversão nos dados do próprio app.

## Planejamento

| Documento | Sobre |
| --- | --- |
| [rotina-semanal.md](rotina-semanal.md) | Ciclo semanal automatizado: o que roda sozinho e o que cabe a você |
| [manual-proximo-passo.md](manual-proximo-passo.md) | Próximos passos manuais (popular a base) |
| [production-implementation-plan.md](production-implementation-plan.md) | Plano de produção |

## Estado dos documentos

Nem tudo aqui descreve o que já existe. Cada documento marca o que é **proposta**
e o que está **implementado** — os blocos de código das seções marcadas como
proposta não foram escritos nem testados. Na dúvida, o código vence o documento.
