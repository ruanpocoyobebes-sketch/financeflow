import { useEffect, useRef, useState } from "react";
import {
  FaCamera,
  FaCheckCircle,
  FaReceipt,
  FaRedo,
  FaTimes,
} from "react-icons/fa";

import { useFinance } from "../context/FinanceContext";
import { useSettings } from "../context/SettingsContext";
import {
  converterValorDigitado,
  extrairDadosNota,
} from "../utils/receiptParser";

const CATEGORIAS_DESPESA = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Contas",
  "Assinaturas",
  "Outros",
];

const ETAPAS_LEITURA = {
  "loading tesseract core": {
    texto: "Preparando o leitor...",
    inicio: 5,
    intervalo: 12,
  },
  "loading language traineddata": {
    texto: "Carregando o idioma...",
    inicio: 17,
    intervalo: 28,
  },
  "initializing api": {
    texto: "Analisando a imagem...",
    inicio: 45,
    intervalo: 10,
  },
  "recognizing text": {
    texto: "Lendo os dados da nota...",
    inicio: 55,
    intervalo: 45,
  },
};

function formatarValorParaCampo(valor) {
  if (!valor) return "";

  return Number(valor).toFixed(2).replace(".", ",");
}

function carregarImagemFallback(arquivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const imagem = new Image();

    imagem.onload = () => {
      URL.revokeObjectURL(url);
      resolve(imagem);
    };

    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível abrir a imagem."));
    };

    imagem.src = url;
  });
}

async function prepararImagem(arquivo) {
  let imagem;

  if (typeof createImageBitmap === "function") {
    try {
      imagem = await createImageBitmap(arquivo, {
        imageOrientation: "from-image",
      });
    } catch {
      imagem = await carregarImagemFallback(arquivo);
    }
  } else {
    imagem = await carregarImagemFallback(arquivo);
  }

  const larguraOriginal = imagem.width || imagem.naturalWidth;
  const alturaOriginal = imagem.height || imagem.naturalHeight;
  const maiorLado = Math.max(larguraOriginal, alturaOriginal);
  const escala = Math.min(2200 / maiorLado, 1);
  const largura = Math.max(1, Math.round(larguraOriginal * escala));
  const altura = Math.max(1, Math.round(alturaOriginal * escala));
  const canvas = document.createElement("canvas");
  const contexto = canvas.getContext("2d", { willReadFrequently: true });

  if (!contexto) {
    throw new Error("O navegador não conseguiu preparar a foto.");
  }

  canvas.width = largura;
  canvas.height = altura;
  contexto.fillStyle = "#ffffff";
  contexto.fillRect(0, 0, largura, altura);
  contexto.filter = "grayscale(1) contrast(1.25)";
  contexto.drawImage(imagem, 0, 0, largura, altura);

  if (typeof imagem.close === "function") {
    imagem.close();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Não foi possível preparar a foto."));
      },
      "image/jpeg",
      0.92
    );
  });
}

