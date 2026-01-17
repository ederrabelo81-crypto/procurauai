import { normalizeText } from './tagUtils';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function to24h(hour: number, ampm?: 'am' | 'pm') {
  let h = hour;
  if (ampm === 'pm' && h < 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;
  return h;
}

function parseTimePart(partRaw: string): { h: number; m: number } | null {
  const t = normalizeText(partRaw)
    .replace('horario:', '')
    .replace('horário:', '')
    .replace('h', ':')
    .trim();

  if (t.includes('24 horas') || t === '24h') return { h: 0, m: 0 };

  const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!m) return null;

  const hh = Number(m[1]);
  const mm = m[2] ? Number(m[2]) : 0;
  const ampm = (m[3] as 'am' | 'pm' | undefined);

  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  const h24 = ampm ? to24h(hh, ampm) : hh;
  if (h24 < 0 || h24 > 23 || mm < 0 || mm > 59) return null;

  return { h: h24, m: mm };
}

export function formatHours(hoursString: string, isOpenNow?: boolean) {
  if (isOpenNow) {
    return `Aberto agora • ${hoursString}`;
  }
  return hoursString;
}

  const raw = hoursRaw.trim();
  const n = normalizeText(raw);

  if (n.includes('24 horas') || n === '24h') return 'Horário: 24h';

  // separadores comuns
  const sep =
    raw.includes('às') ? 'às' :
    raw.includes('-') ? '-' :
    raw.includes('–') ? '–' :
    null;

  if (!sep) {
    // já pode estar “7h às 21h” sem prefixo, ou algo não parseável
    // tenta achar dois horários mesmo sem separador padronizado
    return raw.toLowerCase().includes('hor')
      ? raw
      : `Horário: ${raw}`;
  }

  const parts = raw.split(sep);
  if (parts.length < 2) return `Horário: ${raw}`;

  const start = parseTimePart(parts[0]);
  const end = parseTimePart(parts[1]);

  if (!start || !end) {
    return raw.toLowerCase().includes('hor')
      ? raw
      : `Horário: ${raw}`;
  }

  // saída “7h às 21h” (sem minutos se for :00)
  const startStr = start.m === 0 ? `${start.h}h` : `${pad2(start.h)}:${pad2(start.m)}`;
  const endStr = end.m === 0 ? `${end.h}h` : `${pad2(end.h)}:${pad2(end.m)}`;

  return `Horário: ${startStr} às ${endStr}`;
}
