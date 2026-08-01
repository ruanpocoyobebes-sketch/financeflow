const TERMOS_IGNORADOS_NO_NOME = [
  "CNPJ",
  "CPF",
  "NOTA FISCAL",
  "CUPOM FISCAL",
  "DOCUMENTO AUXILIAR",
  "DANFE",
  "NFC E",
  "EXTRATO",
  "CONSUMIDOR",
  "ENDERECO",
  "TELEFONE",
  "OBRIGADO",
  "EMISSAO",
  "CHAVE DE ACESSO",
];

const REGRAS_CATEGORIA = [
  {
    categoria: "Alimentação",
    termos: [
      "SUPERMERCADO",
      "MERCADO",
      "MERCEARIA",
      "RESTAURANTE",
      "LANCHONETE",
      "PADARIA",
      "AÇOUGUE",
      "ALIMENTO",
      "REFEICAO",
      "PIZZARIA",
      "IFOOD",
    ],
  },
  {
    categoria: "Transporte",
    termos: [
      "POSTO",
      "COMBUSTIVEL",
      "GASOLINA",
      "ETANOL",
      "DIESEL",
      "UBER",
      "TAXI",
      "ESTACIONAMENTO",
      "PASSAGEM",
    ],
  },
  {
    categoria: "Saúde",
    termos: [
      "FARMACIA",
      "DROGARIA",
      "CLINICA",
      "HOSPITAL",
      "LABORATORIO",
      "MEDICAMENTO",
    ],
  },
  {
    categoria: "Educação",
    termos: [
      "ESCOLA",
      "FACULDADE",
      "CURSO",
      "LIVRARIA",
      "PAPELARIA",
      "MENSALIDADE ESCOLAR",
    ],
  },
  {
    categoria: "Moradia",
    termos: [
      "ALUGUEL",
      "CONDOMINIO",
      "MATERIAL DE CONSTRUCAO",
      "CONSTRUCAO",
    ],
  },
  {
    categoria: "Contas",
    termos: [
      "ENERGIA",
      "ELETRICIDADE",
      "AGUA",
      "INTERNET",
      "TELEFONE",
      "FATURA",
    ],
  },
  {
    categoria: "Assinaturas",
    termos: [
      "ASSINATURA",
      "NETFLIX",
      "SPOTIFY",
      "AMAZON PRIME",
      "DISNEY PLUS",
    ],
  },
  {
    categoria: "Lazer",
    termos: [
      "CINEMA",
      "TEATRO",
      "PARQUE",
      "INGRESSO",
      "SHOW",
    ],
  },
  {
    categoria: "Compras",
    termos: [
      "LOJA",
      "MAGAZINE",
      "SHOPPING",
      "VESTUARIO",
      "CALCADOS",
      "ROUPAS",
    ],
  },
];

