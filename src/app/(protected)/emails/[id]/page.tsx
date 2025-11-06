"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import EmailDetailView from "@/components/emails/EmailDetailView";
import EmailMetadataSidebar from "@/components/emails/EmailMetadataSidebar";
import EmptyState from "@/components/shared/EmptyState";
import { getEmailById } from "@/lib/mock-data/emails";
import { MailWarning } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EmailDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const email = getEmailById(id);

  if (!email) {
    return (
      <div className="card-base p-6">
        <EmptyState
          title="Email no encontrado"
          description="No pudimos encontrar el email solicitado. Regresa al listado e intenta nuevamente."
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