function ReceiptScanner() {
  const { adicionarDespesa } = useFinance();
  const { cores } = useSettings();
  const inputRef = useRef(null);
  const workerRef = useRef(null);
  const leituraIdRef = useRef(0);
  const imagemUrlRef = useRef("");
  const feedbackTimerRef = useRef(null);
  const salvandoRef = useRef(false);

  const [aberto, setAberto] = useState(false);
  const [imagemUrl, setImagemUrl] = useState("");
  const [processando, setProcessando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [etapa, setEtapa] = useState("Preparando a foto...");
  const [erro, setErro] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Outros");
  const [textoExtraido, setTextoExtraido] = useState("");
  const [confiancaValor, setConfiancaValor] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    return () => {
      leituraIdRef.current += 1;
      workerRef.current?.terminate();

      if (imagemUrlRef.current) {
        URL.revokeObjectURL(imagemUrlRef.current);
      }

      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!aberto) return undefined;

    function fecharComEscape(evento) {
      if (evento.key === "Escape") {
        fecharScanner();
      }
    }

    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [aberto]);

  function abrirCamera() {
    if (!inputRef.current) return;

    inputRef.current.value = "";
    inputRef.current.click();
  }

  function atualizarImagemUrl(arquivo) {
    if (imagemUrlRef.current) {
      URL.revokeObjectURL(imagemUrlRef.current);
    }

    const novaUrl = URL.createObjectURL(arquivo);
    imagemUrlRef.current = novaUrl;
    setImagemUrl(novaUrl);
  }

  function atualizarProgresso(mensagem, leituraId) {
    if (leituraId !== leituraIdRef.current) return;

    const configuracao = ETAPAS_LEITURA[mensagem.status];

    if (!configuracao) return;

    const percentualEtapa = Number(mensagem.progress || 0);
    const percentual = Math.round(
      configuracao.inicio + configuracao.intervalo * percentualEtapa
    );

    setEtapa(configuracao.texto);
    setProgresso((atual) => Math.max(atual, percentual));
  }

  async function processarNota(arquivo) {
    const leituraId = leituraIdRef.current + 1;
    let worker = null;
    leituraIdRef.current = leituraId;

    setAberto(true);
    setProcessando(true);
    setProgresso(2);
    setEtapa("Preparando a foto...");
    setErro("");
    setDescricao("");
    setValor("");
    setCategoria("Outros");
    setTextoExtraido("");
    setConfiancaValor("");
    salvandoRef.current = false;
    atualizarImagemUrl(arquivo);

    try {
      const imagemPreparada = await prepararImagem(arquivo);

      if (leituraId !== leituraIdRef.current) return;

      const { createWorker, OEM } = await import("tesseract.js");
      worker = await createWorker("por", OEM.LSTM_ONLY, {
        logger: (mensagem) => atualizarProgresso(mensagem, leituraId),
      });

      if (leituraId !== leituraIdRef.current) {
        await worker.terminate();
        return;
      }

      workerRef.current = worker;
      const resultado = await worker.recognize(imagemPreparada);
      const texto = resultado.data.text || "";

      if (leituraId !== leituraIdRef.current) return;

      const dados = extrairDadosNota(texto);

      setTextoExtraido(texto.trim());
      setDescricao(dados.descricao);
      setValor(formatarValorParaCampo(dados.valor));
      setCategoria(dados.categoria);
      setConfiancaValor(dados.confiancaValor);
      setProgresso(100);

      if (!texto.trim()) {
        setErro(
          "Não encontrei texto na foto. Tente novamente com mais luz ou preencha os dados manualmente."
        );
      } else if (!dados.valor) {
        setErro(
          "O texto foi lido, mas o valor total não ficou claro. Confira e digite o valor antes de adicionar."
        );
      }
    } catch (falha) {
      if (leituraId !== leituraIdRef.current) return;

      console.error("Erro ao ler a nota fiscal:", falha);
      setErro(
        "Não consegui ler esta foto automaticamente. Você ainda pode preencher os dados abaixo ou tirar outra foto."
      );
    } finally {
      if (leituraId === leituraIdRef.current) {
        setProcessando(false);
      }

      if (worker) {
        try {
          await worker.terminate();
        } catch {
          // O worker pode já ter sido encerrado ao fechar o scanner.
        }
      }

      if (workerRef.current === worker) {
        workerRef.current = null;
      }
    }
  }

  function selecionarArquivo(evento) {
    const arquivo = evento.target.files?.[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      setAberto(true);
      setErro("Escolha uma foto válida da nota fiscal.");
      return;
    }

    if (arquivo.size > 20 * 1024 * 1024) {
      setAberto(true);
      setErro("A foto deve ter no máximo 20 MB.");
      return;
    }

    processarNota(arquivo);
  }

  function fecharScanner() {
    leituraIdRef.current += 1;
    workerRef.current?.terminate();
    workerRef.current = null;

    if (imagemUrlRef.current) {
      URL.revokeObjectURL(imagemUrlRef.current);
      imagemUrlRef.current = "";
      setImagemUrl("");
    }

    setAberto(false);
    setProcessando(false);
  }

  function mostrarFeedback(mensagem) {
    setFeedback(mensagem);

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }

    feedbackTimerRef.current = setTimeout(() => {
      setFeedback("");
    }, 4500);
  }

  function adicionarNotaComoDespesa() {
    if (salvandoRef.current) return;

    const descricaoLimpa = descricao.trim();
    const valorNumero = converterValorDigitado(valor);

    if (!descricaoLimpa) {
      setErro("Informe o nome do gasto ou do estabelecimento.");
      return;
    }

    if (!valorNumero || valorNumero <= 0) {
      setErro("Informe um valor válido para a despesa.");
      return;
    }

    salvandoRef.current = true;
    adicionarDespesa(descricaoLimpa, valorNumero, categoria);
    fecharScanner();
    mostrarFeedback(
      `Despesa “${descricaoLimpa}” adicionada com sucesso.`
    );
  }

  const campo = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 12,
    border: `1px solid ${cores.borda}`,
    background: cores.fundoSecundario,
    color: cores.texto,
    outline: "none",
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={selecionarArquivo}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      <button
        type="button"
        className="mobile-full-button receipt-scanner-button"
        onClick={abrirCamera}
      >
        <FaCamera aria-hidden="true" />
        Escanear nota fiscal
      </button>

      {feedback && (
        <div className="receipt-scanner-toast" role="status">
          <FaCheckCircle aria-hidden="true" />
          {feedback}
        </div>
      )}

      {aberto && (
        <div
          className="receipt-scanner-overlay"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              fecharScanner();
            }
          }}
        >
          <section
            className="receipt-scanner-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-scanner-title"
            style={{
              background: cores.painel,
              border: `1px solid ${cores.borda}`,
              boxShadow: cores.sombra,
              color: cores.texto,
            }}
          >
            <header className="receipt-scanner-header">
              <div className="receipt-scanner-heading">
                <span className="receipt-scanner-icon" aria-hidden="true">
                  <FaReceipt />
                </span>

                <div>
                  <h2 id="receipt-scanner-title">Scanner de nota fiscal</h2>
                  <p style={{ color: cores.textoSecundario }}>
                    Confira os dados reconhecidos antes de adicionar a despesa.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="receipt-scanner-close"
                onClick={fecharScanner}
                aria-label="Fechar scanner"
                style={{ color: cores.textoSecundario }}
              >
                <FaTimes />
              </button>
            </header>

            <div className="receipt-scanner-content">
              <div className="receipt-scanner-preview-column">
                <div
                  className="receipt-scanner-preview"
                  style={{
                    background: cores.fundoSecundario,
                    borderColor: cores.borda,
                  }}
                >
                  {imagemUrl ? (
                    <img src={imagemUrl} alt="Foto da nota fiscal" />
                  ) : (
                    <FaReceipt aria-hidden="true" />
                  )}

                  {processando && (
                    <div className="receipt-scanner-loading" role="status">
                      <span className="receipt-scanner-spinner" />
                      <strong>{etapa}</strong>
                      <span>{progresso}%</span>
                    </div>
                  )}
                </div>

                {processando && (
                  <div
                    className="receipt-scanner-progress"
                    style={{ background: cores.fundoSecundario }}
                    aria-label={`Leitura ${progresso}% concluída`}
                  >
                    <span style={{ width: `${progresso}%` }} />
                  </div>
                )}

                <button
                  type="button"
                  className="receipt-scanner-secondary"
                  onClick={abrirCamera}
                  disabled={processando}
                  style={{
                    color: cores.texto,
                    borderColor: cores.borda,
                    background: cores.fundoSecundario,
                  }}
                >
                  <FaRedo aria-hidden="true" />
                  Tirar outra foto
                </button>

                <p
                  className="receipt-scanner-tip"
                  style={{ color: cores.textoSecundario }}
                >
                  Dica: enquadre a nota inteira, evite sombras e deixe o valor
                  total bem visível.
                </p>
              </div>

              <div className="receipt-scanner-form">
                {erro && <div className="receipt-scanner-warning">{erro}</div>}

                <label htmlFor="receipt-description">Nome do gasto</label>
                <input
                  id="receipt-description"
                  type="text"
                  value={descricao}
                  maxLength={60}
                  onChange={(evento) => setDescricao(evento.target.value)}
                  placeholder="Ex.: Supermercado Central"
                  disabled={processando}
                  style={campo}
                />

                <label htmlFor="receipt-value">
                  Valor total
                  {confiancaValor === "baixa" && !processando && (
                    <span className="receipt-scanner-review">confira este valor</span>
                  )}
                </label>
                <div className="receipt-scanner-money-field">
                  <span>R$</span>
                  <input
                    id="receipt-value"
                    type="text"
                    inputMode="decimal"
                    value={valor}
                    onChange={(evento) => setValor(evento.target.value)}
                    placeholder="0,00"
                    disabled={processando}
                    style={{ ...campo, paddingLeft: 48 }}
                  />
                </div>

                <label htmlFor="receipt-category">Categoria</label>
                <select
                  id="receipt-category"
                  value={categoria}
                  onChange={(evento) => setCategoria(evento.target.value)}
                  disabled={processando}
                  style={campo}
                >
                  {CATEGORIAS_DESPESA.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                {textoExtraido && !processando && (
                  <details
                    className="receipt-scanner-details"
                    style={{ borderColor: cores.borda }}
                  >
                    <summary style={{ color: cores.textoSecundario }}>
                      Ver texto encontrado na nota
                    </summary>
                    <pre
                      style={{
                        color: cores.textoSecundario,
                        background: cores.fundoSecundario,
                      }}
                    >
                      {textoExtraido}
                    </pre>
                  </details>
                )}

                <button
                  type="button"
                  className="receipt-scanner-submit"
                  onClick={adicionarNotaComoDespesa}
                  disabled={processando}
                >
                  <FaCheckCircle aria-hidden="true" />
                  Adicionar em Despesas
                </button>

                <p
                  className="receipt-scanner-privacy"
                  style={{ color: cores.textoSuave }}
                >
                  A leitura acontece no seu aparelho. A foto não é salva no
                  cadastro.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default ReceiptScanner;