function removerAcentos(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function converterValor(valor) {
  const limpo = String(valor || "")
    .replace(/\s/g, "")
    .replace(/[^\d.,]/g, "");

  let normalizado = limpo;

  if (limpo.includes(",")) {
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  } else {
    const partes = limpo.split(".");

    if (partes.length > 2) {
      const centavos = partes.pop();
      normalizado = `${partes.join("")}.${centavos}`;
    }
  }

  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : 0;
}

function extrairValoresDaLinha(linha) {
  const valores = [];
  const padrao = /(?:^|[^\d])(?:R\s*\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[,.]\d{2})(?!\d)/gi;
  let resultado = padrao.exec(linha);

  while (resultado) {
    const valor = converterValor(resultado[1]);

    if (valor > 0 && valor < 10000000) {
      valores.push(valor);
    }

    resultado = padrao.exec(linha);
  }

  return valores;
}

function pontuarLinhaDeTotal(linha, indice, quantidadeLinhas) {
  const normalizada = removerAcentos(linha);
  let pontos = (indice / Math.max(quantidadeLinhas, 1)) * 15;

  if (normalizada.includes("TOTAL A PAGAR")) pontos += 150;
  else if (normalizada.includes("VALOR TOTAL")) pontos += 145;
  else if (normalizada.includes("TOTAL LIQUIDO")) pontos += 140;
  else if (/\bTOTAL\b/.test(normalizada)) pontos += 120;
  else if (normalizada.includes("VALOR PAGO")) pontos += 110;
  else if (/\bPAGAR\b/.test(normalizada)) pontos += 95;

  if (normalizada.includes("SUBTOTAL")) pontos -= 100;
  if (normalizada.includes("TROCO")) pontos -= 130;
  if (normalizada.includes("DESCONTO")) pontos -= 90;
  if (/\b(ICMS|TRIBUTO|IMPOSTO|TAXA)\b/.test(normalizada)) pontos -= 80;
  if (/\b(UNIT|UNITARIO|QTD|QUANTIDADE)\b/.test(normalizada)) pontos -= 50;

  return pontos;
}

function extrairValorTotal(linhas) {
  const candidatos = [];

  linhas.forEach((linha, indice) => {
    const valores = extrairValoresDaLinha(linha);
    const pontosBase = pontuarLinhaDeTotal(
      linha,
      indice,
      linhas.length
    );

    valores.forEach((valor, posicao) => {
      candidatos.push({
        valor,
        pontos: pontosBase + posicao * 2,
      });
    });

    if (valores.length === 0 && /\bTOTAL\b/i.test(removerAcentos(linha))) {
      const inteiros = linha.match(/\b\d{1,7}\b/g) || [];

      inteiros.forEach((numero) => {
        const valor = Number(numero);

        if (valor > 0) {
          candidatos.push({
            valor,
            pontos: pontosBase - 15,
          });
        }
      });
    }
  });

  if (candidatos.length === 0) {
    return { valor: 0, confianca: "baixa" };
  }

  const candidatosComRotulo = candidatos
    .filter((item) => item.pontos >= 80)
    .sort((a, b) => b.pontos - a.pontos || b.valor - a.valor);

  if (candidatosComRotulo.length > 0) {
    return {
      valor: candidatosComRotulo[0].valor,
      confianca: candidatosComRotulo[0].pontos >= 120 ? "alta" : "média",
    };
  }

  const maiorValor = candidatos.reduce(
    (maior, item) => (item.valor > maior ? item.valor : maior),
    0
  );

  return { valor: maiorValor, confianca: "baixa" };
}

function formatarNomeEstabelecimento(linha) {
  const nome = linha
    .replace(/[^\p{L}\p{N}&.'’\- ]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);

  if (!nome || nome !== nome.toUpperCase()) {
    return nome;
  }

  return nome
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s|[-'])\p{L}/gu, (letra) => letra.toLocaleUpperCase("pt-BR"));
}

function extrairNomeEstabelecimento(linhas) {
  const candidatas = linhas
    .slice(0, 14)
    .map((linha, indice) => {
      const normalizada = removerAcentos(linha);
      const letras = (linha.match(/\p{L}/gu) || []).length;
      const temTermoIgnorado = TERMOS_IGNORADOS_NO_NOME.some((termo) =>
        normalizada.includes(termo)
      );
      const pareceEndereco = /^(RUA|AVENIDA|AV\.?|RODOVIA|ESTRADA)\b/.test(
        normalizada
      );

      if (
        temTermoIgnorado ||
        pareceEndereco ||
        letras < 3 ||
        linha.length < 3 ||
        linha.length > 80 ||
        letras / linha.length < 0.35
      ) {
        return null;
      }

      let pontos = 60 - indice * 3;

      if (/\b(LTDA|ME|EIRELI|MERCADO|LOJA|RESTAURANTE|FARMACIA|DROGARIA|POSTO)\b/.test(normalizada)) {
        pontos += 30;
      }

      if (linha === linha.toUpperCase()) pontos += 8;
      if (extrairValoresDaLinha(linha).length > 0) pontos -= 45;

      return { linha, pontos };
    })
    .filter(Boolean)
    .sort((a, b) => b.pontos - a.pontos);

  if (candidatas.length === 0) {
    return {
      descricao: "Compra em nota fiscal",
      confianca: "baixa",
    };
  }

  return {
    descricao: formatarNomeEstabelecimento(candidatas[0].linha),
    confianca: candidatas[0].pontos >= 75 ? "alta" : "média",
  };
}

function sugerirCategoria(texto) {
  const normalizado = removerAcentos(texto);

  const regra = REGRAS_CATEGORIA.find(({ termos }) =>
    termos.some((termo) => normalizado.includes(removerAcentos(termo)))
  );

  return regra?.categoria || "Outros";
}

export function extrairDadosNota(texto) {
  const linhas = String(texto || "")
    .split(/\r?\n/)
    .map((linha) => linha.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const nome = extrairNomeEstabelecimento(linhas);
  const total = extrairValorTotal(linhas);

  return {
    descricao: nome.descricao,
    valor: total.valor,
    categoria: sugerirCategoria(texto),
    confiancaDescricao: nome.confianca,
    confiancaValor: total.confianca,
  };
}

export function converterValorDigitado(valor) {
  return converterValor(valor);
}
