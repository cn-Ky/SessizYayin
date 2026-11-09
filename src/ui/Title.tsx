import { ENDING_NAMES, ALL_ENDINGS } from './endings';
import type { EndingId } from '../story';

interface Props {
  hasSave: boolean;
  endings: EndingId[];
  muted: boolean;
  onNew: () => void;
  onContinue: () => void;
  onMute: () => void;
}

export function Title({ hasSave, endings, muted, onNew, onContinue, onMute }: Props) {
  const primary =
    'min-h-12 w-full rounded-md border border-ember/70 bg-ember/10 px-6 py-3 text-lg tracking-[0.2em] text-ember transition hover:bg-ember/20 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-ember';
  const secondary =
    'min-h-12 w-full rounded-md border border-bone/25 bg-black/50 px-6 py-3 text-base tracking-[0.18em] transition hover:border-bone/60 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-ember';
  return (
    <div className="safe-t safe-b safe-x relative z-10 flex h-full flex-col items-center justify-between py-4 text-center">
      <div />
      <div className="flex w-full max-w-md flex-col items-center gap-3 px-2 landscape:max-sm:gap-1.5">
        <p className="font-mono-ui text-[10px] tracking-[0.5em] text-bone/55 sm:text-xs">KIYIKALE FENERİ · 00:20</p>
        <h1 className="anim-glitch text-[clamp(2.4rem,11vw,5.2rem)] font-bold leading-none tracking-[0.08em]">
          SESSİZ<br />YAYIN
        </h1>
        <p className="max-w-xs text-sm italic text-bone/70 sm:text-base">
          Seçimlerin hikâyeyi yazar. Işıktan kaçabilirsin. Ama kimden?
        </p>
        <div className="mt-4 flex w-full flex-col gap-2.5 landscape:max-sm:mt-1">
          {hasSave && <button className={primary} onClick={onContinue}>DEVAM ET</button>}
          <button className={hasSave ? secondary : primary} onClick={onNew}>{hasSave ? 'YENİ OYUN' : 'BAŞLA'}</button>
          <button className={secondary} onClick={onMute}>{muted ? 'SES: KAPALI' : 'SES: AÇIK'}</button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2" aria-label={`Bulunan sonlar ${endings.length}/${ALL_ENDINGS.length}`}>
          {ALL_ENDINGS.map((e) => (
            <span
              key={e}
              title={endings.includes(e) ? ENDING_NAMES[e] : '???'}
              className={`h-2 w-2 rounded-full ${endings.includes(e) ? 'bg-ember' : 'bg-white/15'}`}
            />
          ))}
        </div>
        <p className="font-mono-ui text-[10px] tracking-[0.25em] text-bone/45 sm:text-xs">
          SONLAR {endings.length}/{ALL_ENDINGS.length} · KULAKLIKLA ÖNERİLİR
        </p>
      </div>
    </div>
  );
}
