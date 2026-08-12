import { describe, expect, it } from "vitest";

import {
  classifyError,
  normalizeCityName,
  parseArgs,
  resolveApiKey,
  toCsv,
  toRecord,
} from "../collect-places.mjs";

describe("parseArgs", () => {
  it("usa Monte Santo de Minas e 40 categorias por padrão", () => {
    const options = parseArgs([]);
    expect(options.errors).toEqual([]);
    expect(options.cities).toEqual(["Monte Santo de Minas - MG"]);
    expect(options.categories.length).toBeGreaterThan(30);
    expect(options.outDir).toBe("data/places");
    expect(options.maxPages).toBe(3);
    expect(options.dryRun).toBe(false);
  });

  it("aceita listas separadas por vírgula e apara espaços", () => {
    const options = parseArgs(['--cities=Arceburgo - MG, Itamogi - MG', "--categories=padarias, farmácias"]);
    expect(options.cities).toEqual(["Arceburgo - MG", "Itamogi - MG"]);
    expect(options.categories).toEqual(["padarias", "farmácias"]);
  });

  it("recusa flag desconhecida em vez de ignorar o typo", () => {
    const options = parseArgs(["--city=Arceburgo - MG"]);
    expect(options.errors.join(" ")).toContain("--city");
  });

  it("recusa --max-pages fora do intervalo aceito pela API", () => {
    expect(parseArgs(["--max-pages=9"]).errors.join(" ")).toContain("--max-pages");
    expect(parseArgs(["--max-pages=abc"]).errors.join(" ")).toContain("--max-pages");
    expect(parseArgs(["--max-pages=1"]).errors).toEqual([]);
  });

  it("reconhece as flags booleanas", () => {
    expect(parseArgs(["--dry-run"]).dryRun).toBe(true);
    expect(parseArgs(["--help"]).help).toBe(true);
  });
});

describe("resolveApiKey", () => {
  it("prefere a variável do shell e nem lê os arquivos .env", () => {
    let loaded = false;
    const result = resolveApiKey({ GOOGLE_MAPS_API_KEY: "do-shell" }, () => {
      loaded = true;
    });
    expect(result).toMatchObject({ key: "do-shell", source: "ambiente", isFrontendKey: false });
    expect(loaded).toBe(false);
  });

  it("cai para o .env.local quando o shell não tem a chave", () => {
    const env = {};
    const result = resolveApiKey(env, () => {
      env.GOOGLE_MAPS_API_KEY = "do-arquivo";
    });
    expect(result).toMatchObject({ key: "do-arquivo", source: ".env.local" });
  });

  it("marca a chave do front-end para avisar sobre restrição de referenciador", () => {
    const result = resolveApiKey({ VITE_GOOGLE_MAPS_API_KEY: "chave-do-front" }, () => {});
    expect(result).toMatchObject({ key: "chave-do-front", isFrontendKey: true });
  });

  it("devolve chave vazia quando não há nada configurado", () => {
    expect(resolveApiKey({}, () => {}).key).toBe("");
  });
});

describe("classifyError", () => {
  const googleError = (status, message) =>
    JSON.stringify({ error: { code: status, message, status: "PERMISSION_DENIED" } });

  it("trata chave inválida como fatal", () => {
    const error = classifyError(400, googleError(400, "API key not valid. Please pass a valid API key."));
    expect(error.fatal).toBe(true);
    expect(error.retryable).toBe(false);
    expect(error.hint).toContain("GOOGLE_MAPS_API_KEY");
  });

  it("explica bloqueio por referenciador HTTP", () => {
    const error = classifyError(403, googleError(403, "Requests from referer <empty> are blocked."));
    expect(error.fatal).toBe(true);
    expect(error.hint).toContain("referenciador");
  });

  it("explica API não ativada no projeto", () => {
    const error = classifyError(
      403,
      googleError(403, "Places API (New) has not been used in project 123 before or it is disabled."),
    );
    expect(error.fatal).toBe(true);
    expect(error.hint).toContain("Places API (New)");
  });

  it("marca 429 e 5xx como retryáveis, não fatais", () => {
    expect(classifyError(429, googleError(429, "Quota exceeded"))).toMatchObject({
      retryable: true,
      fatal: false,
    });
    expect(classifyError(503, googleError(503, "backend error"))).toMatchObject({
      retryable: true,
      fatal: false,
    });
  });

  it("não quebra com corpo de resposta que não é JSON", () => {
    const error = classifyError(500, "<html>Service Unavailable</html>");
    expect(error.retryable).toBe(true);
    expect(error.message).toContain("Service Unavailable");
  });
});

describe("normalizeCityName", () => {
  it("remove acentos, caixa e o sufixo do estado", () => {
    expect(normalizeCityName("Monte Santo de Minas - MG")).toBe("monte santo de minas");
    expect(normalizeCityName("GUARANÉSIA")).toBe("guaranesia");
    expect(normalizeCityName("São Sebastião do Paraíso - mg")).toBe("sao sebastiao do paraiso");
  });
});

describe("toRecord", () => {
  const place = {
    id: "ChIJexemplo",
    displayName: { text: "Padaria Central" },
    formattedAddress: "Rua A, 100 - Monte Santo de Minas - MG",
    addressComponents: [
      { longText: "Monte Santo de Minas", types: ["locality"] },
      { longText: "Centro Histórico", types: ["sublocality_level_1"] },
    ],
    location: { latitude: -21.19, longitude: -46.99 },
    nationalPhoneNumber: "(35) 3591-0000",
    regularOpeningHours: { weekdayDescriptions: ["segunda-feira: 07:00–19:00", "terça-feira: 07:00–19:00"] },
    types: ["bakery", "food"],
  };

  it("mapeia os campos da API para as colunas do CSV", () => {
    const record = toRecord(place, "Monte Santo de Minas - MG", "padarias");
    expect(record).toMatchObject({
      google_place_id: "ChIJexemplo",
      name: "Padaria Central",
      city: "Monte Santo de Minas",
      neighborhood: "Centro Histórico",
      search_category: "padarias",
      category_hint: "padarias",
      phone: "(35) 3591-0000",
      types: "bakery|food",
    });
    expect(record.hours).toBe("segunda-feira: 07:00–19:00; terça-feira: 07:00–19:00");
    expect(record.whatsapp).toBe(""); // preenchido só na revisão manual
  });

  it("usa Centro quando o Google não sabe o bairro e a cidade da busca como fallback", () => {
    const record = toRecord({ id: "x", displayName: { text: "Loja" } }, "Arceburgo - MG", "lojas");
    expect(record.neighborhood).toBe("Centro");
    expect(record.city).toBe("Arceburgo");
  });
});

describe("toCsv", () => {
  it("usa ponto e vírgula como separador e escapa o que precisa", () => {
    const csv = toCsv([{ name: 'Bar "do Zé"', address: "Rua A, 100", hours: "seg: 8h\nter: 8h" }]);
    const [header, row] = csv.split("\n");
    expect(header).toBe("name;address;hours");
    expect(row).toContain('"Bar ""do Zé"""');
    expect(row).toContain('"Rua A, 100"');
    expect(csv).toContain('"seg: 8h\nter: 8h"');
  });

  it("devolve string vazia sem registros", () => {
    expect(toCsv([])).toBe("");
  });
});
