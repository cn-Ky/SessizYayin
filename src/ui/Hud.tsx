interface Props {
  sanity: number;
  danger: number;
  muted: boolean;
  onMute: () => void;
  onMenu: () => void;
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 font-mono-ui text-[9px] tracking-[0.2em] text-bone/60 sm:w-16 sm:text-[10px]">{label}</span>
      <div className="h-1.5 w-20 overflow-hidden rounded bg-white/10 sm:w-32" role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export function Hud({ sanity, danger, muted, onMute, onMenu }: Props) {
  const btn =
    'grid h-10 w-10 place-items-center rounded-full border border-bone/25 bg-black/50 text-sm backdrop-blur-sm transition hover:border-ember/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-ember';
  return (
    <div className="safe-t safe-x pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between">
      <div className="flex flex-col gap-1.5">
        <Bar label="AKIL" value={sanity} color="#7fb6ff" />
        <Bar label="TEHLİKE" value={danger} color="#d7313d" />
      </div>
      <div className="pointer-events-auto flex gap-2">
        <button className={btn} onClick={onMute} aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}>
          {muted ? '🔇' : '🔊'}
        </button>
        <button className={btn} onClick={onMenu} aria-label="Ana menü">≡</button>
      </div>
    </div>
  );
}
