// Tüm ortamlar tek bir tam ekran fragment shader'ında çizilir (WebGL2 / GLSL ES 3.00).
export const VERT = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

export const FRAG = `#version 300 es
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform int   uEnv;
uniform float uDanger;   // 0..1
uniform float uSanity;   // 0..1 (1 = sağlam)
uniform float uScare;    // 0..1 (anlık korku darbesi)
uniform float uFigure;   // 0..1 (figür yakınlığı)
uniform vec2  uLook;     // -1..1 hafif kamera kayması
out vec4 outColor;

float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+17.1; a*=0.5; } return v; }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

// koni ışık: orijinden açıya doğru yayılan hüzme
float beam(vec2 p, vec2 o, float ang, float w){
  vec2 d = p - o; float l = length(d);
  float a = atan(d.y, d.x);
  float da = abs(mod(a - ang + 3.14159, 6.28318) - 3.14159);
  return smoothstep(w, 0.0, da) * exp(-l*1.2);
}

// perspektif koridor: duvar/zemin/tavan desenleri, sis ve ışık halkaları
vec3 tunnel(vec2 p, float t, vec3 tint, float stripes, float fog, float flick){
  float r = max(abs(p.x), abs(p.y)*1.35) + 0.0005;
  float z = 0.32 / r;
  bool side = abs(p.x) > abs(p.y)*1.35;
  float u = side ? p.y/abs(p.x) : p.x/abs(p.y);
  float v = z - t*0.45;
  float tile = step(0.5, fract(u*stripes)) + step(0.5, fract(v));
  tile = mod(tile, 2.0);
  float grime = fbm(vec2(u*3.0, v*1.3));
  float zone = side ? 1.0 : (p.y < 0.0 ? 0.8 : 0.5);   // zemin biraz koyu, tavan daha koyu
  vec3 base = tint * (0.14 + 0.34*tile) * (0.5 + 0.9*grime) * zone;
  float ring = smoothstep(0.06, 0.0, abs(fract(v*0.5) - 0.5) - 0.44);
  base += tint * 1.6 * ring * flick * exp(-z*0.25);
  return base * exp(-z*fog) + tint*0.03;
}

vec3 shore(vec2 p, float t){
  vec3 sky = mix(vec3(0.015,0.02,0.04), vec3(0.07,0.09,0.13), p.y + 0.4);
  sky += fbm(p*vec2(2.0,5.0) + vec2(t*0.04, 0.0)) * 0.10 * smoothstep(-0.1, 0.5, p.y);
  float bolt = pow(max(0.0, sin(t*0.37)*sin(t*1.9 + 1.0)), 24.0);
  float fl = bolt + uScare*0.5;
  sky += vec3(0.5,0.6,0.8) * fl * 0.7;
  vec3 col = sky;
  float horizon = -0.08;
  if(p.y < horizon){
    float dy = horizon - p.y;
    float w = fbm(vec2(p.x*(5.0/(dy+0.10)) + t*0.25, dy*28.0 - t*0.7));
    float foam = smoothstep(0.62, 0.86, w + fbm(p*vec2(9.0,24.0) + t)*0.25);
    col = mix(vec3(0.008,0.018,0.03), vec3(0.035,0.06,0.085), w);
    col += vec3(0.45,0.55,0.65) * foam * 0.10 * (1.0 - dy*1.4);
    col += vec3(0.5,0.6,0.7) * fl * 0.12;
    // fener hüzmesinin suya yansıması
    col += vec3(1.0,0.8,0.5) * 0.012 / (abs(p.x - 0.34 + sin(t*0.9)*0.2*dy) + 0.02) * w * exp(-dy*2.0);
  }
  // fener kulesi
  vec2 tp = vec2(0.34, 0.0);
  float tw = mix(0.05, 0.028, clamp((p.y - horizon)/0.45, 0.0, 1.0));
  float tower = step(abs(p.x - tp.x), tw) * step(horizon, p.y) * step(p.y, 0.34);
  float stripe = step(0.5, fract((p.y+1.0)*7.0));
  col = mix(col, vec3(0.05,0.05,0.06) + vec3(0.04)*stripe, tower);
  vec2 lamp = vec2(tp.x, 0.375);
  float room = step(abs(p.x - lamp.x), 0.035) * step(abs(p.y - lamp.y), 0.032);
  col = mix(col, vec3(1.0,0.85,0.5), room);
  float ang = t*0.9;
  col += vec3(1.0,0.85,0.55) * beam(p, lamp, ang, 0.10) * 0.9;
  col += vec3(1.0,0.85,0.55) * beam(p, lamp, ang + 3.14159, 0.10) * 0.9;
  col += vec3(1.0,0.8,0.5) * 0.02 / (dot(p-lamp,p-lamp) + 0.002);
  return col;
}

vec3 radioRoom(vec2 p, float t){
  vec3 col = tunnel(p*1.4, t*0.0, vec3(0.10,0.14,0.12), 2.0, 1.4, 1.0);
  // verici paneli
  vec2 q = p - vec2(0.0, -0.02);
  float panel = step(abs(q.x), 0.42) * step(abs(q.y), 0.22);
  col = mix(col, vec3(0.03,0.035,0.04), panel);
  for(int i=0;i<12;i++){
    float fi = float(i);
    float bx = -0.36 + fi*0.065;
    float h = 0.03 + 0.15*noise(vec2(fi*3.1, t*(2.0 + fi*0.1)));
    float bar = step(abs(q.x - bx), 0.018) * step(q.y, -0.2 + h*2.0) * step(-0.2, q.y);
    col += vec3(0.2,1.0,0.5) * bar * panel * 0.7;
  }
  float dial = smoothstep(0.012, 0.0, abs(length(q - vec2(0.28,0.12)) - 0.07));
  col += vec3(1.0,0.6,0.2) * dial * (0.5 + 0.5*sin(t*3.0));
  col += vec3(0.1,0.5,0.3) * 0.015 / (dot(q,q) + 0.04);
  return col;
}

vec3 archive(vec2 p, float t){
  vec3 col = tunnel(p, t*0.4, vec3(0.16,0.13,0.09), 5.0, 0.9, 0.7 + 0.3*sin(t*12.0));
  float shelf = step(0.82, abs(p.x)*1.6) ;
  col += vec3(0.05,0.04,0.03) * shelf * fbm(vec2(p.y*40.0, p.x*3.0));
  col += vec3(1.0,0.75,0.4) * beam(p, vec2(0.0,0.0), t*0.6, 0.08) * 0.45;
  return col;
}

vec3 stairs(vec2 p, float t){
  vec2 q = rot(t*0.18) * p;
  vec3 col = tunnel(q, t*0.9, vec3(0.20,0.20,0.24), 8.0, 1.0, 0.5 + 0.5*sin(t*2.0));
  float spiral = smoothstep(0.05, 0.0, abs(fract(atan(q.y,q.x)/6.28318*3.0 + 0.32/max(length(q),0.001) - t*0.6) - 0.5) - 0.45);
  col += vec3(0.1,0.12,0.2) * spiral * 0.6;
  return col;
}

vec3 lampRoom(vec2 p, float t){
  vec3 col = vec3(0.02,0.025,0.04) + fbm(p*3.0 + t*0.05) * 0.04;
  float lens = length(p * vec2(1.0, 0.9));
  for(int i=0;i<6;i++){
    float fi = float(i);
    float ring = smoothstep(0.01, 0.0, abs(lens - 0.12 - fi*0.07));
    col += vec3(0.8,0.7,0.4) * ring * 0.25;
  }
  float ang = t*0.9;
  col += vec3(1.0,0.9,0.6) * beam(p, vec2(0.0), ang, 0.18) * 1.4;
  col += vec3(1.0,0.9,0.6) * beam(p, vec2(0.0), ang + 3.14159, 0.18) * 1.4;
  col += vec3(1.0,0.85,0.55) * 0.05 / (lens*lens + 0.01);
  float rain = step(0.995, hash(vec2(floor(p.x*80.0), floor(p.y*10.0 + t*30.0))));
  col += vec3(0.6,0.7,0.9) * rain * 0.4;
  return col;
}

vec3 cellar(vec2 p, float t){
  vec3 col = tunnel(p, t*0.1, vec3(0.06,0.12,0.14), 3.0, 1.2, 0.5 + 0.5*sin(t*1.5));
  if(p.y < -0.12){
    float dy = -0.12 - p.y;
    float rip = sin(dy*60.0 - t*2.5 + noise(p*10.0)*4.0) * 0.5 + 0.5;
    vec3 wcol = mix(vec3(0.02,0.05,0.06), vec3(0.08,0.14,0.16), rip);
    wcol += vec3(1.0,0.8,0.5) * 0.02 / (p.x*p.x*10.0 + dy*dy + 0.01) * 0.2;
    col = mix(col, wcol, 0.85);
  }
  float bulb = 0.03 / (dot(p-vec2(0.0,0.3), p-vec2(0.0,0.3)) + 0.003) * (0.7 + 0.3*sin(t*17.0)*step(0.9, hash(vec2(floor(t*6.0),1.0))));
  col += vec3(1.0,0.75,0.4) * bulb * 0.06;
  return col;
}

vec3 mirrorRoom(vec2 p, float t){
  vec3 col = vec3(0.03,0.04,0.06) + fbm(p*2.0 + t*0.03) * 0.05;
  float frame = step(abs(p.x), 0.30) * step(abs(p.y), 0.42);
  vec3 inside = mix(vec3(0.10,0.14,0.2), vec3(0.4,0.45,0.55), smoothstep(0.4, -0.2, length(p - vec2(0.0,0.05))));
  inside += vec3(1.0,0.85,0.5) * 0.03 / (dot(p-vec2(0.14,-0.02), p-vec2(0.14,-0.02)) + 0.004);
  col = mix(col, inside, frame);
  float edge = smoothstep(0.012, 0.0, abs(max(abs(p.x)-0.30, abs(p.y)-0.42)));
  col += vec3(0.5,0.55,0.65) * edge * 0.6;
  float figure = smoothstep(0.1, 0.07, length((p - vec2(-0.02,-0.12)) * vec2(1.4, 0.8)));
  figure += smoothstep(0.045, 0.03, length(p - vec2(-0.02, 0.12)));
  col = mix(col, vec3(0.02), clamp(figure, 0.0, 1.0) * frame * 0.85);
  return col;
}

float sdEll(vec2 p, vec2 r){ return (length(p/r) - 1.0) * min(r.x, r.y); }
float sdCap(vec2 p, vec2 a, vec2 b, float r){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
  return length(pa - ba*h) - r;
}

// Işıklı Figür: omuzları düşük, başı hafif eğik, uzanmış kolunda fener taşıyan uzun palto silueti
vec3 figureOverlay(vec3 col, vec2 p, float t){
  if(uFigure < 0.01) return col;
  float sc = mix(0.30, 1.15, uFigure);
  float sway = sin(t*0.5) * 0.012;
  vec2 q = (p - vec2(sin(t*0.4)*0.05, -0.05)) / sc;
  float hem = -0.42 + noise(vec2(q.x*18.0, t*0.6)) * 0.05;
  float coatW = mix(0.20, 0.09, smoothstep(-0.42, 0.13, q.y));
  float coat = max(abs(q.x + sway) - coatW, max(q.y - 0.15, hem - q.y));
  float shoulders = sdEll(q - vec2(sway, 0.13), vec2(0.15, 0.05));
  float neck = max(abs(q.x - sway*1.5) - 0.022, max(q.y - 0.27, 0.12 - q.y));
  float head = sdEll(q - vec2(0.012 + sway*2.0, 0.315), vec2(0.058, 0.075));
  vec2 hand = vec2(0.255, -0.085);
  float arm = sdCap(q, vec2(0.10, 0.12), hand, 0.026);
  float arm2 = sdCap(q, vec2(-0.10, 0.12), vec2(-0.13, -0.16), 0.024);
  float d = min(min(min(coat, shoulders), min(neck, head)), min(arm, arm2));
  float sil = smoothstep(0.008, -0.004, d);
  // fener: gövde + sıcak ışık + yere düşen koni
  vec2 lq = q - hand + vec2(0.0, 0.035);
  float lantern = smoothstep(0.012, 0.0, max(abs(lq.x) - 0.018, abs(lq.y) - 0.03));
  float glow = 0.05 / (dot(lq, lq) + 0.0016);
  float flick = 0.85 + 0.15*sin(t*23.0) * sin(t*7.0);
  col = mix(col, vec3(0.004,0.004,0.008), sil * 0.97);
  col += vec3(1.0,0.78,0.42) * glow * 0.20 * flick * (1.0 - sil * 0.0);
  col = mix(col, vec3(1.0,0.82,0.5), lantern * 0.9);
  float cone = smoothstep(0.35, 0.0, abs(lq.x - (-lq.y)*0.45) + max(0.0, lq.y + 0.04)) * step(lq.y, -0.04);
  col += vec3(1.0,0.75,0.4) * cone * 0.10 * flick * exp(-length(lq) * 1.6);
  return col;
}

vec3 scene(vec2 p, float t){
  vec3 c;
  if(uEnv == 0) c = shore(p, t);
  else if(uEnv == 1) c = tunnel(p, t*0.2, vec3(0.13,0.15,0.17), 4.0, 0.8, 0.6 + 0.4*sin(t*9.0));
  else if(uEnv == 2) c = radioRoom(p, t);
  else if(uEnv == 3) c = archive(p, t);
  else if(uEnv == 4) c = stairs(p, t);
  else if(uEnv == 5) c = lampRoom(p, t);
  else if(uEnv == 6) c = cellar(p, t);
  else c = mirrorRoom(p, t);
  return figureOverlay(c, p, t);
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = (fc - 0.5*uRes) / min(uRes.x*1.35, uRes.y);
  uv += uLook * 0.015;
  float t = uTime;
  // glitch: yatay dilim kayması
  float row = floor(uv.y*34.0);
  float g = uScare * step(0.72, hash(vec2(row, floor(t*18.0))));
  uv.x += g * (hash(vec2(t, row)) - 0.5) * 0.18;
  float ca = 0.0015 + (1.0 - uSanity)*0.006 + uScare*0.02;
  vec3 col;
  col.r = scene(uv + vec2(ca, 0.0), t).r;
  col.g = scene(uv, t).g;
  col.b = scene(uv - vec2(ca, 0.0), t).b;

  // sis nefes
  col += vec3(0.02,0.03,0.04) * fbm(uv*3.0 + t*0.05);
  // vinyet + tehlike kızıllığı
  float v = smoothstep(1.15, 0.15, length(uv*vec2(0.9,1.1)));
  col *= mix(0.30, 1.0, v);
  col += vec3(0.30,0.0,0.0) * uDanger * (1.0 - v) * (0.6 + 0.4*sin(t*(4.0 + uDanger*6.0)));
  // akıl: renk solması
  float l = dot(col, vec3(0.299,0.587,0.114));
  col = mix(vec3(l), col, 0.35 + 0.65*uSanity);
  // korku flaşı
  col = mix(col, vec3(1.0) - col, step(0.9, uScare) * step(0.5, hash(vec2(floor(t*40.0), 3.0))));
  // grain + tarama çizgisi
  col *= 1.3;
  col += (hash(fc + t*61.0) - 0.5) * 0.05;
  col *= 0.97 + 0.03*sin(fc.y*1.7);
  col = max(col, 0.0);
  col = col / (col + 0.85) * 1.55;   // yumuşak tonlama
  outColor = vec4(pow(col, vec3(0.92)), 1.0);
}`;
