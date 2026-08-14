"use client";

import { useEffect, useRef } from "react";
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  CanvasTexture,
  Vector2,
  Vector4,
  LinearFilter,
} from "three";

// Fixed "look" for the landing page hero: lowest density, lowest speed,
// half turbulence, text scaled to fill the width of the section.
const DENSITY = 2; // slider min
const SPEED = 0; // slider min (0-100 -> 0)
const TURB = 0.5; // half of slider (0-100 -> 0.5)
const FONT_SCALE_SLIDER = 100; // fills the section edge-to-edge
const TEXT = "PEEK";

const RENDERER = { MAX_PIXEL_RATIO: 2 };

const MASK = {
  PROBE_FONT_SIZE: 300,
  PROBE_CANVAS_W: 2000,
  PROBE_CANVAS_H: 800,
  INK_BRIGHTNESS_THRESHOLD: 64,
  MAX_HEIGHT_FRACTION: 0.98,
};

const FONT_SCALE = { FULL_WIDTH: 100 };

const RIPPLE = {
  SLOT_COUNT: 4,
  DECAY_RATE: 1.1,
  RING_FREQUENCY: 7.0,
  RING_SPEED_MUL: 9.0,
  DIST_FALLOFF: 2.2,
  AMPLITUDE: 1.8,
};

const MOUSE_SWELL = {
  DIST_FALLOFF: 2.5,
  FREQUENCY: 9.0,
  SPEED_MUL: 5.0,
  AMPLITUDE: 1.2,
};

const CONTOUR = {
  LINE_WIDTH: 0.22,
  AA_BASE: 0.015,
  AA_DENSITY_SCALE: 0.005,
  WAVE_SCALE: 0.5,
};

const MASK_BLEND = { EDGE_LO: 0.38, EDGE_HI: 0.62 };

const PALETTE = {
  BG: [0.0, 0.0, 0.0],
  FILL: [0.078, 0.722, 0.651], // teal-500
};

const BASE_WAVES = [
  { amp: 1.0, fx: 2.4, fy: 0.9, ts: 1.15, phase: 0 },
  { amp: 0.82, fx: -1.3, fy: 2.6, ts: -0.87, phase: Math.PI / 2 },
  { amp: 0.65, fx: 1.7, fy: -2.0, ts: 1.41, phase: Math.PI },
  { amp: 0.7, fx: -2.8, fy: -1.2, ts: -0.66, phase: 0.8 },
  { amp: 0.5, fx: 0.9, fy: 3.1, ts: 1.05, phase: 2.3 },
  { amp: 0.38, fx: 3.2, fy: 0.7, ts: -1.23, phase: 4.7 },
  { amp: 0.3, fx: -1.0, fy: -2.4, ts: 1.56, phase: 5.5 },
  { amp: 0.28, fx: 2.1, fy: 1.7, ts: 0.54, phase: 1.1 },
];

const TURB_WAVES = [
  { amp: 0.35, fx: 5.6, fy: 4.4, ts: 1.1, hFold: 0.8 },
  { amp: 0.18, fx: 8.3, fy: -7.0, ts: -0.9, hFold: 1.3 },
  { amp: 0.1, fx: 12.0, fy: 9.5, ts: 1.6, hFold: 1.8 },
];

const glslFloat = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
const f4 = (n: number) => n.toFixed(4);

function baseWaveGLSL(w: (typeof BASE_WAVES)[number]) {
  const phase = w.phase !== 0 ? ` + ${f4(w.phase)}` : "";
  return `        h += ${f4(w.amp)} * sin(${f4(w.fx)}*p.x + ${f4(w.fy)}*p.y + t*${f4(w.ts)}${phase});`;
}

function turbWaveGLSL(w: (typeof TURB_WAVES)[number]) {
  return `          h += uTurb * ${f4(w.amp)} * sin(${f4(w.fx)}*p.x + ${f4(w.fy)}*p.y + t*${f4(w.ts)} + h*${f4(w.hFold)});`;
}

