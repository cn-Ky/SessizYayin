import { useCallback, useEffect, useState } from 'react';
import { SCENES, START_SCENE, type Choice, type EndingId, type Flag, type GameState, type Scene } from '../story';

const SAVE_KEY = 'sessiz-yayin:save';
const ENDS_KEY = 'sessiz-yayin:endings';
const clamp = (n: number) => Math.max(0, Math.min(100, n));

export const freshState = (): GameState => ({ scene: START_SCENE, flags: [], sanity: 100, danger: 10, visited: [] });

export function visibleChoices(scene: Scene, flags: Flag[]): Choice[] {
  return (scene.choices ?? []).filter(
    (c) => (!c.requires || c.requires.every((r) => flags.includes(r))) && !(c.hidden && c.hidden.some((h) => flags.includes(h))),
  );
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* özel pencere vb. */ }
}
function clear(key: string) {
  try { localStorage.removeItem(key); } catch { /* yoksay */ }
}

export function useGame() {
  const [state, setState] = useState<GameState>(freshState);
  const [endings, setEndings] = useState<EndingId[]>(() => load<EndingId[]>(ENDS_KEY, []));
  const [saved, setSaved] = useState<GameState | null>(() => {
    const s = load<GameState | null>(SAVE_KEY, null);
    return s && SCENES[s.scene] && !SCENES[s.scene].ending ? s : null;
  });

  const scene = SCENES[state.scene];

  const go = useCallback((c: Pick<Choice, 'to' | 'set' | 'sanity' | 'danger'>) => {
    setState((s) => {
      const target = SCENES[c.to];
      const flags = [...new Set([...s.flags, ...(c.set ?? [])])] as Flag[];
      const scareDrain = target?.scare ? -3 : 0;
      return {
        scene: c.to,
        flags,
        sanity: clamp(s.sanity + (c.sanity ?? 0) + scareDrain),
        danger: clamp(s.danger + (c.danger ?? 0) - 2),
        visited: [...s.visited, s.scene],
      };
    });
  }, []);

  // kayıt ve son takibi
  useEffect(() => {
    if (!scene) return;
    if (scene.ending) {
      clear(SAVE_KEY);
      setSaved(null);
      setEndings((prev) => {
        if (prev.includes(scene.ending!)) return prev;
        const next = [...prev, scene.ending!];
        save(ENDS_KEY, next);
        return next;
      });
    } else if (state.visited.length > 0) {
      save(SAVE_KEY, state);
    }
  }, [state, scene]);

  const newGame = useCallback(() => { setState(freshState()); }, []);
  const continueGame = useCallback(() => { if (saved) setState(saved); }, [saved]);

  return { state, scene, go, newGame, continueGame, endings, hasSave: !!saved };
}
