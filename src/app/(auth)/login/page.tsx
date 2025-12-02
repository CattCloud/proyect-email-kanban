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
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden login-background"
      aria-label="Pantalla de inicio de sesión"
    >
      {/* Fondo animado con gradiente, partículas y cuadrícula */}
      <div className="login-background-animation" />
      
      {/* Círculos flotantes animados */}
      <div className="floating-circles">
        <div className="circle circle-1" />
        <div className="circle circle-2" />
        <div className="circle circle-3" />
        <div className="circle circle-4" />
        <div className="circle circle-5" />
        <div className="circle circle-6" />
      </div>

      {/* Tarjeta de login con fondo blanco sólido */}
      <section
        className="card-base w-full max-w-md p-8 relative z-10 shadow-2xl"
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
        <h1 id="login-title" className="text-center mb-2 text-[var(--color-text-primary)]">
          Sistema de Gestión de Emails
        </h1>
        <p className="text-center text-[var(--color-text-secondary)] mb-6">
          Organiza tus emails con inteligencia artificial
        </p>

        {/* Botón de Google */}
        <Button
          type="button"
          onClick={handleLogin}
          loading={loading || status === "loading"}
          className="w-full bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-hover)] border-[var(--color-border-default)] text-[var(--color-text-primary)] transition-all duration-300 hover:scale-105"
          variant="outline"
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
        <p className="text-[var(--color-text-muted)] text-xs text-center mt-6">
          Al continuar, aceptas nuestros términos de servicio y el uso de tu cuenta
          de Google únicamente para autenticación (perfil y email).
        </p>
      </section>

      {/* Estilos CSS del fondo animado - USANDO COLORES DEL SISTEMA */}
      <style jsx>{`
        .login-background {
          background: linear-gradient(
            -45deg,
            #607e9d 0%,    /* --color-primary-500 (base del sistema) */
            #7da0c3 25%,   /* --color-primary-400 */
            #aac2d8 50%,   /* --color-primary-300 */
            #4f6a84 75%,   /* --color-primary-600 */
            #607e9d 100%   /* Vuelve al color base */
          );
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
          0% { 
            background-position: 0% 50%; 
          }
          25% { 
            background-position: 100% 50%; 
          }
          50% { 
            background-position: 50% 100%; 
          }
          75% { 
            background-position: 0% 0%; 
          }
          100% { 
            background-position: 0% 50%; 
          }
        }

        .login-background-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            /* Cuadrícula animada con color primario */
            linear-gradient(90deg, rgba(96, 126, 157, 0.08) 1px, transparent 1px),
            linear-gradient(rgba(96, 126, 157, 0.08) 1px, transparent 1px);
          background-size: 60px 60px, 60px 60px;
          animation: gridMove 20s linear infinite;
          z-index: 1;
        }

        @keyframes gridMove {
          0% { 
            background-position: 0 0, 0 0; 
          }
          100% { 
            background-position: 60px 60px, 60px 60px; 
          }
        }

        .floating-circles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(96, 126, 157, 0.12); /* Usando color primario con opacidad */
          backdrop-filter: blur(10px);
          animation: float 25s ease-in-out infinite;
        }

        .circle-1 {
          width: 80px;
          height: 80px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 20s;
        }

        .circle-2 {
          width: 120px;
          height: 120px;
          top: 60%;
          left: 80%;
          animation-delay: 5s;
          animation-duration: 25s;
        }

        .circle-3 {
          width: 60px;
          height: 60px;
          top: 80%;
          left: 20%;
          animation-delay: 10s;
          animation-duration: 18s;
        }

        .circle-4 {
          width: 100px;
          height: 100px;
          top: 30%;
          left: 70%;
          animation-delay: 3s;
          animation-duration: 22s;
        }

        .circle-5 {
          width: 70px;
          height: 70px;
          top: 50%;
          left: 5%;
          animation-delay: 8s;
          animation-duration: 24s;
        }

        .circle-6 {
          width: 90px;
          height: 90px;
          top: 10%;
          left: 90%;
          animation-delay: 12s;
          animation-duration: 19s;
        }

        @keyframes float {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.3;
            background: rgba(96, 126, 157, 0.12);
          }
          25% { 
            transform: translate(30px, -30px) scale(1.1); 
            opacity: 0.6;
            background: rgba(125, 160, 195, 0.16);
          }
          50% { 
            transform: translate(-20px, 20px) scale(0.9); 
            opacity: 0.4;
            background: rgba(170, 194, 216, 0.20);
          }
          75% { 
            transform: translate(20px, -20px) scale(1.05); 
            opacity: 0.7;
            background: rgba(79, 106, 132, 0.14);
          }
        }

        /* Efectos adicionales con colores del sistema */
        .login-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at 30% 20%, 
            rgba(96, 126, 157, 0.15) 0%,  /* Color primario con más opacidad */
            transparent 50%
          );
          animation: pulse 8s ease-in-out infinite alternate;
          z-index: 1;
        }

        .login-background::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at 70% 80%, 
            rgba(125, 160, 195, 0.10) 0%,  /* Color primario-400 con menos opacidad */
            transparent 50%
          );
          animation: pulse 6s ease-in-out infinite alternate-reverse;
          z-index: 1;
        }

        @keyframes pulse {
          0% { 
            opacity: 0.3;
            transform: scale(1);
          }
          100% { 
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        /* Estilos responsive */
        @media (max-width: 768px) {
          .floating-circles .circle {
            opacity: 0.4;
          }
          
          .circle-1, .circle-2, .circle-3, .circle-4, .circle-5, .circle-6 {
            width: 50px;
            height: 50px;
          }
        }

        /* Optimizaciones de rendimiento */
        .login-background-animation,
        .floating-circles,
        .login-background::before,
        .login-background::after {
          will-change: transform;
        }
      `}</style>
    </main>
  );
}