export function WaterHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup = () => {};

    document.fonts.ready.then(() => {
      if (disposed || !container) return;

      const fontFamily =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--font-display")
          .trim() || `"Arial Black", sans-serif`;

      const renderer = new WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, RENDERER.MAX_PIXEL_RATIO));
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      renderer.domElement.style.display = "block";
      container.prepend(renderer.domElement);

      const scene = new Scene();
      const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const maskCanvas = document.createElement("canvas");
      const maskCtx = maskCanvas.getContext("2d")!;
      let maskTex: CanvasTexture | null = null;

      function buildMask() {
        const W = container!.clientWidth;
        const H = container!.clientHeight;
        if (W === 0 || H === 0) return;
        maskCanvas.width = W;
        maskCanvas.height = H;

        maskCtx.fillStyle = "#000";
        maskCtx.fillRect(0, 0, W, H);

        const str = TEXT;

        const probeCanvas = document.createElement("canvas");
        probeCanvas.width = MASK.PROBE_CANVAS_W;
        probeCanvas.height = MASK.PROBE_CANVAS_H;
        const pc = probeCanvas.getContext("2d")!;
        pc.fillStyle = "#000";
        pc.fillRect(0, 0, MASK.PROBE_CANVAS_W, MASK.PROBE_CANVAS_H);
        pc.fillStyle = "#fff";
        pc.font = `900 ${MASK.PROBE_FONT_SIZE}px ${fontFamily}`;
        pc.textAlign = "center";
        pc.textBaseline = "middle";
        pc.fillText(str, MASK.PROBE_CANVAS_W / 2, MASK.PROBE_CANVAS_H / 2);

        const pd = pc.getImageData(0, 0, MASK.PROBE_CANVAS_W, MASK.PROBE_CANVAS_H).data;
        let minX = MASK.PROBE_CANVAS_W;
        let maxX = 0;
        let minY = MASK.PROBE_CANVAS_H;
        let maxY = 0;

        for (let y = 0; y < MASK.PROBE_CANVAS_H; y++) {
          for (let x = 0; x < MASK.PROBE_CANVAS_W; x++) {
            if (pd[(y * MASK.PROBE_CANVAS_W + x) * 4] > MASK.INK_BRIGHTNESS_THRESHOLD) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        const inkW = Math.max(1, maxX - minX);

        const fullWidthFontSize = MASK.PROBE_FONT_SIZE * (W / inkW);
        const userScaleFraction = FONT_SCALE_SLIDER / FONT_SCALE.FULL_WIDTH;
        const finalFontSize = Math.min(
          fullWidthFontSize * userScaleFraction,
          H * MASK.MAX_HEIGHT_FRACTION,
        );

        maskCtx.fillStyle = "#fff";
        maskCtx.font = `900 ${finalFontSize}px ${fontFamily}`;
        maskCtx.textAlign = "center";
        maskCtx.textBaseline = "middle";

        const probeInkCentreY = (minY + maxY) / 2;
        const probeCanvasCentreY = MASK.PROBE_CANVAS_H / 2;
        const inkCentreOffset =
          (probeInkCentreY - probeCanvasCentreY) * (finalFontSize / MASK.PROBE_FONT_SIZE);
        maskCtx.fillText(str, W / 2, H / 2 - inkCentreOffset);

        if (maskTex) {
          maskTex.image = maskCanvas;
          maskTex.needsUpdate = true;
        } else {
          maskTex = new CanvasTexture(maskCanvas);
          maskTex.minFilter = LinearFilter;
          maskTex.magFilter = LinearFilter;
        }
      }

      buildMask();

      const uniforms = {
        uTime: { value: 0.0 },
        uRes: {
          value: new Vector2(
            container!.clientWidth * renderer.getPixelRatio(),
            container!.clientHeight * renderer.getPixelRatio(),
          ),
        },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uDensity: { value: DENSITY },
        uSpeed: { value: SPEED },
        uTurb: { value: TURB },
        uMask: { value: maskTex as CanvasTexture | null },
        uR0: { value: new Vector4(0, 0, -1, 0) },
        uR1: { value: new Vector4(0, 0, -1, 0) },
        uR2: { value: new Vector4(0, 0, -1, 0) },
        uR3: { value: new Vector4(0, 0, -1, 0) },
      };

      const fragmentShader = /* glsl */ `
        precision highp float;

        uniform float     uTime;
        uniform vec2      uRes;
        uniform vec2      uMouse;
        uniform float     uDensity;
        uniform float     uSpeed;
        uniform float     uTurb;
        uniform sampler2D uMask;
        uniform vec4      uR0, uR1, uR2, uR3;

        const vec3 COLOR_BG   = vec3(${PALETTE.BG.map((v) => v.toFixed(3)).join(", ")});
        const vec3 COLOR_FILL = vec3(${PALETTE.FILL.map((v) => v.toFixed(3)).join(", ")});

        const float MASK_EDGE_LO = ${glslFloat(MASK_BLEND.EDGE_LO)};
        const float MASK_EDGE_HI = ${glslFloat(MASK_BLEND.EDGE_HI)};

        const float RIPPLE_DECAY_RATE   = ${glslFloat(RIPPLE.DECAY_RATE)};
        const float RIPPLE_RING_FREQ    = ${glslFloat(RIPPLE.RING_FREQUENCY)};
        const float RIPPLE_RING_SPEED   = ${glslFloat(RIPPLE.RING_SPEED_MUL)};
        const float RIPPLE_DIST_FALLOFF = ${glslFloat(RIPPLE.DIST_FALLOFF)};
        const float RIPPLE_AMPLITUDE    = ${glslFloat(RIPPLE.AMPLITUDE)};

        const float SWELL_DIST_FALLOFF = ${glslFloat(MOUSE_SWELL.DIST_FALLOFF)};
        const float SWELL_FREQUENCY    = ${glslFloat(MOUSE_SWELL.FREQUENCY)};
        const float SWELL_SPEED_MUL    = ${glslFloat(MOUSE_SWELL.SPEED_MUL)};
        const float SWELL_AMPLITUDE    = ${glslFloat(MOUSE_SWELL.AMPLITUDE)};

        const float CONTOUR_LINE_WIDTH   = ${glslFloat(CONTOUR.LINE_WIDTH)};
        const float CONTOUR_AA_BASE      = ${glslFloat(CONTOUR.AA_BASE)};
        const float CONTOUR_AA_DENSITY   = ${glslFloat(CONTOUR.AA_DENSITY_SCALE)};
        const float CONTOUR_WAVE_SCALE   = ${glslFloat(CONTOUR.WAVE_SCALE)};

        float tri(float x) {
          return abs(fract(x + 0.5) - 0.5) * 2.0;
        }

        float ripple(vec4 r, vec2 uv, float t) {
          if (r.z < 0.0) return 0.0;
          float age       = t - r.z;
          float decay     = exp(-age * RIPPLE_DECAY_RATE);
          float ar        = uRes.x / uRes.y;
          vec2  delta     = (uv - r.xy) * vec2(ar, 1.0);
          float dist      = length(delta);
          float ringPhase = dist * RIPPLE_RING_FREQ - age * uSpeed * RIPPLE_RING_SPEED;
          return decay * sin(ringPhase) * exp(-dist * RIPPLE_DIST_FALLOFF) * RIPPLE_AMPLITUDE;
        }

        void main() {
          vec2  uv = gl_FragCoord.xy / uRes;
          float ar = uRes.x / uRes.y;
          vec2  p  = vec2(uv.x * ar, uv.y);
          float t  = uTime * uSpeed;

          float insideMask = texture2D(uMask, uv).r;
          float mask       = smoothstep(MASK_EDGE_LO, MASK_EDGE_HI, insideMask);

          if (mask < 0.001) {
            gl_FragColor = vec4(COLOR_BG, 1.0);
            return;
          }

          float h = 0.0;
${BASE_WAVES.map(baseWaveGLSL).join("\n")}

          if (uTurb > 0.0) {
${TURB_WAVES.map(turbWaveGLSL).join("\n")}
          }

          vec2  swellDelta = (uv - uMouse) * vec2(ar, 1.0);
          float swellDist  = length(swellDelta);
          h += SWELL_AMPLITUDE
             * exp(-swellDist * SWELL_DIST_FALLOFF)
             * sin(swellDist * SWELL_FREQUENCY - t * SWELL_SPEED_MUL);

          h += ripple(uR0, uv, uTime);
          h += ripple(uR1, uv, uTime);
          h += ripple(uR2, uv, uTime);
          h += ripple(uR3, uv, uTime);

          float bands     = tri(h * uDensity * CONTOUR_WAVE_SCALE);
          float aaRadius  = CONTOUR_AA_BASE + CONTOUR_AA_DENSITY * uDensity;
          float isOnLine  = 1.0 - smoothstep(CONTOUR_LINE_WIDTH - aaRadius,
                                             CONTOUR_LINE_WIDTH + aaRadius, bands);
          vec3  fluidColor = mix(COLOR_FILL, COLOR_BG, isOnLine);

          gl_FragColor = vec4(mix(COLOR_BG, fluidColor, mask), 1.0);
        }
      `;

      const material = new ShaderMaterial({
        uniforms,
        vertexShader: `void main(){ gl_Position = vec4(position, 1.0); }`,
        fragmentShader,
      });
      scene.add(new Mesh(new PlaneGeometry(2, 2), material));

      function resize() {
        const W = container!.clientWidth;
        const H = container!.clientHeight;
        renderer.setSize(W, H);
        const pr = renderer.getPixelRatio();
        uniforms.uRes.value.set(W * pr, H * pr);
        buildMask();
        uniforms.uMask.value = maskTex;
      }

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container!);

      function handlePointerMove(e: PointerEvent) {
        const rect = container!.getBoundingClientRect();
        uniforms.uMouse.value.set(
          (e.clientX - rect.left) / rect.width,
          1 - (e.clientY - rect.top) / rect.height,
        );
      }

      const rippleSlots = [uniforms.uR0, uniforms.uR1, uniforms.uR2, uniforms.uR3];
      let rippleIndex = 0;

      function handleClick(e: MouseEvent) {
        const rect = container!.getBoundingClientRect();
        rippleSlots[rippleIndex % RIPPLE.SLOT_COUNT].value.set(
          (e.clientX - rect.left) / rect.width,
          1 - (e.clientY - rect.top) / rect.height,
          uniforms.uTime.value,
          1,
        );
        rippleIndex++;
      }

      container!.addEventListener("pointermove", handlePointerMove);
      container!.addEventListener("click", handleClick);

      let lastTimestamp: number | null = null;
      let elapsed = 0;
      let rafId = 0;

      function loop(timestamp: number) {
        rafId = requestAnimationFrame(loop);
        const dt = lastTimestamp === null ? 0 : Math.min((timestamp - lastTimestamp) / 1000, 0.05);
        lastTimestamp = timestamp;
        elapsed += dt;
        uniforms.uTime.value = elapsed;
        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        container!.removeEventListener("pointermove", handlePointerMove);
        container!.removeEventListener("click", handleClick);
        renderer.dispose();
        material.dispose();
        maskTex?.dispose();
        if (renderer.domElement.parentNode === container) {
          container!.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-pointer overflow-hidden"
      aria-hidden="true"
    />
  );
}
