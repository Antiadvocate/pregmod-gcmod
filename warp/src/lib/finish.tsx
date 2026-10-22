/**
 * THE FINISH — light, skin and the marks that make her hers, over the base game's flat vector art.
 *
 * The pack is cel art: flat fills, cut against each other, with the definition drawn as near-black
 * `.shadow` shapes. On a phone that reads as a cartoon. Everything here is drawn on top of it, from
 * the same state, without touching a single layer file:
 *
 *   · FORM. Her silhouette, blurred, is treated as a height map and lit from the upper left
 *     (feDiffuseLighting), so every edge rolls into light or shadow the way a rounded body does;
 *     a little specular sheen on top, and a fine grain so skin isn't plastic. Normalised so a flat
 *     area keeps its own colour: the light only adds shape.
 *   · LINE. The ink lines become a warm, half-transparent dark, slightly soft, so they read as the
 *     shadow in a crease rather than an outline.
 *   · EYES AND LIPS. Irises with a pupil, colour depth and a dark limbal ring, a catchlight that
 *     moves with her gaze; lips with shading and a little gloss.
 *   · HER MARKS (engine/features). Freckles, a beauty mark, a birthmark, vitiligo, stretch marks,
 *     dimples, lashes, two eye colours, each placed from her own seed so they're always in the same
 *     place on her. They're drawn at the depth they belong, under her clothes.
 *   · FEET. Toes, nails, the shadow under the arch.
 *
 * Coordinates are the pack's own (viewBox 0 0 560 1000), measured off the layers: face y 75–184,
 * eyes y 127–139, shoulders y ~205, breasts y 222–295, hips from y 385, feet y 830–939.
 */
import type { ReactElement } from "react";
import type { Person } from "../engine/types";
import { featuresOf, hasFeature, type Feature } from "../engine/features";
import { match, paletteFor, shade, SKIN } from "./vectorart";
import { rng } from "../engine/rng";

