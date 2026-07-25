import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaArrowRight,
  FaChartLine,
  FaCheck,
  FaLock,
  FaMoon,
  FaPiggyBank,
  FaSun,
  FaWallet,
} from "react-icons/fa";

import "./Apresentacao.css";

const recursos = [
  {
    titulo: "Controle financeiro",
    descricao:
      "Organize receitas, despesas e movimentações em um único lugar.",
    icone: <FaWallet />,
  },
  {
    titulo: "Metas financeiras",
    descricao:
      "Crie objetivos e acompanhe o progresso do seu dinheiro.",
    icone: <FaPiggyBank />,
  },
  {
    titulo: "Relatórios inteligentes",
    descricao:
      "Visualize gráficos e entenda melhor para onde o dinheiro está indo.",
    icone: <FaChartLine />,
  },
  {
    titulo: "Dados protegidos",
    descricao:
      "Cada conta terá seus próprios dados armazenados com segurança.",
    icone: <FaLock />,
  },
];

function obterTemaInicial() {
  const temaSalvo = localStorage.getItem(
    "mahafinance-tema-publico"
  );

  if (temaSalvo === "claro" || temaSalvo === "escuro") {
    return temaSalvo;
  }

  const prefereEscuro = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  return prefereEscuro ? "escuro" : "claro";
}

