/**
 * Tradução dos tipos de lugar do Google (`primaryTypeDisplayName`) para pt-BR.
 *
 * A coleta atual já pede `languageCode: "pt-BR"` ao Google, então registros
 * novos chegam traduzidos. Este mapa existe para a base carregada antes disso:
 * 343 comércios ficaram com a descrição no formato
 * "Beauty salon em Centro. Nota: 4.400000 (21 avaliações)." — tipo em inglês e
 * nota com seis casas decimais.
 *
 * As chaves são comparadas em minúsculas, então a caixa aqui não importa.
 */
const TYPE_TRANSLATIONS = {
  "accountant": "Contador",
  "accounting firm": "Escritório de contabilidade",
  "aluminum supplier": "Fornecedor de alumínio",
  "antenna service": "Serviço de antenas",
  "asian restaurant": "Restaurante asiático",
  "association / organization": "Associação / organização",
  "auto broker": "Revenda de veículos",
  "auto electrical service": "Auto elétrica",
  "auto parts store": "Loja de autopeças",
  "auto repair shop": "Oficina mecânica",
  "auto tag agency": "Despachante",
  "automobile storage facility": "Estacionamento de veículos",
  "bakery": "Padaria",
  "bar": "Bar",
  "barber shop": "Barbearia",
  "bathroom supply store": "Loja de materiais para banheiro",
  "beauty salon": "Salão de beleza",
  "beauty supply store": "Loja de cosméticos",
  "bicycle store": "Loja de bicicletas",
  "building equipment hire service": "Locação de equipamentos para construção",
  "building materials store": "Loja de materiais de construção",
  "burglar alarm store": "Loja de alarmes",
  "bus stop": "Ponto de ônibus",
  "butcher shop": "Açougue",
  "cafeteria": "Cafeteria",
  "car dealer": "Concessionária",
  "car inspection station": "Vistoria veicular",
  "car repair and maintenance service": "Oficina mecânica",
  "car wash": "Lava-rápido",
  "cemetery": "Cemitério",
  "certified public accountant": "Contador",
  "city or town hall": "Prefeitura",
  "city park": "Parque municipal",
  "clothing store": "Loja de roupas",
  "cocktail bar": "Bar de coquetéis",
  "coffee shop": "Cafeteria",
  "community garden": "Horta comunitária",
  "computer repair service": "Assistência técnica de informática",
  "construction company": "Construtora",
  "convenience store": "Loja de conveniência",
  "corporate office": "Escritório",
  "county government office": "Órgão público municipal",
  "courthouse": "Fórum",
  "debt collection agency": "Empresa de cobrança",
  "department store": "Loja de departamentos",
  "designer clothing store": "Loja de roupas",
  "drug store": "Drogaria",
  "earth works company": "Empresa de terraplenagem",
  "ecological park": "Parque ecológico",
  "electrical installation service": "Instalações elétricas",
  "electrical substation": "Subestação elétrica",
  "electrician": "Eletricista",
  "electronics store": "Loja de eletrônicos",
  "employment agency": "Agência de empregos",
  "family law attorney": "Advogado de família",
  "farm": "Fazenda",
  "fashion accessories store": "Loja de acessórios",
  "financial institution": "Instituição financeira",
  "florist": "Floricultura",
  "furniture store": "Loja de móveis",
  "garden": "Jardim",
  "gas station": "Posto de combustível",
  "general hospital": "Hospital",
  "general store": "Loja de variedades",
  "grocery store": "Mercearia",
  "gym": "Academia",
  "hair salon": "Salão de beleza",
  "hamburger restaurant": "Hamburgueria",
  "hiking area": "Área de trilha",
  "home goods store": "Loja de utilidades domésticas",
  "hot dog restaurant": "Lanchonete",
  "hotel": "Hotel",
  "housing society": "Associação de moradores",
  "ice cream shop": "Sorveteria",
  "industrial equipment supplier": "Fornecedor de equipamentos industriais",
  "inn": "Pousada",
  "internet service provider": "Provedor de internet",
  "japanized western restaurant": "Restaurante",
  "jewelry store": "Joalheria",
  "labor relations attorney": "Advogado trabalhista",
  "labor union": "Sindicato",
  "lawyer": "Advogado",
  "legal services": "Serviços jurídicos",
  "linens store": "Loja de cama, mesa e banho",
  "liquor store": "Adega",
  "locksmith": "Chaveiro",
  "lottery retailer": "Lotérica",
  "lounge": "Lounge",
  "market": "Mercado",
  "mechanic": "Mecânico",
  "medical center": "Centro médico",
  "metalwork": "Serralheria",
  "nail salon": "Manicure",
  "nature preserve": "Reserva natural",
  "night club": "Casa noturna",
  "optician": "Ótica",
  "outerwear store": "Loja de roupas",
  "paint store": "Loja de tintas",
  "park": "Parque",
  "parking lot": "Estacionamento",
  "party equipment rental service": "Locação de materiais para festas",
  "pet groomer": "Banho e tosa",
  "pet store": "Pet shop",
  "pharmaceutical company": "Empresa farmacêutica",
  "pharmacy": "Farmácia",
  "pizza restaurant": "Pizzaria",
  "prison": "Presídio",
  "real estate agency": "Imobiliária",
  "reptile store": "Loja de animais",
  "restaurant": "Restaurante",
  "sambodrome": "Sambódromo",
  "sewage disposal service": "Serviço de esgoto",
  "shoe factory": "Fábrica de calçados",
  "shoe store": "Loja de calçados",
  "snack bar": "Lanchonete",
  "stand bar": "Bar",
  "state government office": "Órgão público estadual",
  "store": "Loja",
  "supermarket": "Supermercado",
  "tapas bar": "Bar",
  "taxi service": "Serviço de táxi",
  "telecommunications service provider": "Operadora de telecomunicações",
  "tire shop": "Borracharia",
  "tool store": "Loja de ferramentas",
  "toolroom": "Ferramentaria",
  "tourist attraction": "Atração turística",
  "towing service": "Serviço de guincho",
  "uniform store": "Loja de uniformes",
  "urgent care center": "Pronto atendimento",
  "used car dealer": "Revenda de carros usados",
  "veterinarian": "Veterinário",
  "wheel alignment service": "Alinhamento e balanceamento",
  "wine storage facility": "Adega",
  "wine store": "Adega",
  "youth clothing store": "Loja de roupas infantis",
};

export { TYPE_TRANSLATIONS };

/**
 * Traduz um tipo do Google. Devolve `null` quando o termo não está no mapa —
 * o chamador decide se mantém o original ou reporta para tradução manual, em
 * vez de gravar um palpite errado no banco.
 */
export function translateGoogleType(type) {
  const key = String(type ?? "").trim().toLowerCase();
  if (!key) return null;
  return TYPE_TRANSLATIONS[key] ?? null;
}

/** true quando o texto já parece pt-BR (está do lado direito do mapa). */
export function isTranslatedType(type) {
  const value = String(type ?? "").trim().toLowerCase();
  if (!value) return false;
  return Object.values(TYPE_TRANSLATIONS).some((pt) => pt.toLowerCase() === value);
}