/** The figure-wide filter and the gradients, once per drawing. */
export function FinishDefs({ p, scope, grain }: { p: Person; scope: string; grain: boolean }) {
  const pal = paletteFor(p);
  const eye = pal.eye;
  const second = hasFeature(p, "heterochromia")?.detail;
  // The pack's default lip is her skin a shade darker, which comes out grey-beige; real lips have
  // rose in them. Lipstick she's wearing is left as it is.
  const lip = p.look?.lips ? pal.lip : mix(pal.lip, "#c25e6a", 0.5);
  return (
    <defs>
      {/* Form: the silhouette as a surface, lit from the upper left. 1/sin(elevation) keeps flat
          areas at their own colour; only the edges move. */}
      <filter id={`${scope}-form`} x="-8%" y="-4%" width="116%" height="108%" colorInterpolationFilters="sRGB">
        {/* Broad form: the body as a rounded mass. Then a narrow rim so edges turn away. */}
        <feGaussianBlur in="SourceAlpha" stdDeviation="13" result="h" />
        <feDiffuseLighting in="h" surfaceScale="7" diffuseConstant="1" lightingColor="#fff4ea" result="d">
          <feDistantLight azimuth="215" elevation="52" />
        </feDiffuseLighting>
        <feGaussianBlur in="d" stdDeviation="2.2" result="d" />
        <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="h2" />
        <feDiffuseLighting in="h2" surfaceScale="2" diffuseConstant="1" lightingColor="#fff" result="d2">
          <feDistantLight azimuth="215" elevation="64" />
        </feDiffuseLighting>
        <feGaussianBlur in="d2" stdDeviation="0.9" result="d2" />
        <feComposite in="d" in2="d2" operator="arithmetic" k1="1.12" k2="0" k3="0" k4="0" result="dd" />
        <feComposite in="SourceGraphic" in2="dd" operator="arithmetic" k1="1.42" k2="0" k3="0" k4="0" result="lit" />
        <feSpecularLighting in="h" surfaceScale="7" specularConstant="0.16" specularExponent="34" lightingColor="#fff8f0" result="s">
          <feDistantLight azimuth="215" elevation="48" />
        </feSpecularLighting>
        <feGaussianBlur in="s" stdDeviation="2" result="s" />
        <feComposite in="s" in2="SourceAlpha" operator="in" result="s2" />
        <feComposite in="lit" in2="s2" operator="arithmetic" k1="0" k2="1" k3="0.5" k4="0" result="shiny" />
        {grain ? (
          <>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.33 0.33 0.33 0 -0.5" result="na" />
            <feComposite in="na" in2="SourceAlpha" operator="in" result="nb" />
            <feComposite in="shiny" in2="nb" operator="arithmetic" k1="0" k2="1" k3="-0.10" k4="0" result="grained" />
            <feComposite in="grained" in2="SourceAlpha" operator="in" />
          </>
        ) : <feComposite in="shiny" in2="SourceAlpha" operator="in" />}
      </filter>
      <filter id={`${scope}-line`} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.45" /></filter>
      <filter id={`${scope}-blur2`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" /></filter>
      <filter id={`${scope}-blur05`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.5" /></filter>
      <radialGradient id={`${scope}-iris`} cx="0.5" cy="0.5" r="0.5" fx="0.45" fy="0.42">
        <stop offset="0" stopColor="#060404" />
        <stop offset="0.3" stopColor="#0c0806" />
        <stop offset="0.38" stopColor={shade(eye, 0.75)} />
        <stop offset="0.62" stopColor={eye} />
        <stop offset="0.86" stopColor={shade(eye, 0.62)} />
        <stop offset="1" stopColor={shade(eye, 0.28)} />
      </radialGradient>
      {second ? (
        <radialGradient id={`${scope}-iris2`} cx="0.5" cy="0.5" r="0.5" fx="0.45" fy="0.42">
          <stop offset="0" stopColor="#060404" />
          <stop offset="0.3" stopColor="#0c0806" />
          <stop offset="0.38" stopColor={shade(match(EYE2, second, eye), 0.75)} />
          <stop offset="0.62" stopColor={match(EYE2, second, eye)} />
          <stop offset="0.86" stopColor={shade(match(EYE2, second, eye), 0.62)} />
          <stop offset="1" stopColor={shade(match(EYE2, second, eye), 0.28)} />
        </radialGradient>
      ) : null}
      <linearGradient id={`${scope}-lip`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={shade(lip, 0.8)} />
        <stop offset="0.45" stopColor={shade(lip, 0.9)} />
        <stop offset="0.5" stopColor={shade(lip, 0.62)} />
        <stop offset="0.62" stopColor={lip} />
        <stop offset="0.74" stopColor={lighten(lip, 0.28)} />
        <stop offset="1" stopColor={shade(lip, 0.86)} />
      </linearGradient>
    </defs>
  );
}

const EYE2: [RegExp, string][] = [[/blue/i, "#5b8fbe"], [/green/i, "#5f8c5a"], [/hazel/i, "#8a6b3b"], [/grey|gray/i, "#8d9395"], [/amber/i, "#c99a2e"], [/brown/i, "#6b4423"]];

function mix(a: string, b: string, k: number): string {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - k) + ((B >> s) & 255) * k);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
}

function lighten(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(c + (255 - c) * k);
  return `#${((f((n >> 16) & 255) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, "0")}`;
}

/** Stylesheet additions: soft lines, iris and lip gradients. */
export function finishCss(scope: string): string {
  return [
    `.${scope} .shadow{fill:#24140e;fill-opacity:.8;filter:url(#${scope}-line);}`,
    `.${scope} .eye{fill:url(#${scope}-iris);}`,
    `.${scope} .eye.iris2{fill:url(#${scope}-iris2);}`,
    `.${scope} .lip{fill:url(#${scope}-lip);}`,
    `.${scope} .sclera{fill:#f2ede7;}`,
  ].join("");
}

/**
 * After the layers are in: a catchlight on each iris, and the second eye colour on her left eye
 * (the one on the viewer's right). Run whenever the drawing is rebuilt. The catchlight takes its
 * iris's transform so it follows her gaze (SlaveArt's face loop moves `[data-catch]` with them).
 */
export function finishEyes(root: SVGSVGElement, p: Person): void {
  root.querySelectorAll("[data-catch]").forEach((n) => n.remove());
  const irises = Array.from(root.querySelectorAll<SVGGraphicsElement>(".eye"));
  if (!irises.length) return;
  const boxes = irises.map((el) => { try { return el.getBBox(); } catch { return null; } });
  const xs = boxes.map((b) => (b ? b.x + b.width / 2 : 0));
  const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
  const two = !!hasFeature(p, "heterochromia");
  irises.forEach((el, i) => {
    const b = boxes[i];
    if (!b || b.width < 1) return;
    el.classList.toggle("iris2", two && xs[i] > mid);
    const c = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    c.setAttribute("data-catch", "");
    c.setAttribute("cx", String(b.x + b.width * 0.36));
    c.setAttribute("cy", String(b.y + b.height * 0.32));
    c.setAttribute("rx", String(Math.max(0.35, b.width * 0.13)));
    c.setAttribute("ry", String(Math.max(0.35, b.height * 0.11)));
    c.setAttribute("fill", "#ffffff");
    c.setAttribute("opacity", "0.85");
    c.setAttribute("pointer-events", "none");
    const t = el.getAttribute("transform");
    if (t) c.setAttribute("transform", t);
    el.after(c);
  });
}

/* ── her marks ─────────────────────────────────────────────────────────────────────────────── */

const spots = (f: Feature, n: number, cx: number, cy: number, rx: number, ry: number, avoid?: (x: number, y: number) => boolean) => {
  const r = rng(f.seed);
  const out: { x: number; y: number; s: number; o: number }[] = [];
  for (let i = 0; out.length < n && i < n * 4; i++) {
    // Denser in the middle, the way freckles sit across a nose.
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (0.35 + r() * 0.65);
    const x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
    if (avoid?.(x, y)) continue;
    out.push({ x, y, s: 0.25 + r() * 0.45, o: 0.35 + r() * 0.45 });
  }
  return out;
};

function skinHex(p: Person): string { return match(SKIN, p.body.skin, "#d9b48f"); }

const FACE_MARK: Record<string, [number, number]> = { "left cheek": [309, 154], "right cheek": [268, 153], "upper lip": [296, 159.5], chin: [289, 176], "left temple": [321, 123] };
const CHEST_MARK: Record<string, [number, number]> = { collarbone: [306, 206], "right shoulder": [249, 213], neck: [305, 191] };
const LEG_MARK: Record<string, [number, number]> = { "left hip": [349, 438], "inner thigh": [283, 525], "left thigh": [336, 560] };

/** The face: freckles, a beauty mark, dimples, lashes, vitiligo round the eyes and mouth. */
export function FaceDetail({ p, scope }: { p: Person; scope: string }) {
  const fs = featuresOf(p);
  if (!fs.length) return null;
  const skin = skinHex(p);
  const fleck = shade(skin, 0.68);
  const out: ReactElement[] = [];
  for (const f of fs) {
    if (f.id === "freckles" || f.id === "heavy_freckles") {
      const heavy = f.id === "heavy_freckles";
      const notEyes = (x: number, y: number) => y < 141 || (y > 158 && x > 272 && x < 298);
      for (const [i, d] of spots(f, heavy ? 70 : 34, 289, 148, heavy ? 30 : 23, heavy ? 13 : 8, notEyes).entries())
        out.push(<circle key={`fr${i}`} cx={d.x} cy={d.y} r={d.s * (heavy ? 1.05 : 0.9)} fill={fleck} opacity={d.o * (heavy ? 0.85 : 0.65)} />);
    }
    if (f.id === "beauty_mark" && f.where && FACE_MARK[f.where]) {
      const [x, y] = FACE_MARK[f.where];
      out.push(<circle key="bm" cx={x} cy={y} r={0.85} fill="#2a1710" opacity={0.85} />);
    }
    if (f.id === "dimples") {
      out.push(<path key="dm1" d="M271.5 163.5 q-1.4 2.6 0.2 4.6" stroke={shade(skin, 0.6)} strokeWidth={0.6} fill="none" opacity={0.45} strokeLinecap="round" />);
      out.push(<path key="dm2" d="M299.8 162.8 q1.4 2.6 -0.2 4.6" stroke={shade(skin, 0.6)} strokeWidth={0.6} fill="none" opacity={0.45} strokeLinecap="round" />);
    }
    if (f.id === "long_lashes") {
      out.push(<g key="lash" stroke="#120a08" strokeWidth={0.55} strokeLinecap="round" fill="none" opacity={0.9}>
        <path d="M264.5 129.5 q-2.6 -1.4 -4.2 -0.4" /><path d="M265.5 128 q-2.2 -2.4 -3.8 -2.2" /><path d="M267.5 127 q-1.4 -2.8 -2.8 -3.2" />
        <path d="M313.5 128.5 q2.6 -1.4 4.2 -0.4" /><path d="M312.5 127 q2.2 -2.4 3.8 -2.2" /><path d="M310.5 126 q1.4 -2.8 2.8 -3.2" />
      </g>);
    }
    if (f.id === "vitiligo" && f.where === "face and neck") out.push(<Patches key="vit" f={f} at={[[302, 134, 7, 5], [276, 169, 6, 4], [297, 191, 9, 6]]} scope={scope} />);
    if (f.id === "birthmark" && f.where === "neck") out.push(<Birthmark key="bmk" f={f} x={CHEST_MARK.neck[0]} y={CHEST_MARK.neck[1]} scope={scope} />);
  }
  return <g pointerEvents="none">{out}</g>;
}

/** Shoulders, chest above the breasts, belly. Drawn over the torso and under anything she wears. */
export function TorsoDetail({ p, scope }: { p: Person; scope: string }) {
  const fs = featuresOf(p);
  const skin = skinHex(p);
  const out: ReactElement[] = [];
  // Collarbones and the hollow of the throat, more visible the leaner she is.
  const lean = Math.max(0, Math.min(1, (10 - p.body.weight) / 50));
  if (lean > 0.05) out.push(
    <g key="clav" stroke={shade(skin, 0.55)} strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.18 + lean * 0.3} filter={`url(#${scope}-blur05)`}>
      <path d="M270 203 q12 3 22 1" /><path d="M300 203 q14 -2 28 6" /><path d="M292 198 q2 4 6 1" />
    </g>,
  );
  for (const f of fs) {
    if (f.id === "heavy_freckles") for (const [i, d] of spots(f, 90, 293, 214, 62, 16).entries())
      out.push(<circle key={`tf${i}`} cx={d.x} cy={d.y} r={d.s} fill={shade(skin, 0.7)} opacity={d.o * 0.7} />);
    if (f.id === "beauty_mark" && f.where && CHEST_MARK[f.where]) out.push(<circle key="bm" cx={CHEST_MARK[f.where][0]} cy={CHEST_MARK[f.where][1]} r={0.9} fill="#2a1710" opacity={0.85} />);
    if (f.id === "birthmark" && f.where && f.where !== "neck" && CHEST_MARK[f.where]) out.push(<Birthmark key="bmk" f={f} x={CHEST_MARK[f.where][0]} y={CHEST_MARK[f.where][1]} scope={scope} />);
    if (f.id === "vitiligo" && f.where === "belly and hips") out.push(<Patches key="vit" f={f} at={[[300, 352, 11, 8], [268, 372, 7, 5]]} scope={scope} />);
  }
  return out.length ? <g pointerEvents="none">{out}</g> : null;
}

