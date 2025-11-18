"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Button from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión, redirigir automáticamente a /emails
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/emails");
    }
  }, [status, router]);

  async function handleLogin() {
    try {
      setLoading(true);
      await signIn("google", {
        callbackUrl: "/emails",
      });
      // Nota: signIn normalmente redirige; no siempre se ejecuta el código siguiente.
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center bg-[color:var(--color-bg-app)] text-[color:var(--color-text-primary)]"
      aria-label="Pantalla de inicio de sesión"
    >
      <section
        className="card-base w-full max-w-md p-8"
        role="region"
        aria-labelledby="login-title"
      >
        {/* Logo / Ícono superior */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shadow-sm">
            <Mail className="w-6 h-6 text-white" aria-hidden />
          </div>
        </div>

        {/* Títulos */}
        <h1 id="login-title" className="text-center mb-2">
          Sistema de Gestión de Emails
        </h1>
        <p className="text-center text-[color:var(--color-text-muted)] mb-6">
          Organiza tus emails con inteligencia artificial
        </p>

        {/* Botón de Google */}
        <Button
          type="button"
          onClick={handleLogin}
          loading={loading || status === "loading"}
          className="w-full"
          variant="primary"
          size="md"
          aria-label="Iniciar sesión con Google"
          leftIcon={
            <svg
              className="w-5 h-5"
              viewBox="0 0 48 48"
              aria-hidden
              focusable="false"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.9 33 29.3 36 24 36c-7 0-12.7-5.7-12.7-12.7S17 10.7 24 10.7c3.2 0 6.1 1.2 8.3 3.2l5.6-5.6C34.4 4.9 29.5 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21 21-9.3 21-21c0-1.1-.1-2.1-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.8 15.4 19 12.7 24 12.7c3.2 0 6.1 1.2 8.3 3.2l5.6-5.6C34.4 4.9 29.5 3 24 3 15.5 3 8.3 7.8 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 36.8 26.8 37.7 24 37.7c-5.2 0-9.6-3.5-11.1-8.2l-6.5 5C9 41 15.9 45 24 45z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.3 5.3-6.2 6.6l6.3 5.2C38 36.7 41 31.8 41 26c0-1.9-.3-3.5-.9-5.5z"
              />
            </svg>
          }
        >
          Iniciar sesión con Google
        </Button>

        {/* Footer legal */}
        <p className="text-[color:var(--color-text-muted)] text-xs text-center mt-6">
          Al continuar, aceptas nuestros términos de servicio y el uso de tu cuenta
          de Google únicamente para autenticación (perfil y email).
        </p>
      </section>
    </main>
  );
}