function Apresentacao() {
  const [tema, setTema] = useState(obterTemaInicial);

  const temaEscuro = tema === "escuro";

  useEffect(() => {
    localStorage.setItem(
      "mahafinance-tema-publico",
      tema
    );
  }, [tema]);

  function alternarTema() {
    setTema((temaAtual) =>
      temaAtual === "escuro" ? "claro" : "escuro"
    );
  }

  return (
    <div
      className={`apresentacao ${
        temaEscuro
          ? "apresentacao--escura"
          : "apresentacao--clara"
      }`}
    >
      <header className="apresentacao__cabecalho">
        <Link
          to="/"
          className="apresentacao__logo"
          aria-label="Página inicial do MahaFinance"
        >
          <span className="apresentacao__logo-icone">
            M
          </span>

          <span>MahaFinance</span>
        </Link>

        <nav className="apresentacao__navegacao">
          <a href="#recursos">Recursos</a>
          <a href="#plano">Plano</a>
          <a href="#sobre">Sobre</a>
        </nav>

        <div className="apresentacao__acoes">
          <button
            type="button"
            className="apresentacao__tema"
            onClick={alternarTema}
            aria-label={
              temaEscuro
                ? "Ativar tema claro"
                : "Ativar tema escuro"
            }
            title={
              temaEscuro
                ? "Ativar tema claro"
                : "Ativar tema escuro"
            }
          >
            {temaEscuro ? <FaSun /> : <FaMoon />}
          </button>

          <Link
            to="/login"
            className="apresentacao__botao apresentacao__botao--secundario apresentacao__entrar-desktop"
          >
            Entrar
          </Link>

          <Link
            to="/cadastro"
            className="apresentacao__botao apresentacao__botao--primario"
          >
            Criar conta
          </Link>
        </div>
      </header>

      <main>
        <section className="apresentacao__hero">
          <div className="apresentacao__hero-conteudo">
            <div className="apresentacao__etiqueta">
              <span />
              Seu dinheiro mais organizado
            </div>

            <h1>
              Controle sua vida financeira de forma
              <strong> simples e inteligente.</strong>
            </h1>

            <p>
              O MahaFinance reúne receitas, despesas,
              investimentos, metas e relatórios para você
              entender melhor seu dinheiro e tomar decisões
              mais seguras.
            </p>

            <div className="apresentacao__hero-botoes">
              <Link
                to="/cadastro"
                className="apresentacao__botao apresentacao__botao--primario apresentacao__botao--grande"
              >
                Começar agora
                <FaArrowRight />
              </Link>

              <Link
                to="/login"
                className="apresentacao__botao apresentacao__botao--secundario apresentacao__botao--grande"
              >
                Já tenho uma conta
              </Link>
            </div>

            <div className="apresentacao__garantias">
              <span>
                <FaCheck />
                Cadastro simples
              </span>

              <span>
                <FaCheck />
                Pagamento seguro
              </span>

              <span>
                <FaCheck />
                Acesso em qualquer dispositivo
              </span>
            </div>
          </div>

          <div className="apresentacao__demonstracao">
            <div className="apresentacao__brilho" />

            <div className="apresentacao__painel">
              <div className="apresentacao__painel-topo">
                <div>
                  <span>Visão geral</span>
                  <strong>Dashboard financeiro</strong>
                </div>

                <div className="apresentacao__avatar">
                  MF
                </div>
              </div>

              <div className="apresentacao__saldo">
                <span>Saldo disponível</span>
                <strong>R$ 8.420,50</strong>
                <small>+12,4% neste mês</small>
              </div>

              <div className="apresentacao__cards-demo">
                <div>
                  <span>Receitas</span>
                  <strong>R$ 12.800</strong>
                  <small>Entradas do mês</small>
                </div>

                <div>
                  <span>Despesas</span>
                  <strong>R$ 4.379,50</strong>
                  <small>Gastos do mês</small>
                </div>
              </div>

              <div className="apresentacao__grafico">
                <div className="apresentacao__grafico-cabecalho">
                  <span>Evolução financeira</span>
                  <small>Últimos 6 meses</small>
                </div>

                <div className="apresentacao__barras">
                  <span style={{ height: "38%" }} />
                  <span style={{ height: "52%" }} />
                  <span style={{ height: "45%" }} />
                  <span style={{ height: "68%" }} />
                  <span style={{ height: "76%" }} />
                  <span style={{ height: "92%" }} />
                </div>

                <div className="apresentacao__meses">
                  <span>Jan</span>
                  <span>Fev</span>
                  <span>Mar</span>
                  <span>Abr</span>
                  <span>Mai</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="recursos"
          className="apresentacao__secao"
        >
          <div className="apresentacao__titulo-secao">
            <span>RECURSOS</span>

            <h2>
              Tudo o que você precisa para cuidar do seu
              dinheiro
            </h2>

            <p>
              Ferramentas simples para transformar números
              soltos em informações úteis.
            </p>
          </div>

          <div className="apresentacao__grade-recursos">
            {recursos.map((recurso) => (
              <article
                key={recurso.titulo}
                className="apresentacao__recurso"
              >
                <div className="apresentacao__recurso-icone">
                  {recurso.icone}
                </div>

                <h3>{recurso.titulo}</h3>
                <p>{recurso.descricao}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="plano"
          className="apresentacao__secao apresentacao__secao-plano"
        >
          <div className="apresentacao__titulo-secao">
            <span>PLANO</span>

            <h2>Uma assinatura, todos os recursos</h2>

            <p>
              O valor definitivo será configurado quando
              integrarmos o Mercado Pago.
            </p>
          </div>

          <div className="apresentacao__plano">
            <div className="apresentacao__plano-cabecalho">
              <div>
                <span className="apresentacao__plano-destaque">
                  MAIS COMPLETO
                </span>

                <h3>MahaFinance Premium</h3>

                <p>
                  Controle completo da sua vida financeira.
                </p>
              </div>

              <div className="apresentacao__preco">
                <small>por apenas</small>

                <div>
                  <span>R$</span>
                  <strong>--</strong>
                  <span>/mês</span>
                </div>
              </div>
            </div>

            <div className="apresentacao__plano-conteudo">
              <ul>
                <li>
                  <FaCheck />
                  Dashboard financeiro completo
                </li>

                <li>
                  <FaCheck />
                  Controle de receitas e despesas
                </li>

                <li>
                  <FaCheck />
                  Área de investimentos
                </li>

                <li>
                  <FaCheck />
                  Criação de metas financeiras
                </li>

                <li>
                  <FaCheck />
                  Relatórios e gráficos detalhados
                </li>

                <li>
                  <FaCheck />
                  Dados sincronizados na nuvem
                </li>
              </ul>

              <Link
                to="/cadastro"
                className="apresentacao__botao apresentacao__botao--primario apresentacao__botao--plano"
              >
                Criar minha conta
                <FaArrowRight />
              </Link>

              <small className="apresentacao__pagamento-info">
                Pagamento por Pix ou cartão será adicionado
                na etapa do Mercado Pago.
              </small>
            </div>
          </div>
        </section>

        <section
          id="sobre"
          className="apresentacao__chamada"
        >
          <div>
            <span>COMECE AGORA</span>

            <h2>
              Sua organização financeira começa com uma
              decisão.
            </h2>

            <p>
              Crie sua conta e prepare-se para controlar seu
              dinheiro de uma forma mais clara.
            </p>
          </div>

          <Link
            to="/cadastro"
            className="apresentacao__botao apresentacao__botao--claro apresentacao__botao--grande"
          >
            Criar conta
            <FaArrowRight />
          </Link>
        </section>
      </main>

      <footer className="apresentacao__rodape">
        <Link to="/" className="apresentacao__logo">
          <span className="apresentacao__logo-icone">
            M
          </span>

          <span>MahaFinance</span>
        </Link>

        <p>
          © {new Date().getFullYear()} MahaFinance. Todos os
          direitos reservados.
        </p>
      </footer>
    </div>
  );
}

export default Apresentacao;