/** On the breasts, in the breasts' own transform. */
export function BreastDetail({ p, scope }: { p: Person; scope: string }) {
  const out: ReactElement[] = [];
  const skin = skinHex(p);
  for (const f of featuresOf(p)) {
    if (f.id === "beauty_mark" && f.where === "left breast") out.push(<circle key="bm" cx={322} cy={244} r={0.9} fill="#2a1710" opacity={0.85} />);
    if (f.id === "stretch_marks" && f.where === "breasts") out.push(<Stretch key="sm" f={f} at={[[262, 262], [326, 262]]} skin={skin} scope={scope} />);
    if (f.id === "heavy_freckles") for (const [i, d] of spots(f, 30, 292, 240, 45, 10).entries())
      out.push(<circle key={`bf${i}`} cx={d.x} cy={d.y} r={d.s * 0.9} fill={shade(skin, 0.72)} opacity={d.o * 0.6} />);
  }
  return out.length ? <g pointerEvents="none">{out}</g> : null;
}

/** Hips, thighs, knees, and her feet when they're bare. */
export function LegDetail({ p, scope }: { p: Person; scope: string }) {
  const out: ReactElement[] = [];
  const skin = skinHex(p);
  // Knees: a soft crease and a little shadow under the cap, so the legs aren't two tubes.
  out.push(
    <g key="knee" fill="none" stroke={shade(skin, 0.6)} strokeWidth={0.8} strokeLinecap="round" opacity={0.28} filter={`url(#${scope}-blur05)`}>
      <path d="M248 700 q8 5 18 0" /><path d="M318 702 q9 5 19 -1" />
    </g>,
  );
  for (const f of featuresOf(p)) {
    if (f.id === "beauty_mark" && f.where && LEG_MARK[f.where]) out.push(<circle key="bm" cx={LEG_MARK[f.where][0]} cy={LEG_MARK[f.where][1]} r={0.9} fill="#2a1710" opacity={0.85} />);
    if (f.id === "birthmark" && f.where && LEG_MARK[f.where]) out.push(<Birthmark key="bmk" f={f} x={LEG_MARK[f.where][0]} y={LEG_MARK[f.where][1]} scope={scope} />);
    if (f.id === "stretch_marks" && f.where === "hips and thighs") out.push(<Stretch key="sm" f={f} at={[[236, 455], [356, 455], [250, 500]]} skin={skin} scope={scope} />);
    if (f.id === "vitiligo" && f.where === "knees and shins") out.push(<Patches key="vit" f={f} at={[[256, 702, 8, 6], [330, 706, 7, 6], [262, 765, 5, 7]]} scope={scope} />);
    if (f.id === "vitiligo" && f.where === "belly and hips") out.push(<Patches key="vit2" f={f} at={[[346, 425, 7, 9]]} scope={scope} />);
  }
  return <g pointerEvents="none">{out}</g>;
}

