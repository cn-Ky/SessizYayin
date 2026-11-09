import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Choice, Flag, Scene } from '../story';
import { visibleChoices } from '../game/useGame';

interface Props {
  scene: Scene;
  flags: Flag[];
  onChoose: (c: Choice) => void;
  onTimeout: (to: string) => void;
  onTick: () => void;
}

export function Narrative({ scene, flags, onChoose, onTimeout, onTick }: Props) {
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);
  const [done, setDone] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const choices = useMemo(() => visibleChoices(scene, flags), [scene, flags]);

  useEffect(() => {
    setLine(0); setChars(0); setDone(false); setRemaining(null);
  }, [scene.id]);

  // daktilo efekti
  useEffect(() => {
    if (done) return;
    const text = scene.lines[line] ?? '';
    if (chars < text.length) {
      const ch = text[chars];
      const delay = ch === '.' || ch === '…' ? 160 : ch === ',' ? 90 : 20;
      const id = window.setTimeout(() => {
        setChars((c) => c + 1);
        if (chars % 3 === 0) onTick();
      }, delay);
      return () => clearTimeout(id);
    }
    const id = window.setTimeout(() => {
      if (line < scene.lines.length - 1) { setLine((l) => l + 1); setChars(0); }
      else setDone(true);
    }, 420);
    return () => clearTimeout(id);
  }, [chars, line, done, scene, onTick]);

  const skip = useCallback(() => {
    if (done) return;
    setLine(scene.lines.length - 1);
    setChars(scene.lines[scene.lines.length - 1].length);
    setDone(true);
  }, [done, scene]);

  // süreli seçim
  useEffect(() => {
    if (!done || !scene.timer) return;
    const total = scene.timer.seconds * 1000;
    const start = Date.now();
    const id = window.setInterval(() => {
      const left = total - (Date.now() - start);
      if (left <= 0) {
        clearInterval(id);
        setRemaining(0);
        onTimeout(scene.timer!.to);
      } else setRemaining(left / total);
    }, 80);
    return () => clearInterval(id);
  }, [done, scene, onTimeout]);

  // klavye: boşluk/enter atlar, 1-4 seçer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!done) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); skip(); }
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= choices.length) onChoose(choices[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, choices, onChoose, skip]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [line, chars, done]);

  const lines = scene.lines.slice(0, line + 1).map((t, i) => (i < line || done ? t : t.slice(0, chars)));

  return (
    <div className="mx-auto flex max-h-[80dvh] w-full max-w-3xl flex-col" onClick={skip}>
      {scene.speaker && (
        <div className="mb-2 font-mono-ui text-[11px] tracking-[0.32em] text-ember sm:text-xs">{scene.speaker}</div>
      )}
      <div
        ref={scroller}
        className="panel-scroll min-h-[4.5rem] flex-1 space-y-2.5 overflow-y-auto pr-1 text-[1.02rem] leading-relaxed sm:text-lg md:text-xl landscape:max-sm:space-y-1.5 landscape:max-sm:text-[0.92rem]"
      >
        {lines.map((t, i) => (
          <p key={i} className={`anim-fade ${scene.speaker ? 'italic text-ember/90' : ''}`}>
            {t}
            {!done && i === line && <span className="anim-breathe ml-0.5 inline-block w-2 bg-bone/80">&nbsp;</span>}
          </p>
        ))}
      </div>

      {done && scene.timer && remaining !== null && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded bg-white/10" aria-hidden>
          <div
            className="h-full bg-blood"
            style={{ width: `${Math.max(0, remaining) * 100}%`, transition: 'width 80ms linear' }}
          />
        </div>
      )}

      {done && choices.length > 0 && (
        <div className="mt-3 flex flex-col gap-2 sm:mt-4">
          {choices.map((c, i) => (
            <button
              key={c.text + i}
              onClick={(e) => { e.stopPropagation(); onChoose(c); }}
              className="anim-fade group flex min-h-12 landscape:max-sm:min-h-10 landscape:max-sm:py-2 w-full items-center gap-3 rounded-md border border-bone/25 bg-black/55 px-4 py-3 text-left text-[0.98rem] backdrop-blur-sm transition hover:border-ember/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-ember active:scale-[0.99] sm:text-lg"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="font-mono-ui text-xs text-ember/80 group-hover:text-ember">{i + 1}</span>
              <span>{c.text}</span>
            </button>
          ))}
        </div>
      )}
      {!done && (
        <div className="mt-2 text-right font-mono-ui text-[10px] tracking-widest text-bone/35">dokun / boşluk: atla</div>
      )}
    </div>
  );
}
