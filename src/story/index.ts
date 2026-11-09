import type { Scene } from './types';
import { scenes1 } from './scenes1';
import { scenes2 } from './scenes2';

export const SCENES: Record<string, Scene> = Object.fromEntries(
  [...scenes1, ...scenes2].map((s) => [s.id, s]),
);

export const START_SCENE = 'intro';
export * from './types';
