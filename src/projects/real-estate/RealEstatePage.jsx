import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";
import "./RealEstatePage.css";

gsap.registerPlugin(ScrollTrigger);

const chapters = [
  {
    title: "Arrive",
    eyebrow: "Transit hub",
    text: "Platform, plaza, shade, and last-mile mobility are the first frame of the district.",
  },
  {
    title: "Live",
    eyebrow: "Residences",
    text: "Four residential addresses step down toward courtyards and food hall frontage.",
  },
  {
    title: "Work",
    eyebrow: "Creative offices",
    text: "Flexible floor plates sit over retail, with service access kept out of the pedestrian flow.",
  },
  {
    title: "Unwind",
    eyebrow: "Rooftop park",
    text: "The journey resolves above grade: a connected park deck, event lawn, and sunset rooms.",
  },
];

const metrics = [
  ["14", "acres"],
  ["2027", "launch"],
  ["1.8M", "planned sq ft"],
  ["4", "district chapters"],
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RealEstatePage() {
  const rootRef = useRef(null);
  const journeyRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const activeRef = useRef(0);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const previousTitle = document.title;
    const previousRestoration = history.scrollRestoration;
    document.title = "Meridian Quarter | Austin 2027";
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    return () => {
      document.title = previousTitle;
      history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const journey = journeyRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!root || !journey || !stage || !canvas) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = createDistrictScene(canvas, { reduced: reduceMotion });
    const revealItems = root.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));
    requestAnimationFrame(() => root.classList.add("is-ready"));

    if (reduceMotion) {
      scene.setProgress(0.82);
      setActiveChapter(3);
      return () => {
        observer.disconnect();
        scene.dispose();
      };
    }

    let lenis;
    let ticker;
    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      lenis = new Lenis({
        lerp: 0.09,
        wheelMultiplier: 0.92,
        touchMultiplier: 1.1,
        smoothWheel: true,
      });

      ticker = (time) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      const trigger = ScrollTrigger.create({
        trigger: journey,
        pin: stage,
        start: "top top",
        end: "+=420%",
        scrub: 0.75,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const progress = self.progress;
          scene.setProgress(progress);
          const next = Math.min(chapters.length - 1, Math.floor(progress * chapters.length));
          if (next !== activeRef.current) {
            activeRef.current = next;
            setActiveChapter(next);
          }
        },
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      return () => {
        trigger.kill();
        if (ticker) gsap.ticker.remove(ticker);
        lenis?.destroy();
      };
    });

    return () => {
      mm.revert();
      observer.disconnect();
      scene.dispose();
    };
  }, []);

  return (
    <main className="meridian-page" ref={rootRef}>
      <header className="mq-nav" aria-label="Meridian Quarter primary">
        <a className="mq-mark" href="#top" aria-label="Meridian Quarter home">
          <span>MQ</span>
          <small>Austin / 2027</small>
        </a>
        <nav className="mq-nav-links" aria-label="Page sections">
          <a href="#masterplan">Masterplan</a>
          <a href="#capital">Capital</a>
          <a href="#tour">Tour</a>
        </nav>
        <a className="mq-nav-cta" href="#tour">
          Book tour
          <ArrowIcon />
        </a>
      </header>

      <section id="top" className="mq-journey" ref={journeyRef} aria-label="Meridian Quarter scroll journey">
        <div className="mq-stage" ref={stageRef}>
          <canvas ref={canvasRef} className="mq-canvas" aria-hidden="true" />
          <div className="mq-grain" aria-hidden="true" />
          <div className="mq-stage-copy">
            <p className="mq-label mq-hero-kicker">Meridian Quarter / 14 acres / East Austin</p>
            <h1 aria-label="Meridian Quarter">
              <span>Meridian</span>
              <span>Quarter</span>
            </h1>
            <p>
              A mixed-use district launching in 2027, designed as a walkable capital instrument:
              transit-linked, pre-sale ready, and sequenced for long-term neighborhood yield.
            </p>
            <div className="mq-hero-actions">
              <a className="mq-button mq-button-primary" href="#tour">
                Reserve a site tour
                <ArrowIcon />
              </a>
              <a className="mq-button mq-button-secondary" href="#capital">
                View capital brief
              </a>
            </div>
          </div>

          <aside className="mq-chapters" aria-label="Scroll chapters">
            <p className="mq-label">Route sequence</p>
            <ol>
              {chapters.map((chapter, index) => (
                <li key={chapter.title} className={activeChapter === index ? "is-active" : ""}>
                  <span className="mq-chapter-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{chapter.title}</strong>
                    <small>{chapter.eyebrow}</small>
                    <p>{chapter.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>

          <div className="mq-scroll-meter" aria-hidden="true">
            <span />
            <small>Scroll the site walk</small>
          </div>
        </div>
      </section>

      <section id="masterplan" className="mq-proof mq-section">
        <div className="mq-section-grid">
          <div data-reveal>
            <p className="mq-label">Masterplan signal</p>
            <h2>One path ties the asset stack together.</h2>
          </div>
          <p data-reveal>
            The public realm is treated as operating infrastructure, not leftover space. Leasing,
            residences, retail, office, and park traffic meet on a route that can be toured in
            under twelve minutes without crossing service lanes.
          </p>
        </div>
        <div className="mq-metrics" data-reveal>
          {metrics.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="capital" className="mq-capital mq-section">
        <div className="mq-capital-copy" data-reveal>
          <p className="mq-label">Investor lens</p>
          <h2>Quiet underwriting, visible demand.</h2>
          <p>
            Meridian Quarter is positioned for pre-sale buyers and private capital looking for a
            district-scale Austin story before construction noise enters the market. The launch
            package prioritizes phasing, absorption, and tourable proof points.
          </p>
        </div>
        <div className="mq-capital-table" data-reveal>
          <div>
            <span>Phase I</span>
            <strong>Transit plaza + residential podiums</strong>
          </div>
          <div>
            <span>Phase II</span>
            <strong>Office lofts + retail lane</strong>
          </div>
          <div>
            <span>Phase III</span>
            <strong>Rooftop park + event programming</strong>
          </div>
        </div>
      </section>

      <section id="tour" className="mq-tour mq-section">
        <div className="mq-tour-copy" data-reveal>
          <p className="mq-label">Private preview</p>
          <h2>Book the Meridian Quarter tour.</h2>
          <p>
            Founder tours run in small groups for investors, brokers, and pre-sale buyers. Each
            session includes the route model, capital memo, and release schedule.
          </p>
        </div>
        <form className="mq-tour-form" data-reveal>
          <label>
            Name
            <input type="text" name="name" autoComplete="name" placeholder="Alex Morgan" />
          </label>
          <label>
            Email
            <input type="email" name="email" autoComplete="email" placeholder="alex@firm.com" />
          </label>
          <label>
            Tour window
            <select name="window" defaultValue="Founding preview">
              <option>Founding preview</option>
              <option>Broker walkthrough</option>
              <option>Capital partner session</option>
            </select>
          </label>
          <button type="button" className="mq-button mq-button-primary">
            Request tour slot
            <ArrowIcon />
          </button>
        </form>
      </section>
    </main>
  );
}

function createDistrictScene(canvas, { reduced }) {
  const rootStyles = getComputedStyle(document.documentElement);
  const token = (name, fallback) => rootStyles.getPropertyValue(name).trim() || fallback;
  const colors = {
    bg: token("--mq-bg", "#07120f"),
    ground: token("--mq-webgl-ground", "#0e1915"),
    surface: token("--mq-webgl-block", "#1e3028"),
    surfaceLight: token("--mq-webgl-block-light", "#31463b"),
    accent: token("--mq-accent", "#d8b56c"),
    mint: token("--mq-mint", "#7ef6d6"),
    lineMuted: token("--mq-line-muted", "#284339"),
  };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(new THREE.Color(colors.bg), 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(colors.bg, 9, 21);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  const route = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.4, 0.06, 1.25),
    new THREE.Vector3(-3.55, 0.06, -0.55),
    new THREE.Vector3(-1.15, 0.06, -1.05),
    new THREE.Vector3(1.15, 0.06, -0.3),
    new THREE.Vector3(2.55, 0.06, 1.05),
    new THREE.Vector3(4.65, 0.06, 1.8),
  ]);

  const world = new THREE.Group();
  world.rotation.y = -0.22;
  scene.add(world);

  const ambient = new THREE.HemisphereLight("#d8fff1", "#07120f", 1.1);
  const sun = new THREE.DirectionalLight("#fff0c8", 2.7);
  sun.position.set(-3.5, 6, 4.5);
  scene.add(ambient, sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(13.5, 8.3, 1, 1),
    new THREE.MeshStandardMaterial({
      color: colors.ground,
      roughness: 0.94,
      metalness: 0.02,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  world.add(ground);

  const grid = new THREE.GridHelper(13.5, 18, colors.lineMuted, colors.lineMuted);
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
  grid.position.y = 0.005;
  world.add(grid);

  const shadowTexture = makeRadialTexture("rgba(0,0,0,0.42)");
  const contactShadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
  });
  const blockMaterials = [
    new THREE.MeshStandardMaterial({ color: colors.surface, roughness: 0.78, metalness: 0.04 }),
    new THREE.MeshStandardMaterial({ color: colors.surfaceLight, roughness: 0.72, metalness: 0.06 }),
    new THREE.MeshStandardMaterial({
      color: "#23352e",
      emissive: new THREE.Color(colors.accent),
      emissiveIntensity: 0.02,
      roughness: 0.7,
      metalness: 0.08,
    }),
  ];
  const buildings = [];
  const blocks = [
    [-4.75, -1.05, 0.8, 0.92, 0.7, 0],
    [-3.8, 1.0, 0.85, 1.45, 0.9, 2],
    [-2.7, -1.7, 1.15, 0.82, 0.85, 0],
    [-1.35, 1.35, 1.05, 1.85, 1.1, 1],
    [-0.25, -1.55, 0.95, 1.15, 0.7, 2],
    [0.95, 1.35, 1.28, 1.6, 0.8, 0],
    [1.75, -1.15, 1.45, 1.25, 0.92, 1],
    [2.8, 0.02, 0.95, 2.25, 1.18, 2],
    [3.75, -1.5, 0.9, 1.0, 0.82, 0],
    [4.65, 0.85, 1.55, 0.72, 1.05, 1],
  ];

  blocks.forEach(([x, z, w, h, d, matIndex], index) => {
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      blockMaterials[matIndex].clone(),
    );
    building.position.set(x, h / 2, z);
    building.rotation.y = (index % 3 - 1) * 0.08;
    building.userData.baseY = building.position.y;
    building.userData.charge = route.getUtoTmapping(Math.min(index / (blocks.length - 1), 0.98));
    buildings.push(building);
    world.add(building);

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, d * 1.5), contactShadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, 0.012, z);
    shadow.rotation.z = building.rotation.y;
    world.add(shadow);
  });

  const transit = makeStationMarker(colors.mint, "transit");
  transit.position.set(-5.45, 0.08, 1.25);
  const park = makeStationMarker(colors.accent, "park");
  park.position.set(4.65, 0.08, 1.8);
  world.add(transit, park);

  const baseRoute = new THREE.Mesh(
    new THREE.TubeGeometry(route, 160, 0.018, 8, false),
    new THREE.MeshBasicMaterial({ color: colors.lineMuted, transparent: true, opacity: 0.46 }),
  );
  world.add(baseRoute);

  const lineUniforms = {
    uProgress: { value: reduced ? 0.82 : 0 },
    uColor: { value: new THREE.Color(colors.mint) },
    uAlpha: { value: 0.88 },
  };
  const haloUniforms = {
    uProgress: lineUniforms.uProgress,
    uColor: { value: new THREE.Color(colors.accent) },
    uAlpha: { value: 0.2 },
  };
  const lineMaterial = makeRouteMaterial(lineUniforms);
  const haloMaterial = makeRouteMaterial(haloUniforms);
  const halo = new THREE.Mesh(new THREE.TubeGeometry(route, 220, 0.12, 18, false), haloMaterial);
  const core = new THREE.Mesh(new THREE.TubeGeometry(route, 220, 0.035, 14, false), lineMaterial);
  world.add(halo, core);

  const headSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeRadialTexture("rgba(126,246,214,0.95)"),
      color: colors.mint,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  headSprite.scale.set(0.74, 0.74, 0.74);
  world.add(headSprite);

  const lightField = makeGroundLights(colors);
  world.add(lightField.points);

  let targetProgress = reduced ? 0.82 : 0;
  let smoothProgress = targetProgress;
  let frame = 0;
  let disposed = false;
  const target = new THREE.Vector3();
  const look = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const cameraOffset = new THREE.Vector3();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function cameraRig(progress) {
    const points = [
      { p: 0, r: 7.9, e: 4.2, a: -1.05, ahead: 1.15 },
      { p: 0.28, r: 6.3, e: 3.0, a: -0.42, ahead: 1.35 },
      { p: 0.56, r: 5.7, e: 3.8, a: 0.55, ahead: 1.08 },
      { p: 0.82, r: 7.4, e: 5.2, a: 1.02, ahead: 0.88 },
      { p: 1, r: 8.8, e: 6.1, a: 0.32, ahead: 0.7 },
    ];
    let left = points[0];
    let right = points[points.length - 1];
    for (let i = 0; i < points.length - 1; i += 1) {
      if (progress >= points[i].p && progress <= points[i + 1].p) {
        left = points[i];
        right = points[i + 1];
        break;
      }
    }
    const span = Math.max(0.001, right.p - left.p);
    const t = 1 - Math.pow(1 - (progress - left.p) / span, 3);
    return {
      radius: THREE.MathUtils.lerp(left.r, right.r, t),
      elevation: THREE.MathUtils.lerp(left.e, right.e, t),
      azimuth: THREE.MathUtils.lerp(left.a, right.a, t),
      ahead: THREE.MathUtils.lerp(left.ahead, right.ahead, t),
    };
  }

  function renderScene(time = 0) {
    resize();
    smoothProgress += (targetProgress - smoothProgress) * (reduced ? 1 : 0.075);
    const progress = THREE.MathUtils.clamp(smoothProgress, 0.002, 0.998);
    const head = route.getPointAt(progress, target);
    route.getTangentAt(progress, tangent).normalize();
    lineUniforms.uProgress.value = progress;
    lightField.material.uniforms.uHead.value.copy(head);
    lightField.material.uniforms.uProgress.value = progress;
    headSprite.position.copy(head);
    headSprite.position.y += 0.12;
    headSprite.material.opacity = 0.72 + Math.sin(time * 0.004) * 0.12;

    buildings.forEach((building, index) => {
      const charge = Math.exp(-Math.pow((progress - building.userData.charge) * 7.2, 2));
      building.position.y = building.userData.baseY + charge * 0.035;
      building.material.emissiveIntensity = 0.015 + charge * 0.32;
      building.rotation.y += reduced ? 0 : Math.sin(time * 0.00018 + index) * 0.00035;
    });

    transit.rotation.y = time * 0.00024;
    park.rotation.y = -time * 0.00018;

    const rig = cameraRig(progress);
    cameraOffset.set(
      Math.cos(rig.azimuth) * rig.radius,
      rig.elevation,
      Math.sin(rig.azimuth) * rig.radius,
    );
    camera.position.copy(head).add(cameraOffset);
    look.copy(head).addScaledVector(tangent, rig.ahead);
    look.y += 0.34;
    camera.lookAt(look);
    renderer.render(scene, camera);
  }

  function loop(time) {
    if (disposed) return;
    renderScene(time);
    frame = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  if (reduced) {
    renderScene(0);
  } else {
    frame = requestAnimationFrame(loop);
  }

  return {
    setProgress(progress) {
      targetProgress = THREE.MathUtils.clamp(progress, 0, 1);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (material.map) material.map.dispose();
            material.dispose();
          });
        }
      });
      shadowTexture.dispose();
      lightField.geometry.dispose();
      renderer.dispose();
    },
  };
}

function makeRouteMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uProgress;
      uniform vec3 uColor;
      uniform float uAlpha;
      void main() {
        if (vUv.x > uProgress || uProgress < 0.003) discard;
        float behind = clamp(uProgress - vUv.x, 0.0, 1.0);
        float head = exp(-behind * 34.0);
        float trail = smoothstep(0.0, 0.04, uProgress - vUv.x);
        float alpha = uAlpha * trail * (0.36 + head * 1.35);
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });
}

function makeGroundLights(colors) {
  const positions = [];
  for (let x = -6; x <= 6; x += 0.42) {
    for (let z = -3.6; z <= 3.6; z += 0.42) {
      const jitter = Math.sin(x * 8.1 + z * 2.7) * 0.035;
      positions.push(x + jitter, 0.035, z - jitter);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uHead: { value: new THREE.Vector3() },
      uProgress: { value: 0 },
      uBase: { value: new THREE.Color(colors.lineMuted) },
      uHot: { value: new THREE.Color(colors.mint) },
    },
    transparent: true,
    depthWrite: false,
    vertexShader: `
      varying float vI;
      uniform vec3 uHead;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float d = distance(position.xz, uHead.xz);
        vI = exp(-d * d * 0.62);
        gl_PointSize = clamp((1.8 + vI * 7.5) * (70.0 / -mvPosition.z), 1.2, 10.5);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vI;
      uniform vec3 uBase;
      uniform vec3 uHot;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float disc = smoothstep(0.5, 0.1, r);
        vec3 color = mix(uBase, uHot, vI);
        gl_FragColor = vec4(color, disc * (0.13 + vI * 0.86));
      }
    `,
  });
  return {
    points: new THREE.Points(geometry, material),
    material,
    geometry,
  };
}

function makeStationMarker(color, type) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(type === "park" ? 0.36 : 0.28, 0.018, 8, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.88 }),
  );
  ring.rotation.x = Math.PI / 2;
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, type === "park" ? 0.9 : 0.7, 8),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.78 }),
  );
  mast.position.y = type === "park" ? 0.45 : 0.35;
  group.add(ring, mast);
  return group;
}

function makeRadialTexture(color) {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.45, color.replace(/[\d.]+\)$/, "0.28)"));
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
