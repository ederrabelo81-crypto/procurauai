import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Mail, MessageCircle } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { jobs } from "@/data/newListingTypes";

export default function JobDetail() {
  const { id } = useParams();
  const job = jobs.find((j: any) => j.id === id);

  if (!job) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Link to="/empregos" className="text-primary underline">Voltar para Empregos</Link>
        <p className="mt-4 text-muted-foreground">Vaga não encontrada.</p>
      </div>
    );
  }

  const whatsapp = job.contact?.whatsapp || job.whatsapp;
  const email = job.contact?.email || job.email;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/empregos" className="p-2 -ml-2 rounded-full hover:bg-muted touch-target">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">{job.jobTitle}</h1>
            <p className="text-xs text-muted-foreground truncate">{job.companyName}</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        <div className="bg-card rounded-2xl p-4 card-shadow">
          <div className="flex flex-wrap gap-2">
            <Chip>{job.employmentType}</Chip>
            <Chip>{job.workModel}</Chip>
            {job.salaryRange ? <Chip>{job.salaryRange}</Chip> : null}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.city}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(job.postedAt).toLocaleDateString("pt-BR")}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {(job.tags || []).slice(0, 12).map((t: string) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>

          {(whatsapp || email) && (
            <div className="flex gap-2 mt-4">
              {whatsapp && (
                <a
                  href={`https://wa.me/${String(whatsapp).replace(/\D/g, "")}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="w-4 h-4" /> Candidatar via WhatsApp
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted font-medium"
                >
                  <Mail className="w-4 h-4" /> Enviar e-mail
                </a>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
