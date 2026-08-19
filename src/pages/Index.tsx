import { Link } from "react-router-dom";
import {
  Briefcase,
  CalendarDays,
  HeartPulse,
  Home as HomeIcon,
  Store,
  Tag,
  Utensils,
} from "lucide-react";

import { CityMasthead } from "@/components/home/CityMasthead";
import { CityTicker } from "@/components/home/CityTicker";
import { HomeFooter } from "@/components/home/HomeFooter";

// Blocos da Home - cada um renderiza condicionalmente se tiver dados
import {
  ComerAgoraBlock,
  OfertasBlock,
  NegociosServicosBlock,
  AgendaBlock,
  LugaresBlock,
  ImoveisBlock,
  EmpregosBlock,
  ClassificadosBlock,
  NoticiasBlock,
} from "@/components/home/blocks";

/** Atalhos fixos logo abaixo do letreiro — os seis destinos mais buscados. */
const SHORTCUTS = [
  { to: "/categoria/comer-agora", label: "Comer", icon: Utensils },
  { to: "/categoria/ofertas", label: "Ofertas", icon: Tag },
  { to: "/categoria/servicos", label: "Serviços", icon: Store },
  { to: "/categoria/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/imoveis", label: "Imóveis", icon: HomeIcon },
  { to: "/empregos", label: "Vagas", icon: Briefcase },
  { to: "/saude-e-servicos", label: "Saúde", icon: HeartPulse },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      <CityMasthead />
      <CityTicker />

      {/* Atalhos */}
      <nav
        aria-label="Atalhos"
        className="flex gap-2 overflow-x-auto px-4 py-4 scrollbar-hide fade-edges"
      >
        {SHORTCUTS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-primary/50 card-shadow"
          >
            <Icon
              className="h-4 w-4 text-primary transition-transform group-hover:scale-110"
              strokeWidth={2.2}
            />
            <span className="text-sm font-semibold text-foreground">
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Conteúdo principal — 9 blocos de descoberta, revelados em cascata */}
      <main className="reveal-stagger space-y-10 px-4 pb-4">
        <ComerAgoraBlock />
        <OfertasBlock />
        <NegociosServicosBlock />
        <AgendaBlock />
        <LugaresBlock />
        <ImoveisBlock />
        <EmpregosBlock />
        <ClassificadosBlock />
        <NoticiasBlock />
      </main>

      <HomeFooter />
    </div>
  );
}
