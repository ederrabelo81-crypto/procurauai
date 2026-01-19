import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, FileText, Gift, Send, Building2, MessageCircle, Mail, Heart, Share2 } from "lucide-react";
import { ListingHero } from "@/components/listing/ListingHero";
import { ListingTabs, TabItem } from "@/components/listing/ListingTabs";
import { Chip } from "@/components/ui/Chip";
import { jobs } from "@/data/newListingTypes";
import { formatTag } from "@/lib/tags";
import { useFavorites } from "@/hooks/useFavorites";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Vaga não encontrada.</p>
          <button 
            onClick={() => navigate('/empregos')} 
            className="text-primary underline"
          >
            Voltar para Empregos
          </button>
        </div>
      </div>
    );
  }

  const isLiked = isFavorite('job', job.id);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Veja a vaga de ${job.jobTitle} em ${job.companyName}!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: job.jobTitle, text, url });
      } catch {
        // usuário cancelou
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    }
  };

  const handleWhatsApp = () => {
    if (job.whatsapp) {
      const msg = encodeURIComponent(`Olá! Vi a vaga de ${job.jobTitle} no Tudo de Monte e gostaria de me candidatar.`);
      window.open(`https://wa.me/${job.whatsapp}?text=${msg}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (job.email) {
      window.open(`mailto:${job.email}?subject=Candidatura: ${job.jobTitle}`, '_self');
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/buscar?filters=${encodeURIComponent(tag)}`);
  };

  // Tabs do mini-site
  const tabs: TabItem[] = [
    {
      id: 'descricao',
      label: 'Descrição',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="space-y-6 px-4">
          {/* Info rápida */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {job.employmentType}
            </span>
            <span className="px-3 py-1.5 bg-muted rounded-full text-sm font-medium">
              {formatTag(job.workModel)}
            </span>
            {job.salaryRange && (
              <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {job.salaryRange}
              </span>
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {job.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {new Date(job.postedAt).toLocaleDateString("pt-BR")}
            </span>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Sobre a vaga</h3>
            <p className="text-muted-foreground leading-relaxed">{job.description}</p>
          </div>

          {/* Tags clicáveis */}
          {job.tags && job.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Características</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Chip key={tag} onClick={() => handleTagClick(tag)} size="sm" className="cursor-pointer">
                    {formatTag(tag)}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'requisitos',
      label: 'Requisitos',
      icon: <FileText className="w-4 h-4" />,
      count: job.requirements?.length || 0,
      hideIfEmpty: !job.requirements || job.requirements.length === 0,
      content: (
        <div className="px-4 space-y-6">
          {/* Requisitos */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Requisitos</h3>
            <ul className="space-y-2">
              {job.requirements?.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Diferenciais */}
          {job.differentials && job.differentials.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Diferenciais</h3>
              <ul className="space-y-2">
                {job.differentials.map((diff, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    {diff}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'beneficios',
      label: 'Benefícios',
      icon: <Gift className="w-4 h-4" />,
      count: job.benefits?.length || 0,
      hideIfEmpty: !job.benefits || job.benefits.length === 0,
      content: (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-2">
            {job.benefits?.map((benefit) => (
              <div key={benefit} className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
                <Gift className="w-4 h-4 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'candidatar',
      label: 'Candidatar',
      icon: <Send className="w-4 h-4" />,
      content: (
        <div className="px-4 space-y-4">
          {job.howToApply && (
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">Como se candidatar</h3>
              <p className="text-muted-foreground">{job.howToApply}</p>
            </div>
          )}

          <div className="space-y-2">
            {job.whatsapp && (
              <button
                onClick={handleWhatsApp}
                className="w-full h-12 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Candidatar via WhatsApp
              </button>
            )}
            {job.email && (
              <button
                onClick={handleEmail}
                className="w-full h-12 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Mail className="w-5 h-5" />
                Enviar e-mail
              </button>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero */}
      <ListingHero
        coverImage={job.logo || '/placeholder.svg'}
        avatar={job.logo}
        title={job.jobTitle}
        category={job.companyName}
        neighborhood={job.city}
        isFavorite={isLiked}
        onFavoriteToggle={() => toggleFavorite('job', job.id)}
        onShare={handleShare}
        badges={
          <>
            <span className="px-2.5 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary-foreground shadow">
              {job.employmentType}
            </span>
            <span className="px-2.5 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground shadow">
              {formatTag(job.workModel)}
            </span>
            {job.salaryRange && (
              <span className="px-2.5 py-1 bg-green-500 text-white rounded-full text-xs font-medium shadow">
                {job.salaryRange}
              </span>
            )}
          </>
        }
      />

      {/* Tabs */}
      <ListingTabs tabs={tabs} defaultTab="descricao" className="mt-4" />

      {/* Ações sticky */}
      <div className="fixed bottom-16 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border p-3 safe-bottom">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          {/* Candidatar - ação principal */}
          {job.whatsapp ? (
            <button
              onClick={handleWhatsApp}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg"
            >
              <Send className="w-5 h-5" />
              <span>Candidatar-se</span>
            </button>
          ) : job.email ? (
            <button
              onClick={handleEmail}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg"
            >
              <Mail className="w-5 h-5" />
              <span>Candidatar-se</span>
            </button>
          ) : (
            <div className="flex-1 h-12 bg-muted rounded-xl flex items-center justify-center gap-2 text-muted-foreground">
              <Send className="w-5 h-5" />
              <span>Sem contato disponível</span>
            </div>
          )}

          {/* Favoritar */}
          <button
            onClick={() => toggleFavorite('job', job.id)}
            className="h-12 w-12 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-foreground transition-colors"
            aria-label={isLiked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className={isLiked ? 'w-5 h-5 fill-destructive text-destructive' : 'w-5 h-5'} />
          </button>

          {/* Compartilhar */}
          <button
            onClick={handleShare}
            className="h-12 w-12 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-foreground transition-colors"
            aria-label="Compartilhar"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}