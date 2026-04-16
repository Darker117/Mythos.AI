import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSettingsStore } from "../store/settingsStore";
import { BACKGROUND_PALETTES, hexToRgb01 } from "../theme/palettes";

/**
 * Animated shader background whose colors track the active app theme.
 *
 * The palette is defined in `src/theme/palettes.ts` — three hex colors per
 * theme feed u_color1/2/3. Shader field = flowing waves + noise + radial
 * pulse + subtle cursor distortion. GUI controls are intentionally absent;
 * Mythos.AI users configure vibe via the theme picker.
 *
 * We mount Three.js once and update uniforms on theme change (no teardown),
 * tweening between palettes over ~900ms so the transition feels deliberate.
 */
export default function BackgroundGradient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<{
    u_color1: { value: THREE.Vector3 };
    u_color2: { value: THREE.Vector3 };
    u_color3: { value: THREE.Vector3 };
  } | null>(null);

  const theme = useSettingsStore((s) => s.settings.theme);

  // Re-tween uniforms whenever the active theme changes.
  useEffect(() => {
    const u = uniformsRef.current;
    if (!u) return;
    const palette = BACKGROUND_PALETTES[theme];
    if (!palette) return;

    const targets = [
      hexToRgb01(palette.c1),
      hexToRgb01(palette.c2),
      hexToRgb01(palette.c3),
    ];
    const startSources: [number, number, number][] = [
      [u.u_color1.value.x, u.u_color1.value.y, u.u_color1.value.z],
      [u.u_color2.value.x, u.u_color2.value.y, u.u_color2.value.z],
      [u.u_color3.value.x, u.u_color3.value.y, u.u_color3.value.z],
    ];

    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // ease-in-out cubic
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const slots = [u.u_color1, u.u_color2, u.u_color3];
      for (let i = 0; i < 3; i++) {
        const src = startSources[i]!;
        const tgt = targets[i]!;
        slots[i]!.value.set(
          src[0] + (tgt[0] - src[0]) * e,
          src[1] + (tgt[1] - src[1]) * e,
          src[2] + (tgt[2] - src[2]) * e,
        );
      }
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Seed uniforms with the current theme's palette.
    const initialTheme = useSettingsStore.getState().settings.theme;
    const seed = BACKGROUND_PALETTES[initialTheme] ?? BACKGROUND_PALETTES.dark;
    const [r1, g1, b1] = hexToRgb01(seed.c1);
    const [r2, g2, b2] = hexToRgb01(seed.c2);
    const [r3, g3, b3] = hexToRgb01(seed.c3);

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_color1: { value: new THREE.Vector3(r1, g1, b1) },
      u_color2: { value: new THREE.Vector3(r2, g2, b2) },
      u_color3: { value: new THREE.Vector3(r3, g3, b3) },
      u_speed: { value: 0.32 },
      u_brightness: { value: 0.78 },
      u_contrast: { value: 1.15 },
    };
    uniformsRef.current = {
      u_color1: uniforms.u_color1,
      u_color2: uniforms.u_color2,
      u_color3: uniforms.u_color3,
    };

    const vertexShader = /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = /* glsl */ `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform float u_speed;
      uniform float u_brightness;
      uniform float u_contrast;
      varying vec2 vUv;

      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = sin(i.x * 12.9898 + i.y * 78.233 + 43758.5453) * 43758.5453;
        float b = sin((i.x+1.0) * 12.9898 + i.y * 78.233 + 43758.5453) * 43758.5453;
        float c = sin(i.x * 12.9898 + (i.y+1.0) * 78.233 + 43758.5453) * 43758.5453;
        float d = sin((i.x+1.0) * 12.9898 + (i.y+1.0) * 78.233 + 43758.5453) * 43758.5453;
        return mix(mix(fract(a), fract(b), u.x), mix(fract(c), fract(d), u.x), u.y);
      }

      void main() {
        vec2 st = vUv;
        float aspect = u_resolution.x / u_resolution.y;
        st.x *= aspect;

        vec2 mouse = u_mouse;
        vec2 mouseSt = vec2(mouse.x * aspect, mouse.y);
        vec2 toMouse = st - mouseSt;
        float mouseInfluence = 1.0 - smoothstep(0.0, 0.75, length(toMouse));

        float time = u_time * u_speed;

        float wave1 = sin(st.x * 3.2 + time) * cos(st.y * 2.8 - time * 0.65);
        float wave2 = sin(st.y * 4.5 + time * 0.85) * 0.65;
        float wave3 = sin((st.x * 2.2 - st.y * 1.7) * 1.9 + time * 0.55) * 0.55;
        float flow = wave1 + wave2 + wave3;

        vec2 noiseCoord = st * 3.8 + u_time * 0.18 * u_speed;
        float detail = smoothNoise(noiseCoord);
        detail += smoothNoise(noiseCoord * 2.6) * 0.45;
        detail *= 0.55;

        vec2 center = vec2(aspect * 0.5, 0.5);
        float radial = sin(length(st - center) * 7.2 - u_time * 0.9 * u_speed) * 0.28;

        float pattern = flow * 0.62 + detail * 0.28 + radial * 0.1;
        pattern += mouseInfluence * 0.35 * sin(u_time * 3.2 * u_speed - length(toMouse) * 14.0);
        pattern = pattern * 0.8 + 0.5;
        pattern = clamp(pattern, 0.0, 1.0);

        float r = sin(pattern * 3.14159 * 2.0 + 0.0) * 0.5 + 0.5;
        float g = sin(pattern * 3.14159 * 2.0 + 2.094) * 0.5 + 0.5;
        float b = sin(pattern * 3.14159 * 2.0 + 4.188) * 0.5 + 0.5;

        vec3 color = vec3(0.0);
        color += u_color1 * r;
        color += u_color2 * g;
        color += u_color3 * b;

        color = color / (r + g + b + 0.001);
        color += sin(u_time * 0.6 * u_speed) * 0.025;
        color += cos(u_time * 0.8 * u_speed) * 0.018;

        float vignette = 1.0 - length(st - center) * 0.55;
        color *= clamp(vignette, 0.45, 1.0);

        color = color * u_brightness;
        color = (color - 0.5) * u_contrast + 0.5;
        color = clamp(color, 0.0, 1.0);
        color = pow(color, vec3(1.0/1.08));

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    function onMouseMove(e: MouseEvent) {
      uniforms.u_mouse.value.set(
        e.clientX / window.innerWidth,
        1.0 - e.clientY / window.innerHeight,
      );
    }
    function onResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      uniforms.u_time.value += clock.getDelta();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      uniformsRef.current = null;
      renderer.dispose();
      material.dispose();
      mesh.geometry.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    />
  );
}
