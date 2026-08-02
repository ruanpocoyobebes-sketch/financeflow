import { createClient } from "npm:@supabase/supabase-js@2.110.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const planosValidos = new Set(["free", "premium", "dono"]);

class HttpError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function respostaJson(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function obterId(valor: unknown, nome = "usuário") {
  const id = String(valor || "").trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new HttpError(`O identificador do ${nome} é inválido.`);
  }

  return id;
}

function usuarioEstaBloqueado(usuario: { banned_until?: string | null }) {
  const bloqueadoAte = usuario?.banned_until;

  return Boolean(
    bloqueadoAte &&
      new Date(String(bloqueadoAte)).getTime() > Date.now()
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respostaJson({ erro: "Método não permitido." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new HttpError(
        "A função administrativa não está configurada corretamente.",
        500
      );
    }

    const authorization = req.headers.get("Authorization") || "";
    const token = authorization.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      throw new HttpError("Sessão não encontrada.", 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user: usuarioAtual },
      error: erroUsuario,
    } = await admin.auth.getUser(token);

    if (erroUsuario || !usuarioAtual) {
      throw new HttpError("Sua sessão expirou. Entre novamente.", 401);
    }

    const { data: perfilAtual, error: erroPerfil } = await admin
      .from("profiles")
      .select("id, nome, plano, bloqueado")
      .eq("id", usuarioAtual.id)
      .single();

    if (
      erroPerfil ||
      perfilAtual?.plano !== "dono" ||
      perfilAtual?.bloqueado
    ) {
      throw new HttpError(
        "Apenas uma conta com a tag Dono pode acessar esta área.",
        403
      );
    }

    const corpo = await req.json().catch(() => ({}));
    const acao = String(corpo?.acao || "").trim();

    async function registrarAuditoria(
      acaoAuditoria: string,
      targetUserId: string | null,
      detalhes: Record<string, unknown> = {}
    ) {
      const { error } = await admin.from("admin_audit_logs").insert({
        admin_id: usuarioAtual.id,
        target_user_id: targetUserId,
        acao: acaoAuditoria,
        detalhes,
      });

      if (error) {
        console.error("Falha ao registrar auditoria:", error.message);
      }
    }

    async function buscarPerfilAlvo(id: string) {
      const { data, error } = await admin
        .from("profiles")
        .select("id, nome, plano, bloqueado")
        .eq("id", id)
        .single();

      if (error || !data) {
        throw new HttpError("Perfil não encontrado.", 404);
      }

      return data;
    }

    async function garantirOutroDono(id: string) {
      const { count, error } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("plano", "dono")
        .neq("id", id);

      if (error) {
        throw error;
      }

      if (!count) {
        throw new HttpError(
          "Esta é a última conta Dono e não pode perder o acesso administrativo."
        );
      }
    }

    if (acao === "listar") {
      const usuariosAuth = [];

      for (let pagina = 1; pagina <= 50; pagina += 1) {
        const { data, error } = await admin.auth.admin.listUsers({
          page: pagina,
          perPage: 1000,
        });

        if (error) {
          throw error;
        }

        usuariosAuth.push(...data.users);

        if (data.users.length < 1000) {
          break;
        }
      }

      const { data: perfis, error: erroPerfis } = await admin
        .from("profiles")
        .select("id, nome, avatar_url, plano, moeda, tema, bloqueado, created_at");

      if (erroPerfis) {
        throw erroPerfis;
      }

      const perfisPorId = new Map(
        (perfis || []).map((perfil) => [perfil.id, perfil])
      );

      const usuarios = usuariosAuth
        .map((usuario) => {
          const perfil = perfisPorId.get(usuario.id) || {};

          return {
            id: usuario.id,
            email: usuario.email || "",
            nome:
              perfil.nome ||
              usuario.user_metadata?.nome ||
              usuario.email?.split("@")[0] ||
              "Usuário",
            avatarUrl: perfil.avatar_url || null,
            plano: planosValidos.has(perfil.plano)
              ? perfil.plano
              : "free",
            bloqueado:
              Boolean(perfil.bloqueado) || usuarioEstaBloqueado(usuario),
            emailConfirmado: Boolean(usuario.email_confirmed_at),
            criadoEm: perfil.created_at || usuario.created_at,
            ultimoAcesso: usuario.last_sign_in_at || null,
          };
        })
        .sort((a, b) =>
          String(a.nome).localeCompare(String(b.nome), "pt-BR")
        );

      const { data: configuracoes, error: erroConfiguracoes } = await admin
        .from("app_settings")
        .select("cadastros_liberados, updated_at")
        .eq("id", "global")
        .single();

      if (erroConfiguracoes) {
        throw erroConfiguracoes;
      }

      const { data: auditoria, error: erroAuditoria } = await admin
        .from("admin_audit_logs")
        .select("id, admin_id, target_user_id, acao, detalhes, created_at")
        .order("created_at", { ascending: false })
        .limit(30);

      if (erroAuditoria) {
        throw erroAuditoria;
      }

      return respostaJson({
        usuarios,
        configuracoes: {
          cadastrosLiberados: configuracoes.cadastros_liberados,
          atualizadoEm: configuracoes.updated_at,
        },
        auditoria: auditoria || [],
      });
    }

    if (acao === "alterar_plano") {
      const usuarioId = obterId(corpo?.usuarioId);
      const plano = String(corpo?.plano || "").trim().toLowerCase();

      if (!planosValidos.has(plano)) {
        throw new HttpError("Escolha um plano válido.");
      }

      const perfilAlvo = await buscarPerfilAlvo(usuarioId);

      if (usuarioId === usuarioAtual.id && plano !== "dono") {
        throw new HttpError("Você não pode remover sua própria tag Dono.");
      }

      if (perfilAlvo.plano === "dono" && plano !== "dono") {
        await garantirOutroDono(usuarioId);
      }

      const { data, error } = await admin
        .from("profiles")
        .update({ plano })
        .eq("id", usuarioId)
        .select("id, nome, plano, bloqueado")
        .single();

      if (error) {
        throw error;
      }

      await registrarAuditoria("alterar_plano", usuarioId, {
        planoAnterior: perfilAlvo.plano,
        planoNovo: plano,
      });

      return respostaJson({ sucesso: true, perfil: data });
    }

    if (acao === "alterar_bloqueio") {
      const usuarioId = obterId(corpo?.usuarioId);
      const bloquear = corpo?.bloquear === true;
      const perfilAlvo = await buscarPerfilAlvo(usuarioId);

      if (usuarioId === usuarioAtual.id) {
        throw new HttpError("Você não pode bloquear sua própria conta.");
      }

      if (bloquear && perfilAlvo.plano === "dono") {
        throw new HttpError(
          "Rebaixe a conta Dono antes de bloqueá-la."
        );
      }

      const { error: erroAuth } = await admin.auth.admin.updateUserById(
        usuarioId,
        { ban_duration: bloquear ? "876000h" : "none" }
      );

      if (erroAuth) {
        throw erroAuth;
      }

      const { error: erroAtualizacao } = await admin
        .from("profiles")
        .update({ bloqueado: bloquear })
        .eq("id", usuarioId);

      if (erroAtualizacao) {
        await admin.auth.admin.updateUserById(usuarioId, {
          ban_duration: bloquear ? "none" : "876000h",
        });
        throw erroAtualizacao;
      }

      await registrarAuditoria(
        bloquear ? "bloquear_usuario" : "desbloquear_usuario",
        usuarioId,
        { plano: perfilAlvo.plano }
      );

      return respostaJson({ sucesso: true });
    }

    if (acao === "excluir_usuario") {
      const usuarioId = obterId(corpo?.usuarioId);
      const perfilAlvo = await buscarPerfilAlvo(usuarioId);

      if (usuarioId === usuarioAtual.id) {
        throw new HttpError("Você não pode excluir sua própria conta.");
      }

      if (perfilAlvo.plano === "dono") {
        throw new HttpError(
          "Rebaixe a conta Dono antes de excluí-la."
        );
      }

      await registrarAuditoria("excluir_usuario", usuarioId, {
        nome: perfilAlvo.nome,
        plano: perfilAlvo.plano,
      });

      const { error } = await admin.auth.admin.deleteUser(usuarioId, false);

      if (error) {
        throw error;
      }

      return respostaJson({ sucesso: true });
    }

    if (acao === "alterar_cadastros") {
      const liberar = corpo?.liberar === true;

      const { error } = await admin
        .from("app_settings")
        .update({
          cadastros_liberados: liberar,
          updated_at: new Date().toISOString(),
          updated_by: usuarioAtual.id,
        })
        .eq("id", "global");

      if (error) {
        throw error;
      }

      await registrarAuditoria("alterar_cadastros", null, {
        cadastrosLiberados: liberar,
      });

      return respostaJson({ sucesso: true, cadastrosLiberados: liberar });
    }

    throw new HttpError("Ação administrativa inválida.", 404);
  } catch (erro) {
    console.error(erro);

    const status = erro instanceof HttpError ? erro.status : 500;
    const mensagem =
      erro instanceof Error
        ? erro.message
        : "Não foi possível concluir a operação administrativa.";

    return respostaJson({ erro: mensagem }, status);
  }
});
