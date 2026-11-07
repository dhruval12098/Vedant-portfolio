import {
  Mesh,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  WebGLRenderer,
  type Texture,
} from "three";
import { cardOffset, stripGeometry, type StripGeometry } from "./strip-geometry";

/*
 * The projects strip in WebGL: one plane per project, placed exactly where the HTML cards are
 * (strip-geometry). Moving, the planes bow like cloth with the scroll's speed (spring-smoothed);
 * at rest they lie flat. Neighbours are cropped narrower and drained of colour. Under the pointer
 * the centre card ripples faintly, like a liquid surface touched. Renders only while something
 * changes; otherwise it sleeps.
 */

/** Bow at full speed, as a share of the card height. */
const BOW = 0.16;
/** How fast the bow follows the scroll speed (spring), and its damping. */
const STIFF = 120;
const DAMP = 16;
/** Scroll speed (cards per second) that counts as "full". */
const FULL_SPEED = 2.2;

const vertex = /* glsl */ `
  uniform float uBow;      // signed bend, px (scroll direction)
  uniform vec2 uSize;      // plane size, px
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Cloth: the middle of each edge leads, the corners lag.
    p.y += uBow / uSize.y * sin(uv.x * 3.14159265);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uImageAspect;
  uniform vec2 uSize;
  uniform float uGrey;     // 0 colour … 1 grey
  uniform vec2 uMouse;     // card UV
  uniform float uHover;    // 0 … 1
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    // Cover-fit the photo to the (cropped) card.
    float box = uSize.x / uSize.y;
    vec2 uv = vUv - 0.5;
    if (box > uImageAspect) uv.y *= uImageAspect / box; else uv.x *= box / uImageAspect;
    uv += 0.5;
    // A touched liquid surface: rings out from the pointer, fading with distance.
    vec2 d = vUv - uMouse;
    d.x *= box;
    float r = length(d);
    uv += normalize(d + 1e-5) * sin(r * 46.0 - uTime * 5.0) * exp(-r * 6.0) * 0.006 * uHover;
    vec3 c = texture2D(uTex, uv).rgb;
    float g = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(c, vec3(g) * 0.92 + 0.06, uGrey);
    gl_FragColor = vec4(c, 1.0);
  }
`;

interface Card {
  mesh: Mesh;
  material: ShaderMaterial;
  texture: Texture | null;
}

export class ProjectStrip {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(0, 1, 0, -1, -10, 10);
  private readonly geometry = new PlaneGeometry(1, 1, 24, 8);
  private readonly cards: Card[];
  private geo: StripGeometry = { h: 1, wide: 1, narrow: 1, gap: 4 };
  private width = 1;
  private height = 1;
  private f = 0;
  private lastF = 0;
  private bow = { value: 0, velocity: 0 };
  private hover = { target: 0, value: 0, card: -1, uv: new Vector2(0.5, 0.5) };
  private frame = 0;
  private last = 0;
  private time = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    images: readonly string[],
  ) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.cards = images.map(() => {
      const material = new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTex: { value: null },
          uImageAspect: { value: 1.5 },
          uSize: { value: new Vector2(1, 1) },
          uBow: { value: 0 },
          uGrey: { value: 0 },
          uMouse: { value: new Vector2(0.5, 0.5) },
          uHover: { value: 0 },
          uTime: { value: 0 },
        },
      });
      const mesh = new Mesh(this.geometry, material);
      mesh.visible = false;
      this.scene.add(mesh);
      return { mesh, material, texture: null };
    });
  }

  /** Loads every photo (CORS); resolves when all are in. */
  async load(images: readonly string[]): Promise<void> {
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    await Promise.all(
      images.map(async (url, i) => {
        const texture = await loader.loadAsync(url);
        texture.colorSpace = NoColorSpace;
        const img = texture.image as { width: number; height: number };
        const card = this.cards[i];
        card.texture = texture;
        card.material.uniforms.uTex.value = texture;
        card.material.uniforms.uImageAspect.value = img.width / img.height;
        card.mesh.visible = true;
      }),
    );
    this.wake();
  }

  resize(): void {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.width, this.height, false);
    // CSS px, y down: (0,0) top-left.
    this.camera.left = 0;
    this.camera.right = this.width;
    this.camera.top = 0;
    this.camera.bottom = -this.height;
    this.camera.updateProjectionMatrix();
    this.geo = stripGeometry(this.width, this.height);
    this.wake();
  }

  /** Scroll position in cards (0 … n−1). */
  setPosition(f: number): void {
    this.f = f;
    this.wake();
  }

  /** Pointer over card `i` at card UV (u, v), or null. */
  setPointer(i: number | null, u = 0.5, v = 0.5): void {
    this.hover.target = i === null ? 0 : 1;
    if (i !== null) {
      this.hover.card = i;
      this.hover.uv.set(u, v);
    }
    this.wake();
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    for (const c of this.cards) {
      c.texture?.dispose();
      c.material.dispose();
    }
    this.geometry.dispose();
    this.renderer.dispose();
  }

  private wake(): void {
    if (!this.frame) {
      this.last = performance.now();
      this.frame = requestAnimationFrame(this.step);
    }
  }

  private readonly step = (now: number): void => {
    const dt = Math.min((now - this.last) / 1000, 1 / 30) || 1 / 60;
    this.last = now;
    this.time += dt;

    // Bow follows the scroll's speed through a spring: it overshoots a touch when you stop.
    const speed = (this.f - this.lastF) / dt;
    this.lastF = this.f;
    const target = Math.max(-1, Math.min(1, speed / FULL_SPEED)) * BOW * this.geo.h;
    this.bow.velocity += (STIFF * (target - this.bow.value) - DAMP * this.bow.velocity) * dt;
    this.bow.value += this.bow.velocity * dt;
    this.hover.value += (this.hover.target - this.hover.value) * Math.min(1, dt * 6);

    const { h, wide, narrow, gap } = this.geo;
    this.cards.forEach((card, i) => {
      const { d, ad } = cardOffset(i, this.f);
      const w = wide + (narrow - wide) * ad;
      const cy = this.height / 2 + d * (h + gap);
      card.mesh.scale.set(w, h, 1);
      card.mesh.position.set(this.width / 2, -cy, 0);
      const u = card.material.uniforms;
      (u.uSize.value as Vector2).set(w, h);
      u.uBow.value = -this.bow.value;
      u.uGrey.value = ad;
      u.uTime.value = this.time;
      const hovered = i === this.hover.card ? this.hover.value * (1 - ad) : 0;
      u.uHover.value = hovered;
      if (i === this.hover.card) (u.uMouse.value as Vector2).copy(this.hover.uv);
    });
    this.renderer.render(this.scene, this.camera);

    const moving = Math.abs(this.bow.value) > 0.05 || Math.abs(this.bow.velocity) > 0.05 || Math.abs(speed) > 0.001;
    const hovering = this.hover.value > 0.01 || this.hover.target > 0;
    this.frame = moving || hovering ? requestAnimationFrame(this.step) : 0;
  };
}
