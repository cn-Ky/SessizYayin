import type { EndingId, Scene } from '../story';
import { ALL_ENDINGS, ENDING_COLORS, ENDING_NAMES } from './endings';

interface Props {
  scene: Scene;
  endings: EndingId[];
  onReplay: () => void;
  onMenu: () => void;
}

export function Ending({ scene, endings, onReplay, onMenu }: Props) {
  const id = scene.ending!;
  const color = ENDING_COLORS[id];
  return (
    <div className="safe-t safe-b safe-x absolute inset-0 z-30 flex overflow-y-auto bg-black/60 py-6 backdrop-blur-[2px]">
      <div className="m-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 text-center">
        <p className="anim-fade font-mono-ui text-[10px] tracking-[0.5em] text-bone/55 sm:text-xs">SON</p>
        <h2 className="anim-fade text-[clamp(1.8rem,7vw,3.2rem)] font-bold tracking-[0.1em]" style={{ color, animationDelay: '200ms' }}>
          {ENDING_NAMES[id].toUpperCase()}
        </h2>
        <div className="space-y-3 text-base leading-relaxed sm:text-lg">
          {scene.lines.map((t, i) => (
            <p key={i} className="anim-fade text-bone/90" style={{ animationDelay: `${700 + i * 1100}ms` }}>
              {t}
            </p>
          ))}
        </div>
        <div className="anim-fade mt-2 flex flex-col items-center gap-2" style={{ animationDelay: `${900 + scene.lines.length * 1100}ms` }}>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono-ui text-[10px] tracking-widest sm:text-xs">
            {ALL_ENDINGS.map((e) => (
              <span key={e} className={endings.includes(e) ? 'text-ember' : 'text-bone/30'}>
                {endings.includes(e) ? ENDING_NAMES[e].toUpperCase() : '???'}
              </span>
            ))}
          </div>
          <p className="font-mono-ui text-[10px] tracking-[0.25em] text-bone/50 sm:text-xs">
            {endings.length}/{ALL_ENDINGS.length} SON BULUNDU
          </p>
          <div className="mt-2 flex w-full max-w-md flex-col gap-2.5 sm:flex-row">
            <button onClick={onReplay} className="min-h-12 flex-1 rounded-md border border-ember/70 bg-ember/10 px-5 py-3 whitespace-nowrap tracking-[0.15em] text-ember transition hover:bg-ember/20 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-ember">
              TEKRAR OYNA
            </button>
            <button onClick={onMenu} className="min-h-12 flex-1 rounded-md border border-bone/25 bg-black/50 px-5 py-3 tracking-[0.15em] transition hover:border-bone/60 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-ember">
              ANA MENÜ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