function Birthmark({ f, x, y, scope }: { f: Feature; x: number; y: number; scope: string }) {
  const r = rng(f.seed);
  const port = f.detail === "port-wine";
  return (
    <g filter={`url(#${scope}-blur05)`} fill={port ? "#8e2f3f" : "#8a6040"} opacity={port ? 0.4 : 0.3}>
      {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={x + (r() - 0.5) * 9} cy={y + (r() - 0.5) * 6} rx={2 + r() * 3.5} ry={1.5 + r() * 2.5} transform={`rotate(${r() * 180} ${x} ${y})`} />)}
    </g>
  );
}

function Patches({ f, at, scope }: { f: Feature; at: [number, number, number, number][]; scope: string }) {
  const r = rng(f.seed + 1);
  return (
    <g fill="#f7ece4" opacity={0.92} filter={`url(#${scope}-blur05)`}>
      {at.flatMap(([x, y, w, h], i) => Array.from({ length: 3 }, (_, j) => (
        <ellipse key={`${i}-${j}`} cx={x + (r() - 0.5) * w} cy={y + (r() - 0.5) * h} rx={w * (0.35 + r() * 0.4)} ry={h * (0.35 + r() * 0.4)} transform={`rotate(${r() * 180} ${x} ${y})`} />
      )))}
    </g>
  );
}

function Stretch({ f, at, skin, scope }: { f: Feature; at: [number, number][]; skin: string; scope: string }) {
  const r = rng(f.seed + 2);
  return (
    <g stroke={lighten(skin, 0.35)} strokeWidth={0.7} strokeLinecap="round" fill="none" opacity={0.45} filter={`url(#${scope}-blur05)`}>
      {at.flatMap(([x, y], i) => Array.from({ length: 4 }, (_, j) => {
        const dx = (r() - 0.5) * 8, dy = j * 3.2;
        return <path key={`${i}-${j}`} d={`M${x + dx} ${y + dy} q${4 + r() * 3} ${-1 - r() * 2} ${8 + r() * 4} ${r() * 2}`} />;
      }))}
    </g>
  );
}


