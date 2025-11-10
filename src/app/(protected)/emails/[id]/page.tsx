"use client";

import { Suspense, useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { getEmailById } from "@/actions/emails";
import { EmailWithMetadata } from "@/types";
import { MailWarning, Loader2 } from "lucide-react";
import EmailDetailView from "@/components/emails/EmailDetailView";
import EmailMetadataSidebar from "@/components/emails/EmailMetadataSidebar";
import EmptyState from "@/components/shared/EmptyState";

type PageProps = {
  params: Promise<{ id: string }>;
};

// Componente para cargar el email
function EmailLoader({ id, router }: { id: string; router: ReturnType<typeof useRouter> }) {
  const [email, setEmail] = useState<EmailWithMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmail() {
      try {
        setLoading(true);
        setError(null);
        const result = await getEmailById(id);
        
        if (result.success) {
          setEmail(result.data as EmailWithMetadata);
        } else {
          setError(result.error || "Error al cargar el email");
        }
      } catch (err) {
        setError("Error de conexión al servidor");
        console.error("Error loading email:", err);
      } finally {
        setLoading(false);
      }
    }

    loadEmail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[color:var(--color-primary-500)]" />
        <span className="ml-2 text-[color:var(--color-text-secondary)]">Cargando email...</span>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="card-base p-6">
        <EmptyState
          title="Email no encontrado"
          description={error || "No pudimos encontrar el email solicitado. Regresa al listado e intenta nuevamente."}
          icon={MailWarning}
          actionLabel="Volver a Emails"
          onAction={() => router.push("/emails")}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna principal: 2/3 */}
      <div className="lg:col-span-2">
        <EmailDetailView email={email} onBack={() => router.push("/emails")} />
      </div>

      {/* Sidebar de metadata: 1/3 */}
      <div className="lg:col-span-1">
        <EmailMetadataSidebar email={email} />
      </div>
    </div>
  );
}

export default function EmailDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[color:var(--color-primary-500)]" />
        <span className="ml-2 text-[color:var(--color-text-secondary)]">Cargando email...</span>
      </div>
    }>
      <EmailLoader id={id} router={router} />
    </Suspense>
  );
}