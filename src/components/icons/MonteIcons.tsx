import type { CategoryIconKey } from '@/data/mockData';

export type MonteIconName = CategoryIconKey;

type Props = {
  name: MonteIconName;
  className?: string;
};

// Ícones "exclusivos" do Monte de Tudo (simples, expressivos e consistentes)
// SVG inline pra não depender de libs externas.

export function MonteIcon({ name, className }: Props) {
  switch (name) {
    case 'food':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 3v7a4 4 0 0 0 4 4v7" />
          <path d="M8 3v7" />
          <path d="M20 3v10a4 4 0 0 1-4 4h-1v4" />
          <path d="M16 3v8" />
        </svg>
      );
    case 'classifieds':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 7h12l-1 13H7L6 7z" />
          <path d="M9 7V6a3 3 0 0 1 6 0v1" />
          <path d="M9 12h6" />
        </svg>
      );
    case 'deals':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12l-8 8-9-9V4h7l10 8z" />
          <circle cx="7.5" cy="7.5" r="1" />
          <path d="M14 7l-7 7" />
        </svg>
      );
    case 'services':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 7l3 3-9 9H5v-3l9-9z" />
          <path d="M13 6l2-2 3 3-2 2" />
          <path d="M5 19l4-4" />
        </svg>
      );
    case 'events':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3v3" />
          <path d="M17 3v3" />
          <path d="M4 8h16" />
          <rect x="4" y="6" width="16" height="16" rx="3" />
          <path d="M8 13h4" />
          <path d="M8 17h8" />
        </svg>
      );
    case 'obituary':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 21V7a4 4 0 0 1 8 0v14" />
          <path d="M6 21h12" />
          <path d="M11 10h2" />
          <path d="M12 9v2" />
        </svg>
      );
    case 'news':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="5" width="16" height="16" rx="3" />
          <path d="M8 9h8" />
          <path d="M8 13h8" />
          <path d="M8 17h5" />
        </svg>
      );
    case 'store':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7l2-3h12l2 3" />
          <path d="M4 7h16" />
          <path d="M6 7v13h12V7" />
          <path d="M9 20v-7h6v7" />
        </svg>
      );
    case 'places':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case 'cars':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17h14v-5l-2-4H7l-2 4v5z" />
          <circle cx="7.5" cy="17" r="1.5" />
          <circle cx="16.5" cy="17" r="1.5" />
          <path d="M5 12h14" />
        </svg>
      );
    case 'jobs':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M12 12v2" />
          <path d="M3 12h18" />
        </svg>
      );
    case 'realestate':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l9-9 9 9" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
    default:
      return null;
  }
}