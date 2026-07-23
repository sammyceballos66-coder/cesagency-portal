"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Adapted from a CodePen ("Interactive Liquid Gradient using Three.js" by
 * Cameron Knight) the user found and asked to integrate. The shader math
 * (gradient blending, ripple distortion, grain) is kept verbatim; trimmed
 * out is everything that was specific to that demo page (color-scheme
 * switcher UI, color-adjuster panel, custom cursor, heading/footer) since
 * none of that is part of "the animation" itself.
 *
 * Runs its own requestAnimationFrame loop scoped to elapsed time only — no
 * scroll dependency, so it loops continuously on its own. Sized to its
 * container (not window), and mouse tracking is scoped to that same
 * container, so it doesn't do anything once the hero scrolls out of view.
 */

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vec3 pos = position.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    vUv = uv;
  }
`;

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  uniform vec3 uColor6;
  uniform float uSpeed;
  uniform float uIntensity;
  uniform sampler2D uTouchTexture;
  uniform float uGrainIntensity;
  uniform vec3 uDarkNavy;
  uniform float uGradientSize;
  uniform float uGradientCount;

  varying vec2 vUv;

  float grain(vec2 uv, float time) {
    vec2 grainUv = uv * uResolution * 0.5;
    float grainValue = fract(sin(dot(grainUv + time, vec2(12.9898, 78.233))) * 43758.5453);
    return grainValue * 2.0 - 1.0;
  }

  vec3 getGradientColor(vec2 uv, float time) {
    float gradientRadius = uGradientSize;

    vec2 center1 = vec2(0.5 + sin(time * uSpeed * 0.4) * 0.4, 0.5 + cos(time * uSpeed * 0.5) * 0.4);
    vec2 center2 = vec2(0.5 + cos(time * uSpeed * 0.6) * 0.5, 0.5 + sin(time * uSpeed * 0.45) * 0.5);
    vec2 center3 = vec2(0.5 + sin(time * uSpeed * 0.35) * 0.45, 0.5 + cos(time * uSpeed * 0.55) * 0.45);
    vec2 center4 = vec2(0.5 + cos(time * uSpeed * 0.5) * 0.4, 0.5 + sin(time * uSpeed * 0.4) * 0.4);
    vec2 center5 = vec2(0.5 + sin(time * uSpeed * 0.7) * 0.35, 0.5 + cos(time * uSpeed * 0.6) * 0.35);
    vec2 center6 = vec2(0.5 + cos(time * uSpeed * 0.45) * 0.5, 0.5 + sin(time * uSpeed * 0.65) * 0.5);

    float dist1 = length(uv - center1);
    float dist2 = length(uv - center2);
    float dist3 = length(uv - center3);
    float dist4 = length(uv - center4);
    float dist5 = length(uv - center5);
    float dist6 = length(uv - center6);

    float influence1 = 1.0 - smoothstep(0.0, gradientRadius, dist1);
    float influence2 = 1.0 - smoothstep(0.0, gradientRadius, dist2);
    float influence3 = 1.0 - smoothstep(0.0, gradientRadius, dist3);
    float influence4 = 1.0 - smoothstep(0.0, gradientRadius, dist4);
    float influence5 = 1.0 - smoothstep(0.0, gradientRadius, dist5);
    float influence6 = 1.0 - smoothstep(0.0, gradientRadius, dist6);

    vec2 rotatedUv1 = uv - 0.5;
    float angle1 = time * uSpeed * 0.15;
    rotatedUv1 = vec2(
      rotatedUv1.x * cos(angle1) - rotatedUv1.y * sin(angle1),
      rotatedUv1.x * sin(angle1) + rotatedUv1.y * cos(angle1)
    );
    rotatedUv1 += 0.5;

    vec2 rotatedUv2 = uv - 0.5;
    float angle2 = -time * uSpeed * 0.12;
    rotatedUv2 = vec2(
      rotatedUv2.x * cos(angle2) - rotatedUv2.y * sin(angle2),
      rotatedUv2.x * sin(angle2) + rotatedUv2.y * cos(angle2)
    );
    rotatedUv2 += 0.5;

    float radialInfluence1 = 1.0 - smoothstep(0.0, 0.8, length(rotatedUv1 - 0.5));
    float radialInfluence2 = 1.0 - smoothstep(0.0, 0.8, length(rotatedUv2 - 0.5));

    vec3 color = vec3(0.0);
    color += uColor1 * influence1 * (0.55 + 0.45 * sin(time * uSpeed));
    color += uColor2 * influence2 * (0.55 + 0.45 * cos(time * uSpeed * 1.2));
    color += uColor3 * influence3 * (0.55 + 0.45 * sin(time * uSpeed * 0.8));
    color += uColor4 * influence4 * (0.55 + 0.45 * cos(time * uSpeed * 1.3));
    color += uColor5 * influence5 * (0.55 + 0.45 * sin(time * uSpeed * 1.1));
    color += uColor6 * influence6 * (0.55 + 0.45 * cos(time * uSpeed * 0.9));

    color += mix(uColor1, uColor3, radialInfluence1) * 0.45;
    color += mix(uColor2, uColor4, radialInfluence2) * 0.4;

    color = clamp(color, vec3(0.0), vec3(1.0)) * uIntensity;

    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luminance), color, 1.2);
    color = pow(color, vec3(0.95));

    float brightness1 = length(color);
    float mixFactor1 = max(brightness1 * 1.2, 0.15);
    color = mix(uDarkNavy, color, mixFactor1);

    float brightness = length(color);
    if (brightness > 1.0) color = color * (1.0 / brightness);

    return color;
  }

  void main() {
    vec2 uv = vUv;

    vec4 touchTex = texture2D(uTouchTexture, uv);
    float vx = -(touchTex.r * 2.0 - 1.0);
    float vy = -(touchTex.g * 2.0 - 1.0);
    float intensity = touchTex.b;
    uv.x += vx * 0.6 * intensity;
    uv.y += vy * 0.6 * intensity;

    vec2 center = vec2(0.5);
    float dist = length(uv - center);
    float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.03 * intensity;
    float wave = sin(dist * 15.0 - uTime * 2.0) * 0.02 * intensity;
    uv += vec2(ripple + wave);

    vec3 color = getGradientColor(uv, uTime);

    float grainValue = grain(uv, uTime);
    color += grainValue * uGrainIntensity;

    float brightness2 = length(color);
    float mixFactor2 = max(brightness2 * 1.2, 0.15);
    color = mix(uDarkNavy, color, mixFactor2);

    color = clamp(color, vec3(0.0), vec3(1.0));
    float brightness = length(color);
    if (brightness > 1.0) color = color * (1.0 / brightness);

    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Small canvas texture that accumulates a fading trail of mouse-move points. */
class TouchTexture {
  size = 64;
  maxAge = 64;
  radius = 0.25 * this.size;
  speed = 1 / this.maxAge;
  trail: { x: number; y: number; age: number; force: number; vx: number; vy: number }[] = [];
  last: { x: number; y: number } | null = null;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.Texture;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.size, this.size);
    this.texture = new THREE.Texture(this.canvas);
  }

  update() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.size, this.size);
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i];
      const f = point.force * this.speed * (1 - point.age / this.maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1);
      } else {
        this.drawPoint(point);
      }
    }
    this.texture.needsUpdate = true;
  }

  addTouch(point: { x: number; y: number }) {
    let force = 0;
    let vx = 0;
    let vy = 0;
    if (this.last) {
      const dx = point.x - this.last.x;
      const dy = point.y - this.last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / d;
      vy = dy / d;
      force = Math.min(dd * 20000, 2.0);
    }
    this.last = { x: point.x, y: point.y };
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
  }

  drawPoint(point: { x: number; y: number; age: number; force: number; vx: number; vy: number }) {
    const pos = { x: point.x * this.size, y: (1 - point.y) * this.size };
    let intensity = 1;
    if (point.age < this.maxAge * 0.3) {
      intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2));
    } else {
      const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7);
      intensity = -t * (t - 2);
    }
    intensity *= point.force;

    const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`;
    const offset = this.size * 5;
    this.ctx.shadowOffsetX = offset;
    this.ctx.shadowOffsetY = offset;
    this.ctx.shadowBlur = this.radius;
    this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255,0,0,1)";
    this.ctx.arc(pos.x - offset, pos.y - offset, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

export function LiquidGradient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // React's Strict Mode mounts, cleans up, and re-mounts effects back to
    // back in dev. Disposing a WebGLRenderer and immediately creating a new
    // one in the same tick can race the browser's WebGL context teardown,
    // surfacing as "Canvas has an existing context of a different type".
    // Deferring the actual setup by a tick means the first (throwaway)
    // mount's cleanup runs before its setup ever executes, so only the real
    // mount creates a renderer.
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      cleanup = setup(container);
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      cleanup?.();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}

