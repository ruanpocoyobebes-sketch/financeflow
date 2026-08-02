import { supabase } from "../lib/supabase";

async function obterUsuarioLogado() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  return user;
}

async function buscarPerfil() {
  const usuario = await obterUsuarioLogado();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        nome,
        avatar_url,
        plano,
        bloqueado,
        moeda,
        tema,
        created_at
      `
    )
    .eq("id", usuario.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function atualizarPerfil({
  nome,
  avatarUrl,
  moeda,
  tema,
}) {
  const usuario = await obterUsuarioLogado();

  const alteracoes = {};

  if (nome !== undefined) {
    const nomeTratado = nome.trim();

    if (!nomeTratado) {
      throw new Error("O nome não pode ficar vazio.");
    }

    alteracoes.nome = nomeTratado;
  }

  if (avatarUrl !== undefined) {
    alteracoes.avatar_url = avatarUrl || null;
  }

  if (moeda !== undefined) {
    alteracoes.moeda = moeda;
  }

  if (tema !== undefined) {
    alteracoes.tema = tema;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(alteracoes)
    .eq("id", usuario.id)
    .select(
      `
        id,
        nome,
        avatar_url,
        plano,
        bloqueado,
        moeda,
        tema,
        created_at
      `
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

function normalizarPlano(perfil) {
  const plano = String(
    perfil?.plano || ""
  )
    .trim()
    .toLowerCase();

  return plano;
}

function usuarioTemPlanoPremium(perfil) {
  return ["premium", "dono"].includes(
    normalizarPlano(perfil)
  );
}

function usuarioEhDono(perfil) {
  return normalizarPlano(perfil) === "dono";
}

export const perfilService = {
  buscarPerfil,
  atualizarPerfil,
  usuarioTemPlanoPremium,
  usuarioEhDono,
};

export default perfilService;
