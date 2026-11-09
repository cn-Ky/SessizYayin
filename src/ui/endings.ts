import type { EndingId } from '../story';

export const ALL_ENDINGS: EndingId[] = ['gercek', 'kacis', 'yanki', 'sessizlik', 'dongu'];

export const ENDING_NAMES: Record<EndingId, string> = {
  gercek: 'Gün Ağarıyor',
  kacis: 'Hayalet Kaçışı',
  yanki: 'Yankı',
  sessizlik: 'Sessiz Yayın',
  dongu: 'Döngü',
};

export const ENDING_COLORS: Record<EndingId, string> = {
  gercek: '#ffd58a',
  kacis: '#d7313d',
  yanki: '#9fb6c8',
  sessizlik: '#8d93a0',
  dongu: '#b48cff',
};
