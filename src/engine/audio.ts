// Tamamen prosedürel WebAudio: ses dosyası gerekmez.
// Drone + rüzgâr + kalp atışı + müzik kutusu ninnisi + korku vuruşu + yazı tık sesi.

export class HorrorAudio {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private droneGain!: GainNode;
  private windGain!: GainNode;
  private heartGain!: GainNode;
  private droneOscs: OscillatorNode[] = [];
  private heartTimer = 0;
  private boxTimer = 0;
  private danger = 0;
  private muted = false;

  get ready() { return !!this.ctx; }

  /** Kullanıcı etkileşiminden sonra çağrılmalı (tarayıcı otomatik oynatma kuralı). */
  async init() {
    if (this.ctx) { await this.ctx.resume(); return; }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(ctx.destination);

    // drone: iki hafif detune testere + düşük geçiren filtre
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 180; lp.Q.value = 4;
    this.droneGain = ctx.createGain(); this.droneGain.gain.value = 0.18;
    for (const f of [48.0, 48.7, 72.3]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth'; o.frequency.value = f;
      o.connect(lp); o.start();
      this.droneOscs.push(o);
    }
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain(); lfoG.gain.value = 60;
    lfo.connect(lfoG).connect(lp.frequency); lfo.start();
    lp.connect(this.droneGain).connect(this.master);

    // rüzgâr: filtrelenmiş beyaz gürültü
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource(); noise.buffer = nb; noise.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 0.7;
    const wl = ctx.createOscillator(); wl.frequency.value = 0.11;
    const wlg = ctx.createGain(); wlg.gain.value = 260;
    wl.connect(wlg).connect(bp.frequency); wl.start();
    this.windGain = ctx.createGain(); this.windGain.gain.value = 0.10;
    noise.connect(bp).connect(this.windGain).connect(this.master); noise.start();

    this.heartGain = ctx.createGain(); this.heartGain.gain.value = 0;
    this.heartGain.connect(this.master);

    this.scheduleHeart();
    this.scheduleBox();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.1);
  }
  get isMuted() { return this.muted; }

  /** Ortama ve tehlikeye göre miks. */
  setMood(danger01: number, outdoor: boolean) {
    this.danger = danger01;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.windGain.gain.setTargetAtTime(outdoor ? 0.16 : 0.05, t, 0.8);
    this.droneGain.gain.setTargetAtTime(0.14 + danger01 * 0.2, t, 0.8);
    this.heartGain.gain.setTargetAtTime(Math.min(1, danger01 * 1.4), t, 0.4);
    this.droneOscs.forEach((o, i) => o.frequency.setTargetAtTime([48, 48.7, 72.3][i] * (1 + danger01 * 0.04), t, 1.5));
  }

  private scheduleHeart() {
    const beat = () => {
      if (!this.ctx) return;
      if (this.danger > 0.15 && !this.muted) {
        this.thump(0); this.thump(0.18);
      }
      const bpm = 55 + this.danger * 95;
      this.heartTimer = window.setTimeout(beat, 60000 / bpm);
    };
    beat();
  }

  private thump(offset: number) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + offset;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(34, t + 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g).connect(this.heartGain); o.start(t); o.stop(t + 0.25);
  }

  // müzik kutusu ninnisi: seyrek, detone, tedirgin edici
  private scheduleBox() {
    const notes = [523.25, 659.25, 587.33, 493.88, 523.25, 392.0, 440.0, 349.23];
    let i = 0;
    const play = () => {
      if (!this.ctx) return;
      if (!this.muted && Math.random() < 0.35 + this.danger * 0.4) {
        const detune = (Math.random() - 0.5) * (20 + this.danger * 60);
        this.pluck(notes[i % notes.length], detune);
        i++;
      }
      this.boxTimer = window.setTimeout(play, 1400 + Math.random() * 1800);
    };
    this.boxTimer = window.setTimeout(play, 4000);
  }

  private pluck(freq: number, detuneCents: number) {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq; o.detune.value = detuneCents;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    const delay = ctx.createDelay(); delay.delayTime.value = 0.32;
    const fb = ctx.createGain(); fb.gain.value = 0.35;
    o.connect(g); g.connect(this.master); g.connect(delay); delay.connect(fb).connect(delay); delay.connect(this.master);
    o.start(t); o.stop(t + 1.8);
  }

  /** Korku vuruşu: gürültü patlaması + uyumsuz ton kümesi. */
  scare(kind: 'flash' | 'figure' | 'static' | 'blackout') {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const len = kind === 'static' ? 0.9 : 0.6;
    const nb = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource(); src.buffer = nb;
    const hp = ctx.createBiquadFilter(); hp.type = kind === 'blackout' ? 'lowpass' : 'highpass';
    hp.frequency.value = kind === 'blackout' ? 220 : 1200;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    src.connect(hp).connect(g).connect(this.master); src.start(t);
    if (kind !== 'static') {
      for (const f of [110, 116.5, 164.8, 233]) {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
        const og = ctx.createGain(); og.gain.setValueAtTime(0.0001, t);
        og.gain.exponentialRampToValueAtTime(0.12, t + 0.03); og.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
        o.connect(og).connect(this.master); o.start(t); o.stop(t + 1.3);
      }
    }
  }

  /** Metin yazılırken kısa tık. */
  tick() {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 900 + Math.random() * 300;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.012, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.04);
  }

  choose() {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx; const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(110, t + 0.25);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.32);
  }

  dispose() {
    clearTimeout(this.heartTimer); clearTimeout(this.boxTimer);
    this.ctx?.close();
    this.ctx = null;
  }
}
