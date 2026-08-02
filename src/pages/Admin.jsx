import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaBan,
  FaCheckCircle,
  FaCrown,
  FaHistory,
  FaLock,
  FaLockOpen,
  FaRedoAlt,
  FaSearch,
  FaShieldAlt,
  FaTrashAlt,
  FaUserCheck,
  FaUsers,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin";
import "./Admin.css";

const planos = [
  { valor: "free", nome: "Free" },
  { valor: "premium", nome: "Premium" },
  { valor: "dono", nome: "Dono" },
];

function formatarData(valor, incluirHora = false) {
  if (!valor) return "Nunca";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    ...(incluirHora ? { timeStyle: "short" } : {}),
  }).format(data);
}

function iniciais(nome) {
  const palavras = String(nome || "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return palavras
    .slice(0, 2)
    .map((palavra) => palavra.charAt(0).toUpperCase())
    .join("");
}

function RotuloPlano({ plano }) {
  return (
    <span className={`admin-plan-badge admin-plan-${plano}`}>
      {plano === "dono" && <FaCrown aria-hidden="true" />}
      {plano || "free"}
    </span>
  );
}

function AcoesUsuario({
  usuario,
  usuarioAtualId,
  processando,
  onPlano,
  onBloqueio,
  onExcluir,
}) {
  const ocupada = processando === usuario.id;
  const propriaConta = usuario.id === usuarioAtualId;

  return (
    <div className="admin-user-actions">
      <label className="admin-plan-select-label">
        <span>Plano</span>
        <select
          aria-label={`Plano de ${usuario.nome}`}
          value={usuario.plano}
          disabled={ocupada || propriaConta}
          onChange={(evento) => onPlano(usuario, evento.target.value)}
        >
          {planos.map((plano) => (
            <option key={plano.valor} value={plano.valor}>
              {plano.nome}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className={
          usuario.bloqueado
            ? "admin-action-button admin-action-unlock"
            : "admin-action-button admin-action-block"
        }
        disabled={ocupada || propriaConta || usuario.plano === "dono"}
        onClick={() => onBloqueio(usuario)}
        title={
          usuario.plano === "dono" && !propriaConta
            ? "Rebaixe esta conta antes de bloqueá-la"
            : undefined
        }
      >
        {usuario.bloqueado ? <FaLockOpen /> : <FaLock />}
        {usuario.bloqueado ? "Desbloquear" : "Bloquear"}
      </button>

      <button
        type="button"
        className="admin-action-button admin-action-delete"
        disabled={ocupada || propriaConta || usuario.plano === "dono"}
        onClick={() => onExcluir(usuario)}
        title={
          usuario.plano === "dono" && !propriaConta
            ? "Rebaixe esta conta antes de excluí-la"
            : undefined
        }
      >
        <FaTrashAlt />
        Excluir
      </button>
    </div>
  );
}

function Admin() {
  const { usuario: usuarioAtual } = useAuth();
  const [dados, setDados] = useState({
    usuarios: [],
    configuracoes: { cadastrosLiberados: true },
    auditoria: [],
  });
  const [busca, setBusca] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const carregarDados = useCallback(async ({ silencioso = false } = {}) => {
    try {
      if (!silencioso) setCarregando(true);
      setErro("");

      const resposta = await adminService.listar();

      setDados({
        usuarios: resposta?.usuarios || [],
        configuracoes: resposta?.configuracoes || {
          cadastrosLiberados: true,
        },
        auditoria: resposta?.auditoria || [],
      });
    } catch (erroCarregamento) {
      console.error("Erro ao carregar administração:", erroCarregamento);
      setErro(
        erroCarregamento?.message ||
          "Não foi possível carregar o painel administrativo."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function mostrarMensagem(texto) {
    setMensagem(texto);
    window.setTimeout(() => setMensagem(""), 3200);
  }

  async function executarAcao(chave, acao, mensagemSucesso) {
    try {
      setProcessando(chave);
      setErro("");
      await acao();
      await carregarDados({ silencioso: true });
      mostrarMensagem(mensagemSucesso);
    } catch (erroAcao) {
      console.error("Erro na ação administrativa:", erroAcao);
      setErro(erroAcao?.message || "Não foi possível concluir a ação.");
    } finally {
      setProcessando("");
    }
  }

  function alterarPlano(usuario, planoNovo) {
    if (planoNovo === usuario.plano) return;

    const confirmado = window.confirm(
      `Alterar o plano de ${usuario.nome} de ${usuario.plano.toUpperCase()} para ${planoNovo.toUpperCase()}?`
    );

    if (!confirmado) return;

    executarAcao(
      usuario.id,
      () => adminService.alterarPlano(usuario.id, planoNovo),
      `Plano de ${usuario.nome} alterado para ${planoNovo}.`
    );
  }

  function alterarBloqueio(usuario) {
    const bloquear = !usuario.bloqueado;
    const confirmado = window.confirm(
      bloquear
        ? `Bloquear o acesso de ${usuario.nome}? A conta não conseguirá entrar no aplicativo.`
        : `Desbloquear a conta de ${usuario.nome}?`
    );

    if (!confirmado) return;

    executarAcao(
      usuario.id,
      () => adminService.alterarBloqueio(usuario.id, bloquear),
      bloquear
        ? `${usuario.nome} foi bloqueado.`
        : `${usuario.nome} foi desbloqueado.`
    );
  }

  function excluirUsuario(usuario) {
    const confirmacao = window.prompt(
      `Esta ação exclui definitivamente a conta de ${usuario.nome} (${usuario.email}).\n\nDigite EXCLUIR para confirmar:`
    );

    if (confirmacao !== "EXCLUIR") return;

    executarAcao(
      usuario.id,
      () => adminService.excluirUsuario(usuario.id),
      `A conta de ${usuario.nome} foi excluída.`
    );
  }

  function alterarCadastros() {
    const liberar = !dados.configuracoes.cadastrosLiberados;
    const confirmado = window.confirm(
      liberar
        ? "Liberar a criação de novas contas?"
        : "Bloquear temporariamente todos os novos cadastros?"
    );

    if (!confirmado) return;

    executarAcao(
      "cadastros",
      () => adminService.alterarCadastros(liberar),
      liberar
        ? "Novos cadastros foram liberados."
        : "Novos cadastros foram bloqueados."
    );
  }

  const resumo = useMemo(() => {
    const usuarios = dados.usuarios;

    return {
      total: usuarios.length,
      free: usuarios.filter((item) => item.plano === "free").length,
      premium: usuarios.filter((item) => item.plano === "premium").length,
      dono: usuarios.filter((item) => item.plano === "dono").length,
      bloqueados: usuarios.filter((item) => item.bloqueado).length,
    };
  }, [dados.usuarios]);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return dados.usuarios.filter((usuario) => {
      const combinaBusca =
        !termo ||
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo);
      const combinaPlano =
        filtroPlano === "todos" || usuario.plano === filtroPlano;
      const combinaStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "bloqueados"
          ? usuario.bloqueado
          : !usuario.bloqueado);

      return combinaBusca && combinaPlano && combinaStatus;
    });
  }, [busca, dados.usuarios, filtroPlano, filtroStatus]);

  const nomesPorId = useMemo(
    () => new Map(dados.usuarios.map((item) => [item.id, item.nome])),
    [dados.usuarios]
  );

  if (carregando) {
    return (
      <div className="app-page admin-state-page">
        <div className="admin-spinner" />
        <strong>Carregando painel do dono...</strong>
      </div>
    );
  }

  if (erro && !dados.usuarios.length) {
    return (
      <div className="app-page admin-state-page">
        <FaShieldAlt className="admin-state-icon" />
        <h1>Não foi possível abrir o painel</h1>
        <p>{erro}</p>
        <button type="button" onClick={() => carregarDados()}>
          <FaRedoAlt /> Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="app-page admin-page">
      {mensagem && (
        <div className="admin-toast" role="status">
          <FaCheckCircle /> {mensagem}
        </div>
      )}

      <header className="admin-header responsive-page-header">
        <div>
          <div className="admin-eyebrow">
            <FaCrown /> Área exclusiva
          </div>
          <h1>Painel do Dono</h1>
          <p>Gerencie contas, planos e o acesso ao MahaFinance.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          disabled={Boolean(processando)}
          onClick={() => carregarDados()}
        >
          <FaRedoAlt /> Atualizar dados
        </button>
      </header>

      {erro && (
        <div className="admin-alert" role="alert">
          <FaBan />
          <span>{erro}</span>
          <button type="button" onClick={() => setErro("")}>
            Fechar
          </button>
        </div>
      )}

      <section className="admin-summary-grid" aria-label="Resumo das contas">
        <article>
          <span className="admin-summary-icon admin-summary-total"><FaUsers /></span>
          <div><small>Total de contas</small><strong>{resumo.total}</strong></div>
        </article>
        <article>
          <span className="admin-summary-icon admin-summary-free"><FaUserCheck /></span>
          <div><small>Plano Free</small><strong>{resumo.free}</strong></div>
        </article>
        <article>
          <span className="admin-summary-icon admin-summary-premium"><FaShieldAlt /></span>
          <div><small>Premium</small><strong>{resumo.premium}</strong></div>
        </article>
        <article>
          <span className="admin-summary-icon admin-summary-owner"><FaCrown /></span>
          <div><small>Donos</small><strong>{resumo.dono}</strong></div>
        </article>
        <article>
          <span className="admin-summary-icon admin-summary-blocked"><FaLock /></span>
          <div><small>Bloqueadas</small><strong>{resumo.bloqueados}</strong></div>
        </article>
      </section>

      <section className="admin-signup-panel responsive-panel">
        <div>
          <span className="admin-signup-icon">
            {dados.configuracoes.cadastrosLiberados ? <FaLockOpen /> : <FaLock />}
          </span>
          <div>
            <h2>Novos cadastros</h2>
            <p>
              {dados.configuracoes.cadastrosLiberados
                ? "Qualquer pessoa pode criar uma nova conta."
                : "A criação de novas contas está bloqueada."}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={dados.configuracoes.cadastrosLiberados}
          aria-label="Liberar novos cadastros"
          className={`admin-switch ${
            dados.configuracoes.cadastrosLiberados ? "admin-switch-on" : ""
          }`}
          disabled={processando === "cadastros"}
          onClick={alterarCadastros}
        >
          <span />
        </button>
      </section>

      <section className="admin-users-panel responsive-panel">
        <div className="admin-panel-header responsive-panel-header">
          <div>
            <h2>Contas cadastradas</h2>
            <p>{usuariosFiltrados.length} conta(s) encontrada(s)</p>
          </div>
          <div className="admin-filters responsive-filters">
            <label className="admin-search">
              <FaSearch />
              <input
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar nome ou e-mail"
                aria-label="Buscar contas"
              />
            </label>
            <select
              value={filtroPlano}
              onChange={(evento) => setFiltroPlano(evento.target.value)}
              aria-label="Filtrar por plano"
            >
              <option value="todos">Todos os planos</option>
              {planos.map((plano) => (
                <option key={plano.valor} value={plano.valor}>
                  {plano.nome}
                </option>
              ))}
            </select>
            <select
              value={filtroStatus}
              onChange={(evento) => setFiltroStatus(evento.target.value)}
              aria-label="Filtrar por status"
            >
              <option value="todos">Todos os status</option>
              <option value="ativos">Ativos</option>
              <option value="bloqueados">Bloqueados</option>
            </select>
          </div>
        </div>

        {usuariosFiltrados.length === 0 ? (
          <div className="admin-empty">Nenhuma conta corresponde aos filtros.</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Plano</th>
                    <th>Status</th>
                    <th>Cadastro</th>
                    <th>Último acesso</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <div className="admin-user-identity">
                          <span className="admin-avatar">{iniciais(usuario.nome)}</span>
                          <div>
                            <strong>{usuario.nome}</strong>
                            <small>{usuario.email}</small>
                          </div>
                        </div>
                      </td>
                      <td><RotuloPlano plano={usuario.plano} /></td>
                      <td>
                        <span className={`admin-status ${usuario.bloqueado ? "admin-status-blocked" : "admin-status-active"}`}>
                          {usuario.bloqueado ? "Bloqueada" : "Ativa"}
                        </span>
                      </td>
                      <td>{formatarData(usuario.criadoEm)}</td>
                      <td>{formatarData(usuario.ultimoAcesso, true)}</td>
                      <td>
                        <AcoesUsuario
                          usuario={usuario}
                          usuarioAtualId={usuarioAtual?.id}
                          processando={processando}
                          onPlano={alterarPlano}
                          onBloqueio={alterarBloqueio}
                          onExcluir={excluirUsuario}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-mobile-list">
              {usuariosFiltrados.map((usuario) => (
                <article className="admin-mobile-user" key={usuario.id}>
                  <div className="admin-user-identity">
                    <span className="admin-avatar">{iniciais(usuario.nome)}</span>
                    <div>
                      <strong>{usuario.nome}</strong>
                      <small>{usuario.email}</small>
                    </div>
                  </div>
                  <div className="admin-mobile-tags">
                    <RotuloPlano plano={usuario.plano} />
                    <span className={`admin-status ${usuario.bloqueado ? "admin-status-blocked" : "admin-status-active"}`}>
                      {usuario.bloqueado ? "Bloqueada" : "Ativa"}
                    </span>
                  </div>
                  <dl>
                    <div><dt>Cadastro</dt><dd>{formatarData(usuario.criadoEm)}</dd></div>
                    <div><dt>Último acesso</dt><dd>{formatarData(usuario.ultimoAcesso, true)}</dd></div>
                  </dl>
                  <AcoesUsuario
                    usuario={usuario}
                    usuarioAtualId={usuarioAtual?.id}
                    processando={processando}
                    onPlano={alterarPlano}
                    onBloqueio={alterarBloqueio}
                    onExcluir={excluirUsuario}
                  />
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="admin-audit-panel responsive-panel">
        <div className="admin-audit-title">
          <span><FaHistory /></span>
          <div><h2>Histórico administrativo</h2><p>Últimas ações realizadas no painel.</p></div>
        </div>
        {dados.auditoria.length === 0 ? (
          <div className="admin-empty">Nenhuma ação administrativa registrada.</div>
        ) : (
          <ol className="admin-audit-list">
            {dados.auditoria.map((registro) => (
              <li key={registro.id}>
                <span className="admin-audit-dot" />
                <div>
                  <strong>{registro.acao.replaceAll("_", " ")}</strong>
                  <p>
                    por {nomesPorId.get(registro.admin_id) || "Conta removida"}
                    {registro.target_user_id
                      ? ` · conta: ${nomesPorId.get(registro.target_user_id) || "removida"}`
                      : ""}
                  </p>
                </div>
                <time>{formatarData(registro.created_at, true)}</time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export default Admin;
