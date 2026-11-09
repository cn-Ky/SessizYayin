import { VERT, FRAG } from './shader';
import type { EnvId } from '../story/types';

const ENV_INDEX: Record<EnvId, number> = {
  shore: 0, lobby: 1, radio: 2, archive: 3, stairs: 4, lamp: 5, cellar: 6, mirror: 7,
};

export interface RenderParams {
  danger: number;  // 0..1
  sanity: number;  // 0..1 (1 = sağlam)
  figure: number;  // 0..1
}

export class HorrorRenderer {
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private raf = 0;
  private t0 = performance.now();
  private env = 0;
  private params: RenderParams = { danger: 0, sanity: 1, figure: 0 };
  private cur: RenderParams = { danger: 0, sanity: 1, figure: 0 };
  private scare = 0;
  private look: [number, number] = [0, 0];
  private lookT: [number, number] = [0, 0];
  private quality = 1;
  private frames = 0;
  private lastCheck = performance.now();
  private ro: ResizeObserver;

  static supported(): boolean {
    try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
  }

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 desteklenmiyor');
    this.gl = gl;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader hatası');
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link hatası');
    this.prog = prog;
    gl.useProgram(prog);
    for (const n of ['uRes', 'uTime', 'uEnv', 'uDanger', 'uSanity', 'uScare', 'uFigure', 'uLook']) {
      this.u[n] = gl.getUniformLocation(prog, n);
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());
    this.resize();
  }

  setEnv(env: EnvId) { this.env = ENV_INDEX[env]; }
  setParams(p: Partial<RenderParams>) { this.params = { ...this.params, ...p }; }
  pulseScare(strength = 1) { this.scare = Math.max(this.scare, strength); }
  setLook(x: number, y: number) { this.lookT = [x, y]; }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * this.quality;
    const w = Math.max(2, Math.floor(this.canvas.clientWidth * dpr));
    const h = Math.max(2, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.gl.viewport(0, 0, w, h);
  }

  start() {
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.draw();
    };
    this.raf = requestAnimationFrame(loop);
  }

  private draw() {
    const gl = this.gl;
    const t = (performance.now() - this.t0) / 1000;
    const k = 0.06;
    this.cur.danger += (this.params.danger - this.cur.danger) * k;
    this.cur.sanity += (this.params.sanity - this.cur.sanity) * k;
    this.cur.figure += (this.params.figure - this.cur.figure) * 0.04;
    this.scare *= 0.93;
    if (this.scare < 0.01) this.scare = 0;
    this.look[0] += (this.lookT[0] - this.look[0]) * 0.05;
    this.look[1] += (this.lookT[1] - this.look[1]) * 0.05;

    gl.uniform2f(this.u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.u.uTime, t);
    gl.uniform1i(this.u.uEnv, this.env);
    gl.uniform1f(this.u.uDanger, this.cur.danger);
    gl.uniform1f(this.u.uSanity, this.cur.sanity);
    gl.uniform1f(this.u.uScare, this.scare);
    gl.uniform1f(this.u.uFigure, this.cur.figure);
    gl.uniform2f(this.u.uLook, this.look[0], this.look[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // basit uyarlanabilir kalite: yavaş cihazlarda çözünürlüğü düşür
    this.frames++;
    const now = performance.now();
    if (now - this.lastCheck > 1500) {
      const fps = (this.frames * 1000) / (now - this.lastCheck);
      this.frames = 0;
      this.lastCheck = now;
      if (fps < 28 && this.quality > 0.5) { this.quality -= 0.15; this.resize(); }
    }
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.gl.deleteProgram(this.prog);
  }
}