function setup(container: HTMLDivElement) {
  // Guard against a second concurrent setup() on the same container. Seen in
  // production (not just React Strict Mode dev double-invoke) — when it
  // happens, two THREE.WebGLRenderers each try to obtain a context, and the
  // second call throws "Canvas has an existing context of a different type",
  // leaving the background unrendered. If we're already active, bail out
  // with a no-op cleanup instead of racing a second renderer into existence.
  if (container.dataset.liquidGradientActive === "true") {
    return () => {};
  }
  container.dataset.liquidGradientActive = "true";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const touchTexture = new TouchTexture();

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      // CES Agencia palette: blue-bright, blue-deep, light blue — no
      // off-brand colors from the original demo (it used orange/navy).
      uColor1: { value: new THREE.Vector3(0.114, 0.31, 0.847) }, // #1D4FD8
      uColor2: { value: new THREE.Vector3(0.059, 0.118, 0.322) }, // #0F1E52
      uColor3: { value: new THREE.Vector3(0.561, 0.69, 1.0) }, // #8FB0FF
      uColor4: { value: new THREE.Vector3(0.114, 0.31, 0.847) },
      uColor5: { value: new THREE.Vector3(0.059, 0.118, 0.322) },
      uColor6: { value: new THREE.Vector3(0.561, 0.69, 1.0) },
      uSpeed: { value: 0.55 },
      uIntensity: { value: 1.2 },
      uTouchTexture: { value: touchTexture.texture },
      uGrainIntensity: { value: 0.04 },
      uDarkNavy: { value: new THREE.Vector3(0.059, 0.118, 0.322) }, // #0F1E52
      uGradientSize: { value: 0.55 },
      uGradientCount: { value: 6.0 },
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 50;
    const scene = new THREE.Scene();

    const getViewSize = () => {
      const fov = (camera.fov * Math.PI) / 180;
      const height = Math.abs(camera.position.z * Math.tan(fov / 2) * 2);
      return { width: height * camera.aspect, height };
    };

    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const view = getViewSize();
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(view.width, view.height, 1, 1);
      uniforms.uResolution.value.set(w, h);
    }
    resize();

    const clock = new THREE.Clock();
    let frameId = 0;
    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      uniforms.uTime.value += delta;
      touchTexture.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }

    if (!reducedMotion) {
      frameId = requestAnimationFrame(tick);
    } else {
      renderer.render(scene, camera);
    }

    // Watchdog: in production this loop has been observed to silently stall
    // after painting a single frame (uTime stops advancing, no console
    // error) — root cause not fully isolated, but likely some framework-level
    // re-render cancels the original requestAnimationFrame chain without the
    // component actually unmounting/cleaning up. Rather than leave the
    // background frozen forever, check once a second whether uTime actually
    // moved since the last check and, if not, kick the loop again.
    let lastWatchdogTime = uniforms.uTime.value;
    const watchdog = !reducedMotion
      ? setInterval(() => {
          if (uniforms.uTime.value === lastWatchdogTime) {
            frameId = requestAnimationFrame(tick);
          }
          lastWatchdogTime = uniforms.uTime.value;
        }, 1000)
      : 0;

    function onMouseMove(ev: MouseEvent) {
      const rect = container.getBoundingClientRect();
      touchTexture.addTouch({
        x: (ev.clientX - rect.left) / rect.width,
        y: 1 - (ev.clientY - rect.top) / rect.height,
      });
    }
    if (!reducedMotion) {
      container.addEventListener("mousemove", onMouseMove);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    // Belt-and-suspenders: on some browsers/embedders the ResizeObserver
    // callback doesn't fire for a fixed/absolute-positioned container whose
    // size only changes because the viewport itself changed (window resize,
    // mobile orientation change, URL-bar show/hide) rather than a layout
    // change of an ancestor. A plain window resize listener catches that
    // case directly.
    window.addEventListener("resize", resize);

    return () => {
      delete container.dataset.liquidGradientActive;
      cancelAnimationFrame(frameId);
      clearInterval(watchdog);
      container.removeEventListener("mousemove", onMouseMove);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      touchTexture.texture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
}
