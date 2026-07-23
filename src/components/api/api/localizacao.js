const MOEDAS_POR_PAIS = {
  BR: "BRL",

  US: "USD",
  PR: "USD",
  EC: "USD",
  SV: "USD",
  PA: "USD",
  TL: "USD",

  AT: "EUR",
  BE: "EUR",
  HR: "EUR",
  CY: "EUR",
  EE: "EUR",
  FI: "EUR",
  FR: "EUR",
  DE: "EUR",
  GR: "EUR",
  IE: "EUR",
  IT: "EUR",
  LV: "EUR",
  LT: "EUR",
  LU: "EUR",
  MT: "EUR",
  NL: "EUR",
  PT: "EUR",
  SK: "EUR",
  SI: "EUR",
  ES: "EUR",
};

function obterPaisDaRequisicao(request) {
  const paisPelaVercel =
    request.headers["x-vercel-ip-country"];

  if (Array.isArray(paisPelaVercel)) {
    return paisPelaVercel[0]?.toUpperCase() || "";
  }

  if (typeof paisPelaVercel === "string") {
    return paisPelaVercel.toUpperCase();
  }

  return "";
}

export default function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({
      erro: "Método não permitido.",
    });
  }

  const pais = obterPaisDaRequisicao(request);

  const moeda =
    MOEDAS_POR_PAIS[pais] || "BRL";

  return response.status(200).json({
    pais: pais || "DESCONHECIDO",
    moeda,
    detectadoAutomaticamente: Boolean(pais),
  });
}