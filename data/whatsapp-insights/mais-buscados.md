# Ranking dos Mais Buscados (uso interno)

Gerado por `scripts/whatsapp-insights/extract-insights.mjs` a partir de
`mais-buscados.json`. **Não é uma feature para o consumidor final** — é
ferramenta de priorização de vendas/curadoria. Mostra só agrupamentos com
2+ pedidos no grupo (a lista completa,
inclusive singelos, está em `mais-buscados.json`).

Não existe painel administrativo no código ainda — quando existir, o próximo
passo é ler `mais-buscados.json` ali (ordenado por `vezes_pedido`, com
filtro por `status: "nao_listado"`) em vez desta tabela estática.

| Negócio | Categoria | Vezes pedido | Status | Confiança | Contato .vcf | 1ª menção | Última menção |
| --- | --- | --- | --- | --- | --- | --- | --- |
| casa alugar | aluguel_imovel | 105 | nao_listado | media | — | 2025-06-23 | 2026-08-05 |
| Farmacia Pedro | saude_medico | 89 | nao_listado | media | Farmacia Pedro.vcf | 2025-06-22 | 2026-08-16 |
| Uber | transporte | 74 | nao_listado | media | — | 2025-06-27 | 2026-08-17 |
| médico pronto socorro | saude_medico | 27 | nao_listado | media | — | 2025-07-07 | 2026-07-17 |
| Farmacia Americana | saude_medico | 19 | ja_listado | media | Farmacia Americana.vcf | 2025-06-22 | 2026-07-29 |
| Entregador Shopee | transporte | 19 | nao_listado | media | Entregador Shopee.vcf | 2025-06-24 | 2026-07-13 |
| Adriano Mercado Livre | transporte | 19 | nao_listado | media | Adriano Mercado Livre .vcf | 2025-07-11 | 2026-07-19 |
| Farmácia | saude_medico | 17 | nao_listado | alta | Farmácia.vcf | 2025-08-10 | 2026-08-10 |
| Loja Periquito | roupa_loja | 16 | nao_listado | alta | Loja Periquito.vcf | 2025-06-21 | 2026-07-06 |
| geladeira | reparos_casa | 16 | nao_listado | media | — | 2025-06-30 | 2026-07-10 |
| Laboratório Vinícius | saude_medico | 15 | nao_listado | media | Laboratório Vinícius.vcf | 2025-07-03 | 2026-08-12 |
| Tavim | transporte | 15 | nao_listado | baixa | Tavim.vcf | 2025-07-25 | 2026-07-16 |
| Salgado 1 Real | comida | 14 | nao_listado | media | Salgado 1 Real .vcf | 2025-07-26 | 2026-08-07 |
| Algar Monte Santo | aluguel_imovel | 13 | nao_listado | media | Algar Monte Santo.vcf | 2025-06-30 | 2026-05-12 |
| Andre Chaveiro | outros_servicos | 13 | nao_listado | alta | Andre Chaveiro.vcf | 2025-07-04 | 2026-07-22 |
| Pizzaria Casa | comida | 13 | nao_listado | baixa | Pizzaria Casa.vcf | 2025-08-09 | 2026-08-15 |
| Laboratório Da Luana | saude_medico | 12 | nao_listado | media | Laboratório Da Luana.vcf | 2025-07-07 | 2026-07-20 |
| Naiane Escola | educacao | 11 | nao_listado | baixa | Naiane Escola.vcf | 2025-06-24 | 2026-03-30 |
| hotel restaurante | comida | 11 | ja_listado | baixa | hotel restaurante.vcf | 2025-07-12 | 2026-06-24 |
| Padaria Santos Reis | comida | 11 | nao_listado | media | Padaria Santos Reis .vcf | 2025-08-29 | 2026-06-06 |
| d casa p alugar cômodos | aluguel_imovel | 11 | nao_listado | media | — | 2025-07-07 | 2026-08-13 |
| casa alugar pode ser pequena | aluguel_imovel | 11 | nao_listado | media | — | 2025-11-18 | 2026-08-16 |
| Loja Premium | roupa_loja | 10 | ja_listado | baixa | Loja Premium.vcf | 2025-06-28 | 2026-07-03 |
| Uber Bia | transporte | 10 | nao_listado | baixa | Uber Bia.vcf | 2025-10-06 | 2026-07-08 |
| Casa Da Pizza | comida | 9 | ja_listado | media | Casa Da Pizza.vcf | 2025-07-09 | 2026-02-06 |
| Borracheiro | reparos_casa | 9 | nao_listado | baixa | Borracheiro.vcf | 2025-07-11 | 2026-06-29 |
| Dentista Avenida | saude_medico | 9 | nao_listado | baixa | Dentista Avenida.vcf | 2025-08-01 | 2026-07-17 |
| diaa casa alugar | aluguel_imovel | 9 | nao_listado | media | — | 2025-06-30 | 2026-07-26 |
| me dizer farmácia plantão | saude_medico | 9 | nao_listado | media | — | 2025-08-17 | 2026-07-11 |
| casa pequena alugar | aluguel_imovel | 9 | nao_listado | media | — | 2025-08-25 | 2026-08-15 |
| Estou procura sítio fazenda q | transporte | 9 | nao_listado | media | — | 2025-11-09 | 2026-04-23 |
| Marmitaria Marta | comida | 8 | ja_listado | media | Marmitaria Marta.vcf | 2025-06-29 | 2026-06-27 |
| Foto | reparos_casa | 8 | nao_listado | baixa | Foto.vcf | 2025-06-30 | 2026-08-17 |
| Paulo Dentista | saude_medico | 8 | nao_listado | baixa | Paulo Dentista.vcf | 2025-07-08 | 2026-06-09 |
| Padaria Kiko | comida | 8 | ja_listado | alta | Padaria Kiko.vcf | 2025-07-08 | 2026-07-14 |
| Padaria Gil | comida | 8 | nao_listado | alta | Padaria Gil.vcf | 2025-07-19 | 2026-08-14 |
| Sorveteria Marla | comida | 8 | ja_listado | media | Sorveteria Marla.vcf | 2025-07-19 | 2026-05-17 |
| Restaurante Urbano | comida | 8 | nao_listado | media | Restaurante Urbano.vcf | 2025-07-21 | 2026-07-20 |
| Raio X | saude_medico | 8 | nao_listado | alta | Raio X.vcf | 2025-07-21 | 2026-08-11 |
| Restaurante Antoninho | comida | 8 | nao_listado | media | Restaurante Antoninho.vcf | 2025-08-16 | 2026-05-12 |
| Edinho | auto_mecanico | 8 | nao_listado | baixa | Edinho.vcf | 2025-08-19 | 2026-06-06 |
| Rô Eletricista | reparos_casa | 8 | ja_listado | media | Rô Eletricista.vcf | 2025-09-27 | 2026-06-06 |
| Loja 1 | roupa_loja | 8 | nao_listado | baixa | Loja 1.vcf | 2025-10-09 | 2026-01-28 |
| Marla Sorveteria | comida | 8 | nao_listado | alta | Marla Sorveteria.vcf | 2025-11-01 | 2026-08-17 |
| Bíblia Sagrada Almeida Aleluiah Apps | roupa_loja | 8 | nao_listado | media | — | 2025-07-17 | 2025-12-24 |
| lanche | comida | 8 | nao_listado | media | — | 2025-08-02 | 2026-04-17 |
| médico atendendo pronto socorro | saude_medico | 8 | nao_listado | media | — | 2025-08-12 | 2026-07-04 |
| pessoal Estou procura sítio fazenda | transporte | 8 | nao_listado | media | — | 2025-11-01 | 2026-06-09 |
| casa alugar Pequena | aluguel_imovel | 8 | nao_listado | media | — | 2025-11-10 | 2026-08-04 |
| casa alugar Me chama pv | aluguel_imovel | 8 | nao_listado | media | — | 2026-02-03 | 2026-02-20 |
| roupa menina 12anos doar | roupa_loja | 8 | nao_listado | media | — | 2025-08-19 | 2026-07-13 |
| Ricardo Mudança | transporte | 7 | nao_listado | media | Ricardo Mudança.vcf | 2025-07-01 | 2026-03-24 |
| Rubinho Auto Peças | auto_mecanico | 7 | ja_listado | media | Rubinho Auto Peças.vcf | 2025-07-02 | 2025-12-16 |
| Despachante Uai | documentos_juridico | 7 | nao_listado | media | Despachante Uai.vcf | 2025-07-03 | 2026-06-25 |
| Marta Marmitaria | comida | 7 | ja_listado | media | Marta Marmitaria .vcf | 2025-07-05 | 2026-06-27 |
| Farmácia Ze Basilio | saude_medico | 7 | nao_listado | alta | Farmácia Ze Basilio.vcf | 2025-07-10 | 2026-08-14 |
| Bete | transporte | 7 | nao_listado | baixa | Bete.vcf | 2025-07-11 | 2026-07-26 |
| Chefão Mudança | transporte | 7 | nao_listado | media | Chefão Mudança.vcf | 2025-08-07 | 2026-07-23 |
| Casa Bauru | aluguel_imovel | 7 | nao_listado | baixa | Casa Bauru.vcf | 2025-09-01 | 2026-07-10 |
| RM Marmitaria | comida | 7 | ja_listado | media | RM Marmitaria.vcf | 2025-09-07 | 2026-07-27 |
| loja vivo | roupa_loja | 7 | ja_listado | alta | Loja Vivo.vcf | 2025-09-08 | 2026-07-22 |
| Padaria Ki Pão | comida | 7 | nao_listado | media | Padaria Ki Pão.vcf | 2025-10-04 | 2026-03-04 |
| casa alugar quartos | aluguel_imovel | 7 | nao_listado | media | — | 2025-07-20 | 2026-03-18 |
| casa alugar urgência | aluguel_imovel | 7 | nao_listado | media | — | 2025-08-21 | 2026-07-07 |
| monta guarda roupa | roupa_loja | 7 | nao_listado | media | — | 2025-10-22 | 2026-05-19 |
| DJ Internet | outros_servicos | 6 | nao_listado | media | DJ Internet.vcf | 2025-06-30 | 2026-01-19 |
| João Paulo Veterinario | pet_veterinario | 6 | nao_listado | alta | João Paulo Veterinario.vcf | 2025-07-01 | 2026-01-15 |
| Enganado | reparos_casa | 6 | nao_listado | media | Enganado.vcf | 2025-07-02 | 2025-11-29 |
| Erlon Lanches 🍔 🍔 | comida | 6 | nao_listado | alta | Erlon Lanches 🍔 🍔.vcf | 2025-07-10 | 2026-07-27 |
| Posto Dos Italianos | saude_medico | 6 | nao_listado | baixa | Posto Dos Italianos.vcf | 2025-07-28 | 2026-04-30 |
| Nei Mudança | transporte | 6 | nao_listado | media | Nei Mudança.vcf | 2025-07-30 | 2026-07-23 |
| Gaz | gas_agua | 6 | nao_listado | baixa | Gaz.vcf | 2025-08-15 | 2026-08-17 |
| Sorveteria | comida | 6 | nao_listado | alta | Sorveteria.vcf | 2025-09-08 | 2026-08-16 |
| Restaurante Tiãozinho | comida | 6 | nao_listado | media | Restaurante Tiãozinho.vcf | 2025-07-15 | 2026-08-15 |
| KOMILÃO Lanches | comida | 6 | nao_listado | alta | KOMILÃO Lanches.vcf | 2025-10-24 | 2026-06-05 |
| Dri Cabeleireira | beleza_estetica | 6 | ja_listado | media | Dri Cabeleireira.vcf | 2025-12-03 | 2026-07-07 |
| Tati Costureira | servico_domestico | 6 | nao_listado | baixa | Tati Costureira.vcf | 2025-07-23 | 2026-07-22 |
| PSF mariucha | saude_medico | 6 | nao_listado | media | — | 2025-07-16 | 2026-08-05 |
| Kiko Padaria | comida | 5 | nao_listado | alta | KIKO Padaria.vcf | 2025-06-21 | 2026-06-18 |
| 👍Elias Mercado Livre | transporte | 5 | nao_listado | media | 👍Elias Mercado Livre.vcf | 2025-06-23 | 2025-12-31 |
| Geladeira Rodrigo | reparos_casa | 5 | nao_listado | baixa | Geladeira Rodrigo.vcf | 2025-06-25 | 2026-05-18 |
| Mercado Felipe | transporte | 5 | ja_listado | media | Mercado Felipe.vcf | 2025-06-27 | 2026-06-02 |
| Advogada | documentos_juridico | 5 | nao_listado | media | Advogada.vcf | 2025-07-01 | 2026-02-23 |
| Renato Encanador | reparos_casa | 5 | nao_listado | media | Renato Encanador.vcf | 2025-07-05 | 2026-08-12 |
| Tainá Veterinária 🐾🐶 | pet_veterinario | 5 | nao_listado | alta | Tainá Veterinária 🐾🐶.vcf | 2025-07-12 | 2026-03-02 |
| Edgar Veterinário | pet_veterinario | 5 | nao_listado | alta | Edgar Veterinário.vcf | 2025-07-26 | 2026-05-29 |
| Nelsinho Fretes | transporte | 5 | ja_listado | baixa | Nelsinho Fretes.vcf | 2025-07-27 | 2026-07-21 |
| Geovane Gas | gas_agua | 5 | nao_listado | alta | Geovane Gas.vcf | 2025-07-27 | 2026-04-28 |
| Posto de vacina | saude_medico | 5 | ja_listado | media | Posto De Vacina.vcf | 2025-08-02 | 2026-05-05 |
| Adriano Shoppe | transporte | 5 | nao_listado | media | Adriano Shoppe.vcf | 2025-08-25 | 2026-07-13 |
| Carvalhoö Chacara | aluguel_imovel | 5 | nao_listado | media | ‎9 contatos.vcf | 2025-08-28 | 2026-08-10 |
| Veterinária Taina | pet_veterinario | 5 | nao_listado | media | Veterinária Taina.vcf | 2025-09-07 | 2026-04-07 |
| Farmacia Pedro Zap | saude_medico | 5 | nao_listado | baixa | Farmacia Pedro Zap.vcf | 2025-09-20 | 2026-05-07 |
| Loja Da Negia | roupa_loja | 5 | ja_listado | baixa | Loja Da Negia .vcf | 2025-09-22 | 2026-07-09 |
| Cartorio Eleitoral1 | documentos_juridico | 5 | nao_listado | media | Cartorio Eleitoral1.vcf | 2025-11-03 | 2026-05-05 |
| Farmacia São Geraldo | saude_medico | 5 | nao_listado | alta | Farmacia São Geraldo.vcf | 2025-12-11 | 2026-07-19 |
| João Saulo | roupa_loja | 5 | nao_listado | baixa | João Saulo.vcf | 2026-01-05 | 2026-03-24 |
| televisão | reparos_casa | 5 | nao_listado | media | — | 2025-07-22 | 2026-05-11 |
| máquina lavar | reparos_casa | 5 | nao_listado | media | — | 2025-07-22 | 2026-05-12 |
| advogado trabalhista | documentos_juridico | 5 | nao_listado | media | — | 2025-09-01 | 2026-08-03 |
| Uber disponível | transporte | 5 | nao_listado | media | — | 2025-11-15 | 2026-07-06 |
| Carlos Uber | transporte | 4 | nao_listado | media | Carlos Uber.vcf | 2025-06-24 | 2026-02-12 |
| Dentista Adriana | saude_medico | 4 | nao_listado | media | Dentista Adriana .vcf | 2025-06-24 | 2026-02-10 |
| Paulo Farmácia | saude_medico | 4 | nao_listado | baixa | Paulo Farmácia.vcf | 2025-07-03 | 2026-08-07 |
| Tati Cabeleireira | beleza_estetica | 4 | ja_listado | alta | Tati Cabeleireira.vcf | 2025-07-07 | 2026-06-04 |
| João Despachante | documentos_juridico | 4 | ja_listado | alta | JOÃO DESPACHANTE.vcf | 2025-07-11 | 2026-07-23 |
| Afonso Uber | transporte | 4 | nao_listado | media | Afonso Uber.vcf | 2025-07-11 | 2025-11-29 |
| Adriano Celular | reparos_casa | 4 | nao_listado | media | Adriano Celular.vcf | 2025-07-14 | 2026-08-01 |
| Adriano Mercado Livre Mercado Livre | transporte | 4 | nao_listado | baixa | Adriano Mercado Livre Mercado Livre.vcf | 2025-07-26 | 2026-07-24 |
| Restaurante Água Na Boca | comida | 4 | nao_listado | media | Restaurante Água Na Boca.vcf | 2025-08-03 | 2026-01-30 |
| Erlon Lanche | comida | 4 | nao_listado | alta | Erlon Lanche.vcf | 2025-08-06 | 2026-05-25 |
| Nega Lanches | comida | 4 | nao_listado | alta | Nega Lanches.vcf | 2025-08-09 | 2026-07-11 |
| Pamonheiro | comida | 4 | nao_listado | baixa | Pamonheiro.vcf | 2025-08-12 | 2026-06-10 |
| Estilo Calcados | roupa_loja | 4 | ja_listado | media | Estilo Calcados.vcf | 2025-08-14 | 2025-12-09 |
| Cartorio | documentos_juridico | 4 | nao_listado | media | Cartorio.vcf | 2025-08-15 | 2026-06-08 |
| Sorveteira Da Marla Marla | comida | 4 | nao_listado | baixa | Sorveteira Da Marla Marla.vcf | 2025-08-17 | 2026-08-01 |
| Coiote Mudança | transporte | 4 | nao_listado | baixa | Coiote Mudança.vcf | 2025-07-11 | 2026-07-11 |
| Tião Táxi | transporte | 4 | nao_listado | media | Tião Táxi.vcf | 2025-08-24 | 2026-08-15 |
| Kelvin Gas 👊 | gas_agua | 4 | nao_listado | alta | Kelvin Gas 👊.vcf | 2025-08-25 | 2026-07-09 |
| Avelino Modas | roupa_loja | 4 | nao_listado | alta | Avelino Modas.vcf | 2025-08-28 | 2026-08-14 |
| Lanche Nega | comida | 4 | nao_listado | baixa | Lanche Nega.vcf | 2025-09-18 | 2026-06-13 |
| Farmacia Do Pedro | saude_medico | 4 | nao_listado | baixa | Farmacia Do Pedro .vcf | 2025-09-27 | 2026-04-09 |
| Rodrigo Ruma Geladeira | auto_mecanico | 4 | nao_listado | baixa | Rodrigo Ruma Geladeira.vcf | 2025-10-01 | 2026-01-17 |
| Salgado 1 Real (Rodoviária) | comida | 4 | nao_listado | media | Salgado 1 Real (Rodoviária).vcf | 2025-07-15 | 2026-06-14 |
| Escola Wenceslau Braz | educacao | 4 | nao_listado | media | Escola WENCESLAU BRAZ.vcf | 2025-10-08 | 2026-08-11 |
| Rodrigo Geladeira | reparos_casa | 4 | nao_listado | media | Rodrigo Geladeira.vcf | 2025-10-10 | 2026-07-27 |
| Padaria Juliana | comida | 4 | nao_listado | baixa | Padaria Juliana.vcf | 2025-11-11 | 2026-08-15 |
| Cachorro Quente | pet_veterinario | 4 | nao_listado | media | Cachorro Quente.vcf | 2025-11-16 | 2026-06-04 |
| Marcio Uber | transporte | 4 | nao_listado | baixa | Marcio Uber.vcf | 2025-11-23 | 2026-07-24 |
| Veterinário Ademir | pet_veterinario | 4 | nao_listado | media | Veterinário Ademir.vcf | 2025-12-06 | 2026-07-12 |
| Padaria Do Aluno | comida | 4 | ja_listado | baixa | Padaria Do Aluno.vcf | 2026-01-25 | 2026-06-24 |
| Sirlei Padaria | comida | 4 | nao_listado | alta | Sirlei Padaria.vcf | 2026-03-31 | 2026-06-09 |
| me informar farmácia plantão | saude_medico | 4 | nao_listado | media | — | 2025-07-06 | 2026-04-03 |
| q hora postinho vacina fica | saude_medico | 4 | nao_listado | media | — | 2025-07-22 | 2026-04-30 |
| tudo bem casa alugar | aluguel_imovel | 4 | nao_listado | media | — | 2025-11-17 | 2026-05-12 |
| casa alugar pfvr | aluguel_imovel | 4 | nao_listado | media | — | 2025-12-21 | 2026-08-02 |
| bolo aniversário | comida | 4 | nao_listado | media | — | 2026-01-17 | 2026-07-07 |
| advogado criminal | documentos_juridico | 4 | nao_listado | media | — | 2026-02-25 | 2026-06-03 |
| Fogao doar | reparos_casa | 4 | nao_listado | media | — | 2025-11-25 | 2026-07-02 |
| Xu Antena | reparos_casa | 3 | nao_listado | baixa | Xu Antena.vcf | 2025-06-24 | 2026-05-11 |
| Cacau Show Monte Santo | transporte | 3 | nao_listado | baixa | Cacau Show Monte Santo.vcf | 2025-06-26 | 2025-10-07 |
| Farmácia Pública | saude_medico | 3 | nao_listado | media | Farmácia Pública .vcf | 2025-06-27 | 2026-05-07 |
| Bia Uber | transporte | 3 | nao_listado | media | Bia Uber.vcf | 2025-06-30 | 2026-05-02 |
| Padaria Vanderlei | comida | 3 | ja_listado | media | Padaria Vanderlei.vcf | 2025-07-02 | 2026-03-20 |
| Cartorio Registro Civil | documentos_juridico | 3 | nao_listado | baixa | Cartorio Registro Civil.vcf | 2025-07-05 | 2025-10-06 |
| Pizzaria Forno A Lenha | comida | 3 | ja_listado | alta | Pizzaria Forno A Lenha.vcf | 2025-07-05 | 2026-05-08 |
| Taís | transporte | 3 | nao_listado | baixa | Taís.vcf | 2025-07-06 | 2026-05-18 |
| Ampara Monte Santo | saude_medico | 3 | ja_listado | media | Ampara Monte Santo.vcf | 2025-07-07 | 2026-06-24 |
| Farmácia Do Basilio | comida | 3 | nao_listado | baixa | Farmácia Do Basilio.vcf | 2025-07-18 | 2026-07-03 |
| Cartório Casamento | documentos_juridico | 3 | nao_listado | media | Cartório Casamento.vcf | 2025-07-22 | 2025-09-02 |
| Giovanni GAS | gas_agua | 3 | nao_listado | alta | Giovanni GAS.vcf | 2025-07-27 | 2026-06-04 |
| Guincho Lamana | auto_mecanico | 3 | nao_listado | media | Guincho Lamana.vcf | 2025-07-28 | 2026-05-05 |
| Marilda Doces | comida | 3 | nao_listado | media | Marilda Doces.vcf | 2025-08-04 | 2025-12-10 |
| Padaria Ana Julia | comida | 3 | nao_listado | alta | Padaria Ana Julia.vcf | 2025-08-05 | 2026-05-31 |
| Lucas Máquina De Lava | reparos_casa | 3 | nao_listado | baixa | Lucas Máquina De Lava.vcf | 2025-08-07 | 2026-01-15 |
| Eletricista Irineu | reparos_casa | 3 | ja_listado | baixa | Eletricista Irineu.vcf | 2025-08-05 | 2025-12-30 |
| Gabriel Advogado | documentos_juridico | 3 | nao_listado | media | Gabriel Advogado.vcf | 2025-08-18 | 2026-05-07 |
| Papelaria | comida | 3 | ja_listado | baixa | Papelaria.vcf | 2025-08-24 | 2026-02-08 |
| Sorveteria Kero Mais | comida | 3 | ja_listado | baixa | Sorveteria KERO MAIS.vcf | 2025-08-24 | 2026-03-28 |
| Gelicio Vidraceiro | reparos_casa | 3 | nao_listado | media | Gelicio Vidraceiro.vcf | 2025-09-05 | 2026-01-29 |
| Super Lanche | comida | 3 | nao_listado | alta | Super Lanche.vcf | 2025-09-07 | 2026-05-30 |
| Kalu Manicure | beleza_estetica | 3 | nao_listado | baixa | Kalu Manicure.vcf | 2025-09-11 | 2026-04-26 |
| Luciano uber | transporte | 3 | nao_listado | alta | Luciano uber.vcf | 2025-09-12 | 2026-04-27 |
| Rodolfo Rodoviária | roupa_loja | 3 | nao_listado | baixa | Rodolfo Rodoviária.vcf | 2025-09-17 | 2026-08-14 |
| Espaco Festa | outros_servicos | 3 | nao_listado | alta | Espaco Festa.vcf | 2025-09-20 | 2026-08-17 |
| Bia Uber Monte Santo | transporte | 3 | nao_listado | baixa | Bia Uber Monte Santo .vcf | 2025-09-22 | 2026-06-11 |
| Dionis Pamonha | comida | 3 | nao_listado | alta | Dionis Pamonha.vcf | 2025-09-24 | 2026-08-04 |
| Restaurante Gato Grill | comida | 3 | nao_listado | baixa | ‎5 contatos.vcf | 2025-07-26 | 2026-05-17 |
| Nega Lanche | comida | 3 | nao_listado | alta | Nega Lanche.vcf | 2025-10-03 | 2026-02-21 |
| Robin Táxi | transporte | 3 | nao_listado | baixa | Robin Táxi.vcf | 2025-10-05 | 2026-08-12 |
| Cláudio Encanador | reparos_casa | 3 | nao_listado | baixa | Cláudio Encanador.vcf | 2025-10-14 | 2026-03-24 |
| Cachorro Quente E Sorvete | pet_veterinario | 3 | nao_listado | baixa | Cachorro Quente E Sorvete.vcf | 2025-10-17 | 2026-03-18 |
| Pim Van | transporte | 3 | nao_listado | alta | Pim Van.vcf | 2025-10-19 | 2026-06-30 |
| Parana Construcao | construcao | 3 | nao_listado | baixa | Parana Construcao.vcf | 2025-10-22 | 2026-07-01 |
| Zé Caeiro Motorista | transporte | 3 | nao_listado | baixa | Zé Caeiro Motorista.vcf | 2025-10-25 | 2026-07-22 |
| Boloti Mudancas | transporte | 3 | nao_listado | media | Boloti Mudancas.vcf | 2025-11-07 | 2026-05-25 |
| Loja Zacarias | roupa_loja | 3 | nao_listado | alta | Loja Zacarias.vcf | 2025-11-12 | 2026-06-17 |
| Salgado 1 | comida | 3 | nao_listado | media | Salgado 1.vcf | 2025-11-16 | 2026-02-17 |
| Pasto De Vacinação | saude_medico | 3 | ja_listado | media | Pasto De Vacinação.vcf | 2025-11-26 | 2026-07-28 |
| Buda Máquina De Lavar Roupas | reparos_casa | 3 | nao_listado | baixa | Buda Máquina De Lavar Roupas.vcf | 2025-12-05 | 2026-06-24 |
| Veterinária | pet_veterinario | 3 | nao_listado | alta | Veterinária.vcf | 2025-12-12 | 2026-03-09 |
| Rafael Eletrozema | roupa_loja | 3 | nao_listado | baixa | Rafael Eletrozema.vcf | 2025-12-09 | 2026-06-03 |
| Beto Van | transporte | 3 | nao_listado | alta | Beto Van.vcf | 2025-12-08 | 2026-05-23 |
| Marcos Rodrigues Entregador | transporte | 3 | nao_listado | baixa | Marcos Rodrigues Entregador.vcf | 2026-02-21 | 2026-05-28 |
| Sorvete Paulão | comida | 3 | nao_listado | media | Sorvete Paulão.vcf | 2026-02-22 | 2026-05-08 |
| Monte Santo ( Cristina) | educacao | 3 | nao_listado | baixa | Monte Santo ( Cristina) .vcf | 2026-03-24 | 2026-07-05 |
| Otavio Advogado | documentos_juridico | 3 | nao_listado | baixa | Otavio Advogado.vcf | 2026-03-20 | 2026-07-08 |
| Giovani Gás | gas_agua | 3 | nao_listado | alta | GIOVANI GÁS.vcf | 2025-07-25 | 2026-06-04 |
| Tassiana Salgados | comida | 3 | nao_listado | alta | Tassiana Salgados.vcf | 2026-06-23 | 2026-07-03 |
| Achei documento porta casa s | documentos_juridico | 3 | nao_listado | media | — | 2025-07-01 | 2025-07-02 |
| PSF SÃO CAMILO | saude_medico | 3 | nao_listado | media | — | 2025-08-13 | 2026-03-24 |
| médico plantão ponto socorro | saude_medico | 3 | nao_listado | media | — | 2025-08-14 | 2025-11-14 |
| loja ponto economia | roupa_loja | 3 | nao_listado | media | — | 2025-10-04 | 2025-12-24 |
| PSF João Furlan | saude_medico | 3 | nao_listado | media | — | 2025-10-17 | 2026-02-27 |
| botijão gás vazio vender | gas_agua | 3 | nao_listado | media | — | 2025-10-25 | 2026-08-10 |
| táxi Uber já trabalhando | transporte | 3 | nao_listado | media | — | 2025-10-26 | 2025-12-28 |
| casa alugar grande quartos garagem | aluguel_imovel | 3 | nao_listado | media | — | 2025-11-08 | 2026-02-18 |
| chácara alugar | aluguel_imovel | 3 | nao_listado | media | — | 2025-08-04 | 2026-04-15 |
| psf lucas Magalhães | saude_medico | 3 | nao_listado | media | — | 2025-07-02 | 2026-06-10 |
| Estou novamente postando q estou | transporte | 3 | nao_listado | media | — | 2026-01-26 | 2026-02-05 |
| Estou passando novamente grupos procura | transporte | 3 | nao_listado | media | — | 2026-01-29 | 2026-02-02 |
| pessoal Estou postando novamente q | transporte | 3 | nao_listado | media | — | 2026-02-22 | 2026-04-13 |
| casa sítio alugar | aluguel_imovel | 3 | nao_listado | media | — | 2026-06-29 | 2026-07-08 |
| diaaa casa alugar pode ser | aluguel_imovel | 3 | nao_listado | media | — | 2026-07-13 | 2026-07-15 |
| calçados infantil menino doar | roupa_loja | 3 | nao_listado | media | — | 2025-08-21 | 2026-05-02 |
| guarda roupa doar | roupa_loja | 3 | nao_listado | media | — | 2025-08-23 | 2026-07-21 |
| roupa menino homem anos anos | roupa_loja | 3 | nao_listado | media | — | 2025-12-10 | 2026-02-12 |
| roupa bebê menina | roupa_loja | 3 | nao_listado | media | — | 2026-01-03 | 2026-07-06 |
| Sorveteria Fer | comida | 2 | nao_listado | media | Sorveteria Fer.vcf | 2025-06-22 | 2025-06-30 |
| Edinho Eletricista | reparos_casa | 2 | ja_listado | baixa | Edinho Eletricista.vcf | 2025-06-23 | 2026-06-15 |
| TERRAÇO RESTAURANTE Ex Varanda | comida | 2 | nao_listado | baixa | TERRAÇO RESTAURANTE Ex Varanda.vcf | 2025-06-23 | 2026-01-31 |
| Tiago Mecânico | auto_mecanico | 2 | nao_listado | media | Tiago Mecânico.vcf | 2025-06-23 | 2026-02-05 |
| Alvorada Ração | transporte | 2 | nao_listado | baixa | Alvorada Ração.vcf | 2025-06-25 | 2025-10-31 |
| Joao Mecanico | auto_mecanico | 2 | nao_listado | baixa | Joao Mecanico.vcf | 2025-06-25 | 2026-05-19 |
| Lanche Erlon | comida | 2 | nao_listado | baixa | Lanche Erlon.vcf | 2025-06-25 | 2026-03-11 |
| Juninho Van | transporte | 2 | nao_listado | alta | Juninho Van.vcf | 2025-06-28 | 2026-05-11 |
| Matheus entregador amazon | transporte | 2 | nao_listado | baixa | Matheus entregador amazon.vcf | 2025-06-28 | 2025-07-04 |
| Farmácia Zé | saude_medico | 2 | nao_listado | media | Farmácia Zé.vcf | 2025-06-30 | 2025-09-18 |
| Cartório Civil | documentos_juridico | 2 | nao_listado | alta | Cartório Civil.vcf | 2025-06-30 | 2026-05-08 |
| Carlão Taxista | transporte | 2 | nao_listado | media | Carlão Taxista.vcf | 2025-06-30 | 2026-01-07 |
| Celio Peixeiro | reparos_casa | 2 | nao_listado | baixa | Celio Peixeiro.vcf | 2025-07-03 | 2026-05-11 |
| GRILO MECÂNICO | auto_mecanico | 2 | nao_listado | media | GRILO MECÂNICO .vcf | 2025-07-04 | 2026-03-14 |
| Lu Festa | outros_servicos | 2 | nao_listado | media | Lu Festa.vcf | 2025-07-05 | 2025-12-09 |
| Ligeirinho Gás Monte Santo | transporte | 2 | nao_listado | baixa | Ligeirinho Gás Monte Santo.vcf | 2025-07-11 | 2026-07-13 |
| Neia Pereira | reparos_casa | 2 | nao_listado | baixa | Neia Pereira.vcf | 2025-07-14 | 2025-11-15 |
| Renata Faxineira | servico_domestico | 2 | nao_listado | baixa | Renata Faxineira.vcf | 2025-07-15 | 2025-08-13 |
| Escola Wenceslau Braz Zap | educacao | 2 | nao_listado | baixa | Escola Wenceslau Braz Zap.vcf | 2025-07-15 | 2026-04-29 |
| Amauri Advogad | documentos_juridico | 2 | nao_listado | media | Amauri Advogad.vcf | 2025-07-16 | 2025-09-10 |
| Loja Vivo Monte Santo | roupa_loja | 2 | nao_listado | baixa | Loja Vivo Monte Santo.vcf | 2025-07-16 | 2025-08-01 |
| Evandro Gas | gas_agua | 2 | nao_listado | alta | Evandro Gas.vcf | 2025-07-16 | 2025-10-02 |
| . Fabinho Mecânico | auto_mecanico | 2 | nao_listado | media | . Fabinho Mecânico.vcf | 2025-07-17 | 2026-02-10 |
| Sergio Neves | gas_agua | 2 | nao_listado | baixa | Sergio Neves.vcf | 2025-07-20 | 2025-12-21 |
| Rose Bolo | comida | 2 | nao_listado | baixa | Rose Bolo.vcf | 2025-07-23 | 2026-08-08 |
| Farmácia Americana 2 | saude_medico | 2 | ja_listado | media | Farmácia Americana 2.vcf | 2025-07-26 | 2025-11-22 |
| Belquior Fisioterapia | saude_medico | 2 | nao_listado | media | Belquior Fisioterapia.vcf | 2025-07-28 | 2025-11-25 |
| Joao  Paulo | roupa_loja | 2 | nao_listado | baixa | Joao  Paulo.vcf | 2025-07-29 | 2026-01-21 |
| Nelson Mudança Mudança | transporte | 2 | nao_listado | baixa | Nelson Mudança Mudança.vcf | 2025-07-29 | 2025-10-11 |
| Farmácia Bem Popular | saude_medico | 2 | ja_listado | baixa | Farmácia Bem Popular.vcf | 2025-08-01 | 2025-12-26 |
| Cida Salgados | comida | 2 | ja_listado | alta | Cida Salgados.vcf | 2025-08-02 | 2025-08-18 |
| BRASIL PETRO | pet_veterinario | 2 | ja_listado | baixa | BRASIL PETRO.vcf | 2025-08-05 | 2025-10-02 |
| Pizzaria Rei da Pizza | comida | 2 | nao_listado | baixa | Pizzaria Rei da Pizza.vcf | 2025-08-05 | 2025-11-08 |
| Marquinho Moto Táxi | transporte | 2 | nao_listado | media | Marquinho Moto Táxi.vcf | 2025-08-09 | 2026-02-13 |
| Thiago Som | outros_servicos | 2 | nao_listado | alta | Thiago Som.vcf | 2025-08-09 | 2025-10-03 |
| Claudio Papelaria | pet_veterinario | 2 | nao_listado | baixa | Claudio Papelaria.vcf | 2025-08-13 | 2025-08-13 |
| Aline Advogada | documentos_juridico | 2 | nao_listado | alta | Aline Advogada.vcf | 2025-08-15 | 2026-02-27 |
| Angela Marmitaria | comida | 2 | nao_listado | alta | Angela Marmitaria.vcf | 2025-08-18 | 2026-01-19 |
| Negão Despachante | documentos_juridico | 2 | ja_listado | alta | Negão Despachante  .vcf | 2025-08-18 | 2026-01-16 |
| Farmacia Frank ( Juliana) | saude_medico | 2 | nao_listado | baixa | Farmacia Frank ( Juliana).vcf | 2025-08-19 | 2026-05-07 |
| Karol Modas | roupa_loja | 2 | ja_listado | media | KAROL MODAS.vcf | 2025-08-24 | 2026-07-06 |
| José Afonso | transporte | 2 | nao_listado | baixa | José Afonso.vcf | 2025-08-28 | 2026-01-03 |
| Ivan.. | transporte | 2 | nao_listado | alta | Ivan...vcf | 2025-08-30 | 2026-08-14 |
| Mauro Montador | reparos_casa | 2 | nao_listado | baixa | Mauro Montador.vcf | 2025-09-03 | 2026-05-14 |
| Souza Barbeiro | beleza_estetica | 2 | nao_listado | baixa | Souza Barbeiro.vcf | 2025-09-18 | 2025-10-17 |
| Entregador Da Chopp Adriano | transporte | 2 | nao_listado | baixa | Entregador Da Chopp Adriano.vcf | 2025-09-19 | 2025-11-13 |
| Restaurante São José | comida | 2 | nao_listado | alta | Restaurante São José.vcf | 2025-09-19 | 2025-10-28 |
| Podóloga | saude_medico | 2 | nao_listado | baixa | Podóloga.vcf | 2025-09-24 | 2025-11-27 |
| Darlene Cabeleireira | beleza_estetica | 2 | ja_listado | media | Darlene Cabeleireira.vcf | 2025-09-30 | 2026-03-18 |
| Edinho Barbeiro | beleza_estetica | 2 | ja_listado | media | Edinho Barbeiro.vcf | 2025-10-02 | 2026-06-22 |
| Leandro eletricista | reparos_casa | 2 | ja_listado | media | Leandro eletricista.vcf | 2025-10-07 | 2025-12-22 |
| Despachante Magalhães | documentos_juridico | 2 | ja_listado | baixa | Despachante Magalhães.vcf | 2025-10-08 | 2025-12-01 |
| Dr Mário Neurologista | saude_medico | 2 | nao_listado | baixa | Dr Mário Neurologista.vcf | 2025-10-13 | 2026-07-08 |
| Concerta Fone | reparos_casa | 2 | ja_listado | media | Concerta Fone.vcf | 2025-10-15 | 2026-02-01 |
| Luciano Chacara | aluguel_imovel | 2 | nao_listado | baixa | Luciano Chacara.vcf | 2025-10-16 | 2026-01-21 |
| Silvia Chacara Matadouro | aluguel_imovel | 2 | nao_listado | baixa | Silvia Chacara Matadouro .vcf | 2025-10-19 | 2026-05-06 |
| Laboratório São Francisco | saude_medico | 2 | ja_listado | media | Laboratório São Francisco.vcf | 2025-10-21 | 2026-01-14 |
| Serginho Chupeta | pet_veterinario | 2 | nao_listado | media | Serginho Chupeta.vcf | 2025-10-23 | 2026-02-04 |
| Algodão Doce | comida | 2 | nao_listado | baixa | Algodão Doce.vcf | 2025-10-24 | 2026-06-13 |
| Ceará Antenas Tv | reparos_casa | 2 | nao_listado | media | Ceará Antenas Tv.vcf | 2025-10-29 | 2026-02-05 |
| Marisa Loja Im | reparos_casa | 2 | nao_listado | baixa | Marisa Loja Im.vcf | 2025-11-14 | 2026-08-07 |
| Conserto De Máquina Lavar | reparos_casa | 2 | nao_listado | baixa | Conserto De Máquina Lavar.vcf | 2025-11-22 | 2026-02-15 |
| Marmita RM | comida | 2 | ja_listado | media | Marmita RM.vcf | 2025-11-27 | 2026-06-21 |
| Alison Uber | transporte | 2 | nao_listado | alta | Alison Uber.vcf | 2025-11-28 | 2025-12-20 |
| Pamonha MARCIO | roupa_loja | 2 | nao_listado | baixa | Pamonha MARCIO.vcf | 2025-11-29 | 2026-07-15 |
| Matheus GAS | gas_agua | 2 | nao_listado | alta | Matheus GAS.vcf | 2025-11-29 | 2026-01-27 |
| Excursão Margareti😍 Moto | transporte | 2 | nao_listado | baixa | Excursão Margareti😍 Moto.vcf | 2025-12-01 | 2026-03-14 |
| Loja Osorinho | roupa_loja | 2 | nao_listado | media | Loja Osorinho.vcf | 2025-12-01 | 2026-08-03 |
| Rita Salgado | comida | 2 | ja_listado | alta | Rita Salgado.vcf | 2025-12-08 | 2026-01-16 |
| Rafael Uber | transporte | 2 | nao_listado | baixa | Rafael Uber.vcf | 2025-12-08 | 2026-07-30 |
| Flavia Manicure | beleza_estetica | 2 | nao_listado | alta | Flavia Manicure.vcf | 2025-12-12 | 2026-03-19 |
| Pizzaria Alforria | comida | 2 | nao_listado | media | Pizzaria Alforria.vcf | 2025-12-18 | 2026-07-12 |
| Tiara Tião Lopes | roupa_loja | 2 | nao_listado | baixa | Tiara Tião Lopes.vcf | 2025-12-23 | 2026-05-15 |
| Chácara Andreia Ladeira | reparos_casa | 2 | nao_listado | baixa | Chácara Andreia Ladeira.vcf | 2026-01-01 | 2026-06-15 |
| Rodoviária Monte Santo De Minas | reparos_casa | 2 | ja_listado | media | Rodoviária Monte Santo De Minas.vcf | 2026-01-07 | 2026-01-08 |
| João Lanza Conserta Geladeira | reparos_casa | 2 | nao_listado | baixa | João Lanza Conserta Geladeira.vcf | 2026-01-14 | 2026-03-10 |
| Joao Parreira | reparos_casa | 2 | nao_listado | baixa | Joao Parreira.vcf | 2026-01-16 | 2026-05-02 |
| Auto Escola Paraíso | educacao | 2 | ja_listado | media | Auto Escola Paraíso.vcf | 2026-01-19 | 2026-04-16 |
| Dr Gabriel Brito | documentos_juridico | 2 | nao_listado | baixa | Dr Gabriel Brito.vcf | 2026-01-20 | 2026-07-29 |
| Luana Advogada | documentos_juridico | 2 | nao_listado | media | Luana Advogada.vcf | 2026-01-20 | 2026-08-14 |
| Correio | transporte | 2 | ja_listado | media | Correio.vcf | 2026-01-25 | 2026-05-25 |
| Giovane Gas | gas_agua | 2 | nao_listado | baixa | Giovane Gas.vcf | 2026-01-29 | 2026-08-02 |
| Ricardo Frete | transporte | 2 | nao_listado | media | Ricardo Frete .vcf | 2026-01-31 | 2026-06-09 |
| Fer Loja | roupa_loja | 2 | nao_listado | baixa | Fer Loja.vcf | 2026-02-11 | 2026-02-12 |
| Fátima | servico_domestico | 2 | nao_listado | baixa | Fátima.vcf | 2026-02-12 | 2026-02-16 |
| Nalu Modas | roupa_loja | 2 | ja_listado | media | Nalu Modas .vcf | 2026-02-19 | 2026-08-18 |
| Luana Laboratório | saude_medico | 2 | nao_listado | baixa | Luana Laboratório.vcf | 2026-02-20 | 2026-05-14 |
| Diego Guinchos | auto_mecanico | 2 | ja_listado | alta | Diego Guinchos.vcf | 2026-02-21 | 2026-02-21 |
| MARILEI | comida | 2 | nao_listado | baixa | MARILEI.vcf | 2025-08-16 | 2026-02-24 |
| Montador 2 Moveis | reparos_casa | 2 | nao_listado | alta | Montador 2 Moveis.vcf | 2026-02-28 | 2026-04-28 |
| Veterinario Edgar | pet_veterinario | 2 | nao_listado | media | Veterinario Edgar.vcf | 2026-01-03 | 2026-02-28 |
| Rafaela Sobrancelha | beleza_estetica | 2 | nao_listado | baixa | Rafaela Sobrancelha.vcf | 2026-03-07 | 2026-04-14 |
| Marilda Doces E Bolo | comida | 2 | nao_listado | baixa | Marilda Doces E Bolo.vcf | 2026-03-08 | 2026-06-06 |
| LOJAS PREMIUM 🚀💙 | roupa_loja | 2 | ja_listado | alta | LOJAS PREMIUM 🚀💙.vcf | 2026-03-09 | 2026-05-29 |
| Auto Peça Monte Santo | saude_medico | 2 | ja_listado | baixa | Auto Peça Monte Santo.vcf | 2026-03-14 | 2026-06-04 |
| Sueli Lanche | comida | 2 | nao_listado | alta | Sueli Lanche.vcf | 2026-03-15 | 2026-08-14 |
| Policia Militar Monte Santo | reparos_casa | 2 | nao_listado | baixa | Policia Militar Monte Santo.vcf | 2026-03-23 | 2026-05-12 |
| Tim Som | outros_servicos | 2 | nao_listado | alta | Tim Som.vcf | 2026-03-27 | 2026-04-13 |
| Neto Cartório | documentos_juridico | 2 | nao_listado | alta | Neto Cartório.vcf | 2026-03-31 | 2026-06-15 |
| Marta Marmita | transporte | 2 | ja_listado | media | Marta Marmita.vcf | 2025-08-31 | 2026-04-03 |
| Lanche Da Cleidiane | comida | 2 | nao_listado | media | Lanche Da Cleidiane.vcf | 2026-04-04 | 2026-07-06 |
| Ricardo Mudancas | transporte | 2 | nao_listado | media | Ricardo Mudancas.vcf | 2026-05-13 | 2026-08-11 |
| Bya Motorista Monte Santo | roupa_loja | 2 | nao_listado | baixa | Bya Motorista Monte Santo.vcf | 2026-05-13 | 2026-08-15 |
| Laura Pinto | construcao | 2 | nao_listado | baixa | Laura Pinto.vcf | 2026-05-16 | 2026-06-10 |
| Dsg Farmacia | saude_medico | 2 | nao_listado | media | Dsg Farmacia.vcf | 2026-04-21 | 2026-05-21 |
| Karina Dentista | saude_medico | 2 | nao_listado | media | Karina Dentista.vcf | 2025-10-07 | 2026-06-01 |
| Marcio Pamonha | comida | 2 | nao_listado | alta | Marcio Pamonha.vcf | 2026-06-05 | 2026-06-05 |
| Farmácia Da Bianca | saude_medico | 2 | nao_listado | baixa | Farmácia Da Bianca.vcf | 2026-05-10 | 2026-06-14 |
| Dsg Farma Monte Santo | saude_medico | 2 | ja_listado | baixa | Dsg Farma Monte Santo.vcf | 2026-06-19 | 2026-07-21 |
| Mundo da Criança | roupa_loja | 2 | ja_listado | baixa | Mundo da Criança.vcf | 2026-06-24 | 2026-07-13 |
| Med Imagem | beleza_estetica | 2 | nao_listado | baixa | Med Imagem.vcf | 2025-12-03 | 2026-06-28 |
| Rodriacqua Restaurante | comida | 2 | nao_listado | baixa | Rodriacqua Restaurante.vcf | 2026-06-30 | 2026-06-30 |
| Polícia De Monte Santo | beleza_estetica | 2 | nao_listado | baixa | Polícia De Monte Santo.vcf | 2026-08-10 | 2026-08-12 |
| Dj Net | outros_servicos | 2 | nao_listado | alta | DJ Net.vcf | 2025-10-10 | 2026-08-13 |
| Daniel Borracheiro | auto_mecanico | 2 | nao_listado | alta | Daniel Borracheiro.vcf | 2026-08-18 | 2026-08-18 |
| casa pequena p alugar pode | aluguel_imovel | 2 | nao_listado | baixa | — | 2025-06-21 | 2025-09-08 |
| uber corrida agora | transporte | 2 | nao_listado | baixa | — | 2025-06-21 | 2026-01-01 |
| loja meninas ali centro taty | roupa_loja | 2 | nao_listado | baixa | — | 2025-06-23 | 2025-07-05 |
| Ricardo marceneiro mundo novo | reparos_casa | 2 | nao_listado | baixa | — | 2025-06-24 | 2025-06-24 |
| loja utensílios lado mercado Tonin | roupa_loja | 2 | nao_listado | baixa | — | 2025-06-26 | 2026-08-06 |
| taxista corrida agora | transporte | 2 | nao_listado | baixa | — | 2025-06-26 | 2026-01-10 |
| limpeza sofá | servico_domestico | 2 | nao_listado | baixa | — | 2025-07-05 | 2025-09-11 |
| pintor | construcao | 2 | nao_listado | baixa | — | 2025-07-15 | 2026-07-13 |
| moço coisas shopee | transporte | 2 | nao_listado | baixa | — | 2025-07-22 | 2025-12-17 |
| me informar médicos pronto socorro | saude_medico | 2 | nao_listado | baixa | — | 2025-07-23 | 2026-03-17 |
| Encanador num | reparos_casa | 2 | nao_listado | baixa | — | 2025-07-28 | 2026-04-10 |
| casa quartos alugar | aluguel_imovel | 2 | nao_listado | baixa | — | 2025-07-30 | 2025-10-18 |
| Estou serviço faxineira souber me | transporte | 2 | nao_listado | baixa | — | 2025-08-01 | 2025-08-02 |
| horário vacinação contra raiva campo | saude_medico | 2 | nao_listado | baixa | — | 2025-08-03 | 2025-08-03 |
| Grupo cuidador idosos link | servico_domestico | 2 | nao_listado | baixa | — | 2025-08-03 | 2026-08-09 |
| psf jardim italiano | saude_medico | 2 | nao_listado | baixa | — | 2025-08-11 | 2026-07-01 |
| casa aluga souber me avise | transporte | 2 | nao_listado | baixa | — | 2025-08-11 | 2026-02-02 |
| médico PS | saude_medico | 2 | nao_listado | baixa | — | 2025-08-12 | 2025-08-25 |
| farmácia Juliana frente igreja Santos | saude_medico | 2 | nao_listado | baixa | — | 2025-08-17 | 2025-08-18 |
| aluga salão Belém | aluguel_imovel | 2 | nao_listado | baixa | — | 2025-08-19 | 2025-08-20 |
| pedreiro | reparos_casa | 2 | nao_listado | baixa | — | 2025-08-21 | 2026-05-14 |
| shopee | transporte | 2 | nao_listado | baixa | — | 2025-08-22 | 2026-01-31 |
| loja Império Móveis Mensagem editada | roupa_loja | 2 | nao_listado | baixa | — | 2025-09-03 | 2026-03-09 |
| serviço trabalhar morar local souber | transporte | 2 | nao_listado | baixa | — | 2025-09-07 | 2025-12-22 |
| casa alugar tiver me chama | aluguel_imovel | 2 | nao_listado | baixa | — | 2025-09-09 | 2026-02-13 |
| manicure faça esmaltação gel | beleza_estetica | 2 | nao_listado | baixa | — | 2025-09-11 | 2026-05-25 |
| me dizer Dr Felipe atende | saude_medico | 2 | nao_listado | baixa | — | 2025-09-12 | 2025-09-12 |
| Psf Ana Carolina | saude_medico | 2 | nao_listado | baixa | — | 2025-09-17 | 2026-08-13 |
| casa alugar não precisa ser | transporte | 2 | nao_listado | baixa | — | 2025-09-18 | 2026-05-11 |
| posto vacina Mensagem editada | saude_medico | 2 | nao_listado | baixa | — | 2025-09-11 | 2025-09-18 |
| hora postinho vacinação abre | saude_medico | 2 | nao_listado | baixa | — | 2025-09-29 | 2026-01-05 |
| Marcelo casa panelas adauto casa | roupa_loja | 2 | nao_listado | baixa | — | 2025-10-04 | 2025-10-04 |
| Xú tv Mensagem editada | reparos_casa | 2 | nao_listado | baixa | — | 2025-10-10 | 2026-03-16 |
| q frete q tenha caminhonete | transporte | 2 | nao_listado | baixa | — | 2025-10-14 | 2025-10-14 |
| Pessoal mamãe grupo Me pediu | saude_medico | 2 | nao_listado | baixa | — | 2025-10-16 | 2025-10-16 |
| sítio fazenda qe esteja trabalhar | transporte | 2 | nao_listado | baixa | — | 2025-10-20 | 2026-01-22 |
| tudo bem casa pequena alugar | aluguel_imovel | 2 | nao_listado | baixa | — | 2025-10-20 | 2026-01-08 |
| vendendo galinha frango caipira | auto_mecanico | 2 | nao_listado | baixa | — | 2025-10-22 | 2025-10-22 |
| barbeiro disponível amanhã | beleza_estetica | 2 | nao_listado | baixa | — | 2025-10-22 | 2026-04-10 |
| sabendo casa alugar | aluguel_imovel | 2 | nao_listado | baixa | — | 2025-10-27 | 2026-01-08 |
| fretes | transporte | 2 | nao_listado | baixa | — | 2025-11-03 | 2026-07-06 |
| decoração festa aniversário | outros_servicos | 2 | nao_listado | baixa | — | 2025-11-07 | 2026-07-15 |
| serviço pode ser empregada doméstica | servico_domestico | 2 | nao_listado | baixa | — | 2025-11-11 | 2026-07-13 |
| horas abre auto escola | educacao | 2 | nao_listado | baixa | — | 2025-12-01 | 2026-01-22 |
| ração escola Américo Paiva | educacao | 2 | nao_listado | baixa | — | 2025-12-25 | 2026-03-24 |
| táxi disponível | transporte | 2 | nao_listado | baixa | — | 2025-12-25 | 2025-12-31 |
| instala ar condicionado | reparos_casa | 2 | nao_listado | baixa | — | 2025-12-29 | 2026-08-15 |
| almoço companhia reis | comida | 2 | nao_listado | baixa | — | 2025-12-30 | 2026-01-06 |
| Bruno celular lado loja real | reparos_casa | 2 | nao_listado | baixa | — | 2025-12-31 | 2025-12-31 |
| lanchonete cachorro quente chapa | pet_veterinario | 2 | nao_listado | baixa | — | 2026-01-04 | 2026-07-04 |
| escola Objetivo | educacao | 2 | nao_listado | baixa | — | 2026-01-06 | 2026-01-06 |
| casa alugar grande | aluguel_imovel | 2 | nao_listado | baixa | — | 2026-01-12 | 2026-01-12 |
| me dizer q horas correio | comida | 2 | nao_listado | baixa | — | 2026-01-15 | 2026-06-20 |
| frete camionete | transporte | 2 | nao_listado | baixa | — | 2026-01-18 | 2026-01-18 |
| eu saquinho fazer pamonha | comida | 2 | nao_listado | baixa | — | 2026-01-21 | 2026-03-04 |
| shoop | transporte | 2 | nao_listado | baixa | — | 2026-01-22 | 2026-06-28 |
| casa alugar precisa muito minha | aluguel_imovel | 2 | nao_listado | baixa | — | 2026-01-24 | 2026-01-24 |
| roupas bebê menino doar | roupa_loja | 2 | nao_listado | baixa | — | 2026-01-25 | 2026-01-27 |
| me informa médico estará atendendo | saude_medico | 2 | nao_listado | baixa | — | 2026-01-26 | 2026-04-01 |
| me informar prefeitura fecha almoço | comida | 2 | nao_listado | baixa | — | 2026-01-27 | 2026-02-06 |
| aquele papel consta todos contatos | transporte | 2 | nao_listado | baixa | — | 2026-01-30 | 2026-01-30 |
| já chegou vacina dengue Monte | saude_medico | 2 | nao_listado | baixa | — | 2026-01-30 | 2026-03-30 |
| estou casa pequena alugar pessoa | aluguel_imovel | 2 | nao_listado | baixa | — | 2026-02-01 | 2026-08-03 |
| informar aonde doa roupa enxoval | roupa_loja | 2 | nao_listado | baixa | — | 2026-02-02 | 2026-02-02 |
| casa alugar urgência souber | transporte | 2 | nao_listado | baixa | — | 2026-02-04 | 2026-07-06 |
| mudança q tenha caminhão baú | transporte | 2 | nao_listado | baixa | — | 2026-02-06 | 2026-02-06 |
| lugar materiais construção frente padaria | comida | 2 | nao_listado | baixa | — | 2026-02-07 | 2026-02-07 |
| loja q vendi camiseta wb | roupa_loja | 2 | nao_listado | baixa | — | 2026-02-09 | 2026-02-09 |
| casa alugar quartos sala cozinha | aluguel_imovel | 2 | nao_listado | baixa | — | 2026-02-13 | 2026-05-13 |
| casa alugar casal | aluguel_imovel | 2 | nao_listado | baixa | — | 2026-02-14 | 2026-05-14 |
| sheim | transporte | 2 | nao_listado | baixa | — | 2026-02-26 | 2026-06-27 |
| filhote puldo doar | pet_veterinario | 2 | nao_listado | baixa | — | 2025-10-26 | 2026-02-27 |
| cachorrinho raça puldo doar | pet_veterinario | 2 | nao_listado | baixa | — | 2026-02-28 | 2026-02-28 |
| casa alugar souber der certo | transporte | 2 | nao_listado | baixa | — | 2026-03-14 | 2026-05-13 |
| Erlon lanche Mensagem editada | comida | 2 | nao_listado | baixa | — | 2026-04-01 | 2026-07-16 |
| psf rural ali Lucas Magalhães | saude_medico | 2 | nao_listado | baixa | — | 2026-04-30 | 2026-06-30 |
| empregada doméstica referência | servico_domestico | 2 | nao_listado | baixa | — | 2026-05-03 | 2026-08-02 |
| Oii uniformes escola objetivo anos | educacao | 2 | nao_listado | baixa | — | 2026-05-08 | 2026-05-08 |
| casa alugar pequena pessoa | aluguel_imovel | 2 | nao_listado | baixa | — | 2026-05-14 | 2026-07-22 |
| me dizer médico atende pronto | saude_medico | 2 | nao_listado | baixa | — | 2026-06-01 | 2026-06-19 |
| empregada doméstica | servico_domestico | 2 | nao_listado | baixa | — | 2026-06-15 | 2026-06-22 |
| Estou sapato menina menino sapato | roupa_loja | 2 | nao_listado | baixa | — | 2026-06-17 | 2026-06-17 |
| casa alugar tiver souber entre | transporte | 2 | nao_listado | baixa | — | 2026-06-21 | 2026-08-06 |
| casa alugar mesmo sítio | aluguel_imovel | 2 | nao_listado | baixa | — | 2026-06-25 | 2026-06-26 |
| van prime expoagro sexta lugares | transporte | 2 | nao_listado | baixa | — | 2026-06-29 | 2026-06-30 |
| diaaa casa alugar qualquer valor | aluguel_imovel | 2 | nao_listado | baixa | — | 2026-07-02 | 2026-07-10 |
| Estou procura casa alugar quarto | transporte | 2 | nao_listado | baixa | — | 2026-07-03 | 2026-07-03 |
| costureira proximidades primeiro maio Mensagem | servico_domestico | 2 | nao_listado | baixa | — | 2026-07-04 | 2026-07-04 |
| casa grande alugar | aluguel_imovel | 2 | nao_listado | baixa | — | 2026-07-23 | 2026-08-04 |
| médico pronto-socorro agora manhã | saude_medico | 2 | nao_listado | baixa | — | 2026-01-20 | 2026-08-12 |
| roupa friu doa | roupa_loja | 2 | nao_listado | baixa | — | 2025-07-30 | 2025-07-30 |
| postinho vacina horas ele fechar | saude_medico | 2 | nao_listado | baixa | — | 2025-08-08 | 2026-08-08 |
| me dizer postinho vacina agora | saude_medico | 2 | nao_listado | baixa | — | 2025-08-08 | 2025-09-08 |
| tênis menina doar | roupa_loja | 2 | nao_listado | baixa | — | 2025-08-19 | 2025-08-19 |
| roupa criança frio doar criança | roupa_loja | 2 | nao_listado | baixa | — | 2025-08-20 | 2026-07-06 |
| Estou roupas menina anos si | roupa_loja | 2 | nao_listado | baixa | — | 2025-12-09 | 2026-02-12 |
| cachorra porte pq doar | pet_veterinario | 2 | nao_listado | baixa | — | 2026-04-15 | 2026-06-18 |
