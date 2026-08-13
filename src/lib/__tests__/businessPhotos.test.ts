import { describe, expect, it } from "vitest";
import {
  PHOTO_PLACEHOLDER,
  getCuratedPhotos,
  parsePhotoList,
  resolveBusinessCover,
  resolveBusinessPhotos,
} from "@/lib/businessPhotos";

const PHOTO = "https://exemplo.com/fachada.jpg";
const OUTRA = "https://exemplo.com/interior.jpg";

describe("parsePhotoList", () => {
  it("aceita array de strings", () => {
    expect(parsePhotoList([PHOTO, OUTRA])).toEqual([PHOTO, OUTRA]);
  });

  it("aceita string única", () => {
    expect(parsePhotoList(PHOTO)).toEqual([PHOTO]);
  });

  it("aceita jsonb gravado como string de JSON", () => {
    expect(parsePhotoList(`["${PHOTO}"]`)).toEqual([PHOTO]);
  });

  it("aceita array de objetos do payload do Places", () => {
    expect(parsePhotoList([{ url: PHOTO }, { src: OUTRA }])).toEqual([
      PHOTO,
      OUTRA,
    ]);
  });

  it("aceita lista separada por vírgula", () => {
    expect(parsePhotoList(`${PHOTO}, ${OUTRA}`)).toEqual([PHOTO, OUTRA]);
  });

  it("não quebra uma URL única que contém vírgula", () => {
    const comVirgula =
      "https://maps.googleapis.com/staticmap?center=-20.8,-46.7";
    expect(parsePhotoList(comVirgula)).toEqual([comVirgula]);
  });

  it('descarta vazios, nulos e espaços — nada de <img src="">', () => {
    expect(parsePhotoList(["", "   ", null, undefined, PHOTO])).toEqual([
      PHOTO,
    ]);
  });

  it("descarta entradas repetidas", () => {
    expect(parsePhotoList([PHOTO, PHOTO])).toEqual([PHOTO]);
  });

  it("devolve lista vazia para valores sem foto", () => {
    expect(parsePhotoList(null)).toEqual([]);
    expect(parsePhotoList([])).toEqual([]);
    expect(parsePhotoList({})).toEqual([]);
    expect(parsePhotoList("[]")).toEqual([]);
  });
});

describe("resolveBusinessPhotos", () => {
  it("usa a capa gravada quando existe", () => {
    expect(resolveBusinessPhotos({ cover_images: [PHOTO] })).toEqual([PHOTO]);
  });

  it("lê as chaves de Place/Car/RealEstate (coverImage + gallery)", () => {
    expect(
      resolveBusinessPhotos({ coverImage: PHOTO, gallery: [OUTRA] }),
    ).toEqual([PHOTO, OUTRA]);
  });

  it("lê `images` dos classificados", () => {
    expect(resolveBusinessPhotos({ images: [PHOTO] })).toEqual([PHOTO]);
  });

  it("cai no logo quando não há foto de capa", () => {
    expect(
      resolveBusinessPhotos({ cover_images: [], logo_url: PHOTO }),
    ).toEqual([PHOTO]);
  });

  it("recupera a foto curada pelo nome quando a linha veio sem foto", () => {
    // "Haru Sushi" está no acervo de src/data/mockData.ts.
    const photos = resolveBusinessPhotos({
      name: "haru  sushi",
      cover_images: [],
    });

    expect(photos).toEqual(getCuratedPhotos("Haru Sushi"));
    expect(photos[0]).toMatch(/^https:\/\//);
  });

  it("termina no placeholder quando não há nada", () => {
    expect(
      resolveBusinessPhotos({ name: "Comércio Inexistente XPTO" }),
    ).toEqual([PHOTO_PLACEHOLDER]);
  });

  it("devolve lista vazia com fallbackToPlaceholder desligado", () => {
    expect(
      resolveBusinessPhotos(
        { name: "Comércio Inexistente XPTO" },
        { fallbackToPlaceholder: false },
      ),
    ).toEqual([]);
  });

  it("não consulta o acervo curado quando desligado", () => {
    expect(
      resolveBusinessPhotos(
        { name: "Haru Sushi" },
        { useCurated: false, fallbackToPlaceholder: false },
      ),
    ).toEqual([]);
  });

  it("aceita registro nulo", () => {
    expect(resolveBusinessPhotos(null)).toEqual([PHOTO_PLACEHOLDER]);
  });
});

describe("resolveBusinessCover", () => {
  it("devolve a primeira foto", () => {
    expect(resolveBusinessCover({ cover_images: [PHOTO, OUTRA] })).toBe(PHOTO);
  });

  it("devolve o placeholder quando não há foto", () => {
    expect(resolveBusinessCover({ name: "Sem Foto XPTO" })).toBe(
      PHOTO_PLACEHOLDER,
    );
  });
});
