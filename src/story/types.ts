// Hikâye grafiğinin tipleri. Sahneler düğüm, seçimler kenardır.

export type EnvId =
  | 'shore'      // fırtınalı kıyı, feneri görürüz
  | 'lobby'      // fener istasyonu girişi
  | 'radio'      // telsiz odası
  | 'archive'    // kayıt arşivi, bant rafları
  | 'stairs'     // sonsuz spiral merdiven
  | 'lamp'       // fener ışığı odası
  | 'cellar'     // mahzen, yayın kaynağı
  | 'mirror';    // son oda, ters köşe

export type Flag =
  | 'hasTape' | 'heardElif' | 'hidAtLobby' | 'brokeRadio' | 'readLog'
  | 'trustedVoice' | 'sawFigure' | 'openedCellar' | 'burnedTapes' | 'answeredCall';

export type EndingId = 'kacis' | 'yanki' | 'sessizlik' | 'dongu' | 'gercek';

export interface Choice {
  text: string;
  to: string;                 // hedef sahne id'si
  requires?: Flag[];          // görünmesi için gereken bayraklar
  hidden?: Flag[];            // bu bayraklardan biri varsa seçim gizlenir
  set?: Flag[];               // seçilince açılan bayraklar
  sanity?: number;            // akıl değişimi (-/+)
  danger?: number;            // tehlike değişimi (-/+)
}

export interface Scene {
  id: string;
  env: EnvId;
  title?: string;
  lines: string[];            // sırayla yazılan metinler
  speaker?: string;           // 'ELİF' (telsiz sesi) vb.
  choices?: Choice[];
  ending?: EndingId;          // varsa oyun biter
  scare?: 'flash' | 'figure' | 'static' | 'blackout';
  timer?: { seconds: number; to: string }; // süre dolunca otomatik seçim
}

export interface GameState {
  scene: string;
  flags: Flag[];
  sanity: number;             // 0..100
  danger: number;             // 0..100
  visited: string[];
}
