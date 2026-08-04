/**
 * All GLSL lives here. The visual identity of the whole site is the aurora
 * cosine palette in `PALETTE` — every glowing thing samples from it.
 */

export const SIMPLEX_3D = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

export const PALETTE = /* glsl */ `
// Aurora: teal -> ice blue -> violet -> magenta, drifting over time.
vec3 aurora(float t){
  vec3 a = vec3(0.42, 0.44, 0.52);
  vec3 b = vec3(0.38, 0.40, 0.44);
  vec3 c = vec3(0.90, 0.90, 0.90);
  vec3 d = vec3(0.00, 0.28, 0.62);
  return a + b * cos(6.28318 * (c * t + d));
}
`;

export const coreVertex = /* glsl */ `
uniform float uTime;
uniform float uTimeScale;
uniform float uSize;
uniform float uPixelRatio;
uniform vec3 uMouse;
uniform float uMouseActive;
uniform float uExcite;
uniform float uBurstAge;
uniform float uForce;    // +1 repel (default) · negative = gravity mode
uniform vec3 uShockPos;
uniform float uShockAge; // seconds since last shockwave, -1 when idle
uniform vec3 uWellPos[4];    // dropped gravity wells (terminal/click toy)
uniform float uWellStrength[4]; // 0 = inactive, decays to 0 over its lifetime
attribute float aSeed;
varying float vColorT;
varying float vAlpha;

${SIMPLEX_3D}

void main(){
  vec3 p = position;
  float r = length(p);
  float t = uTime * uTimeScale;

  // Differential rotation — inner particles spin faster, like a galaxy.
  float ang = t * (0.04 + 0.55 / (1.0 + r * r * 0.35)) * (1.0 + uExcite * 1.5);
  float ca = cos(ang); float sa = sin(ang);
  p.xz = mat2(ca, -sa, sa, ca) * p.xz;

  // Organic drift.
  float amp = 0.34 + uExcite * 0.55;
  vec3 np = p * 0.35;
  p += amp * vec3(
    snoise(np + vec3(0.0, 0.0, t * 0.07)),
    snoise(np + vec3(31.4, 0.0, t * 0.07)),
    snoise(np + vec3(0.0, 74.2, t * 0.07))
  );

  // Breathing.
  p *= 1.0 + sin(t * 0.55 + r * 1.4) * 0.025;

  // Cursor force — repels by default, becomes a wide gravity well when
  // uForce goes negative (terminal toy).
  vec3 dm = p - uMouse;
  float md2 = dot(dm, dm);
  float fRad = uForce < 0.0 ? 14.0 : 1.4;
  p += normalize(dm + 0.0001) * exp(-md2 / fRad) * 1.5 * uMouseActive * uForce;

  // Destabilize impulse (Lab node toy).
  float impulse = exp(-uBurstAge * 1.9) * step(0.001, uBurstAge);
  p += normalize(position + 0.0001) * impulse * (2.2 + aSeed * 2.4);

  // Travelling shockwave ring (double-click).
  vec3 ds = position - uShockPos;
  float sd = length(ds);
  float ring = exp(-pow(sd - uShockAge * 9.0, 2.0) * 0.55)
             * exp(-uShockAge * 1.4) * step(0.0, uShockAge);
  p += normalize(ds + 0.0001) * ring * 2.4;

  // Dropped gravity wells — click-to-place, independent of the live cursor.
  for (int i = 0; i < 4; i++) {
    vec3 dw = p - uWellPos[i];
    float wd2 = dot(dw, dw);
    p += normalize(dw + 0.0001) * exp(-wd2 / 9.0) * -2.0 * uWellStrength[i];
  }

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float size = uSize * (0.55 + aSeed * 0.9) * (1.0 + uExcite * 0.45 + impulse * 0.8);
  gl_PointSize = size * uPixelRatio * (9.0 / -mv.z);

  vColorT = snoise(position * 0.16) * 0.5 + aSeed * 0.25 + r * 0.06;
  vAlpha = smoothstep(5.4, 2.2, r) * 0.75 + 0.12;
}
`;

export const coreFragment = /* glsl */ `
uniform float uTime;
uniform float uExcite;
uniform float uHueShift;
uniform float uMono; // 1 = phosphor-green "matrix" mode
varying float vColorT;
varying float vAlpha;

${PALETTE}

void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d2 = dot(c, c);
  float alpha = exp(-d2 * 14.0) - 0.02;
  if(alpha <= 0.0) discard;
  vec3 col = aurora(vColorT + uTime * 0.016 + uHueShift);
  col = mix(col, vec3(0.30, 1.0, 0.45) * (length(col) * 0.7 + 0.25), uMono);
  col *= 0.85 + uExcite * 0.7;
  gl_FragColor = vec4(col, alpha * vAlpha * 0.62);
}
`;

export const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aSeed;
varying float vSeed;
void main(){
  vec3 p = position;
  p.y += sin(uTime * 0.05 + aSeed * 40.0) * 0.6;
  p.x += cos(uTime * 0.04 + aSeed * 71.0) * 0.6;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (0.6 + aSeed * 1.4) * uPixelRatio * (18.0 / -mv.z);
  vSeed = aSeed;
}
`;

export const dustFragment = /* glsl */ `
uniform float uTime;
varying float vSeed;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float alpha = exp(-dot(c, c) * 16.0);
  float twinkle = 0.55 + 0.45 * sin(uTime * (0.4 + vSeed) + vSeed * 90.0);
  gl_FragColor = vec4(vec3(0.62, 0.68, 0.85), alpha * 0.22 * twinkle);
}
`;

export const linkVertex = /* glsl */ `
attribute float aT;
varying float vT;
void main(){
  vT = aT;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const linkFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uAccent;
uniform float uHover;
uniform float uSeed;
varying float vT;
void main(){
  // A signal travelling from the core out to the node, forever.
  float pulsePos = fract(uTime * 0.14 + uSeed);
  float d = abs(vT - pulsePos);
  float pulse = exp(-d * 42.0) * (0.9 + uHover * 1.4);
  float base = 0.05 + uHover * 0.10;
  float fadeEnds = smoothstep(0.0, 0.08, vT) * smoothstep(1.0, 0.92, vT);
  gl_FragColor = vec4(uAccent, (base + pulse) * fadeEnds);
}
`;

export const glowVertex = /* glsl */ `
uniform float uScale;
varying vec2 vUv;
void main(){
  vUv = uv;
  // Billboard: offset the quad corners in view space.
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xy += (uv - 0.5) * 2.0 * uScale;
  gl_Position = projectionMatrix * mv;
}
`;

export const glowFragment = /* glsl */ `
uniform vec3 uAccent;
uniform float uTime;
uniform float uHover;
uniform float uSeed;
varying vec2 vUv;
void main(){
  vec2 c = vUv - 0.5;
  float d = length(c) * 2.0;
  float pulse = 0.92 + 0.08 * sin(uTime * 1.6 + uSeed * 20.0);
  float core = exp(-d * d * 26.0) * 1.25;
  float halo = exp(-d * d * 4.5) * (0.18 + uHover * 0.38);
  float ring = exp(-pow(abs(d - 0.62 * pulse), 2.0) * 260.0) * (0.22 + uHover * 0.55);
  float a = (core + halo + ring);
  vec3 col = mix(uAccent, vec3(1.0), core * 0.45);
  gl_FragColor = vec4(col, a);
}
`;
