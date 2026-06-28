"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import {
  loginSchema,
  signupSchema,
  magicLinkSchema,
} from "@/lib/validations/auth";

export type ActionResult = { error: string } | { success: string };

export async function login(values: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa los datos del formulario." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email o contraseña incorrectos." };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(values: unknown): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa los datos del formulario." };

  const { email, password, fullName } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/`,
    },
  });
  if (error) {
    if (error.message.toLowerCase().includes("already"))
      return { error: "Ya existe una cuenta con este email." };
    return { error: "No se pudo crear la cuenta. Inténtalo de nuevo." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function sendMagicLink(values: unknown): Promise<ActionResult> {
  const parsed = magicLinkSchema.safeParse(values);
  if (!parsed.success) return { error: "Email no válido." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/`,
    },
  });
  if (error) return { error: "No se pudo enviar el enlace. Inténtalo de nuevo." };

  return { success: "Te enviamos un enlace de acceso. Revisa tu correo." };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
