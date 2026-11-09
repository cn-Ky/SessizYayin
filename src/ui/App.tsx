import { useCallback, useEffect, useRef, useState } from 'react';
import { HorrorRenderer } from '../engine/renderer';
import { HorrorAudio } from '../engine/audio';
import { useGame } from '../game/useGame';
import type { Choice, EnvId } from '../story';
import { Narrative } from './Narrative';
import { Hud } from './Hud';
import { Title } from './Title';
import { Ending } from './Ending';

const OUTDOOR: EnvId[] = ['shore', 'lamp'];
const FIGURE_ENVS: EnvId[] = ['lobby', 'stairs', 'cellar', 'archive'];

export function App() {
  const game = useGame();
  const { scene, state } = game;
  const [phase, setPhase] = useState<'title' | 'play'>('title');
  const [muted, setMuted] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<HorrorRenderer | null>(null);
  const audioRef = useRef<HorrorAudio | null>(null);
  if (!audioRef.current) audioRef.current = new HorrorAudio();
  const audio = audioRef.current;

  // 3D sahne
  useEffect(() => {
    if (!HorrorRenderer.supported() || !canvasRef.current) { setWebgl(false); return; }
    try {
      const r = new HorrorRenderer(canvasRef.current);
      rendererRef.current = r;
      r.start();
      return () => { r.dispose(); rendererRef.current = null; };
    } catch {
      setWebgl(false);
    }
  }, []);

  // sahne değişince ortam, figür ve korku efektleri
  useEffect(() => {
    const r = rendererRef.current;
    if (!r) return;
    const playing = phase === 'play';
    const env: EnvId = playing ? scene.env : 'shore';
    r.setEnv(env);
    const danger = state.danger / 100;
    let figure = 0;
    if (playing && !scene.ending) {
      if (scene.scare === 'figure') figure = 0.85;
      else if (FIGURE_ENVS.includes(env) && danger > 0.25) figure = danger * 0.6;
    }
    r.setParams({ danger: playing ? danger : 0.1, sanity: playing ? state.sanity / 100 : 1, figure });
    audio.setMood(playing ? danger : 0.1, OUTDOOR.includes(env));
  }, [phase, scene, state.danger, state.sanity, audio]);

  useEffect(() => {
    if (phase !== 'play' || !scene.scare) return;
    const strength = { flash: 1, figure: 0.9, static: 0.8, blackout: 0.6 }[scene.scare];
    rendererRef.current?.pulseScare(strength);
    audio.scare(scene.scare);
  }, [phase, scene.id, scene.scare, audio]);

  // hafif kamera kayması
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const w = window.innerWidth, h = window.innerHeight;
    rendererRef.current?.setLook((e.clientX / w - 0.5) * 2, -(e.clientY / h - 0.5) * 2);
  }, []);

  const start = useCallback(async (resume: boolean) => {
    await audio.init();
    if (resume) game.continueGame(); else game.newGame();
    setPhase('play');
  }, [audio, game]);

  const toggleMute = useCallback(() => {
    setMuted((m) => { audio.setMuted(!m); return !m; });
  }, [audio]);

  const onChoose = useCallback((c: Choice) => { audio.choose(); game.go(c); }, [audio, game]);
  const onTimeout = useCallback((to: string) => { game.go({ to, danger: 15, sanity: -8 }); }, [game]);
  const onTick = useCallback(() => audio.tick(), [audio]);

  return (
    <div className="fixed inset-0 h-dvh w-full overflow-hidden bg-ink" onPointerMove={onPointerMove}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      {!webgl && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,#1b2733,#05070a_70%)]">
          <p className="safe-t safe-x text-center font-mono-ui text-[10px] tracking-widest text-bone/40">
            WebGL2 desteklenmiyor, 3D sahneler devre dışı
          </p>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {phase === 'title' && (
        <Title
          hasSave={game.hasSave}
          endings={game.endings}
          muted={muted}
          onNew={() => start(false)}
          onContinue={() => start(true)}
          onMute={toggleMute}
        />
      )}

      {phase === 'play' && (
        <>
          <Hud sanity={state.sanity} danger={state.danger} muted={muted} onMute={toggleMute} onMenu={() => setPhase('title')} />

          {scene.title && !scene.ending && (
            <div key={'c' + scene.id} className="pointer-events-none absolute inset-x-0 top-[18%] z-10 text-center landscape:max-sm:top-[13%]">
              <span className="anim-chapter inline-block font-mono-ui text-sm tracking-[0.4em] text-bone/90 sm:text-xl">{scene.title}</span>
            </div>
          )}

          {!scene.ending && (
            <div className="safe-b safe-x absolute inset-x-0 bottom-0 z-10 px-1 pt-6 sm:px-4">
              <Narrative scene={scene} flags={state.flags} onChoose={onChoose} onTimeout={onTimeout} onTick={onTick} />
            </div>
          )}

          {scene.scare === 'blackout' && <div key={'b' + scene.id} className="anim-blackout pointer-events-none absolute inset-0 z-20 bg-black" />}
          {scene.scare === 'flash' && <div key={'f' + scene.id} className="anim-flash pointer-events-none absolute inset-0 z-20 bg-white" />}

          {scene.ending && (
            <Ending scene={scene} endings={game.endings} onReplay={() => { game.newGame(); }} onMenu={() => { game.newGame(); setPhase('title'); }} />
          )}
        </>
      )}
    </div>
  );
}
