import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import "./FintechCryptoDashboardPage.css";

const tickers = [
  { pair: "BTC-PERP", venue: "Deribit", price: 104862.4, delta: 18, fill: "12.8 ms" },
  { pair: "ETH-PERP", venue: "Binance", price: 3818.72, delta: -6, fill: "9.4 ms" },
  { pair: "SOL-USDC", venue: "Kraken", price: 182.38, delta: 31, fill: "14.1 ms" },
  { pair: "ARB-USD", venue: "Coinbase", price: 1.182, delta: 9, fill: "22.6 ms" },
];

const kpis = [
  {
    label: "Net exposure",
    value: 284.6,
    prefix: "$",
    suffix: "M",
    delta: "+42 bps",
    tone: "up",
    spark: [24, 31, 28, 42, 39, 52, 57, 61, 67, 74],
  },
  {
    label: "Realized alpha",
    value: 183.2,
    suffix: " bps",
    delta: "+18.7 today",
    tone: "up",
    spark: [42, 39, 43, 46, 52, 49, 59, 63, 61, 70],
  },
  {
    label: "Order latency p95",
    value: 12.8,
    suffix: " ms",
    delta: "-3.4 ms",
    tone: "up",
    spark: [70, 63, 66, 58, 51, 49, 42, 36, 31, 28],
  },
  {
    label: "Unfilled risk",
    value: 6.4,
    suffix: "%",
    delta: "-81 bps",
    tone: "down",
    spark: [54, 58, 49, 51, 44, 38, 36, 30, 28, 24],
  },
];

const candles = [
  [44, 68, 36, 61],
  [61, 74, 52, 57],
  [57, 62, 42, 48],
  [48, 69, 44, 65],
  [65, 81, 58, 77],
  [77, 88, 68, 71],
  [71, 76, 54, 59],
  [59, 83, 55, 80],
  [80, 93, 73, 86],
  [86, 91, 66, 72],
  [72, 82, 61, 78],
  [78, 96, 76, 92],
];

const depth = [
  { bid: 18, ask: 15, label: "104.74" },
  { bid: 31, ask: 22, label: "104.78" },
  { bid: 46, ask: 38, label: "104.82" },
  { bid: 64, ask: 51, label: "104.86" },
  { bid: 78, ask: 70, label: "104.90" },
  { bid: 92, ask: 86, label: "104.94" },
];

function formatNumber(value, decimals = 1) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(".helix [data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function useCountUp(target, decimals = 1, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return undefined;
    }

    let frame = 0;
    let start = 0;

    function tick(now) {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return formatNumber(value, decimals);
}

function Sparkline({ data, title }) {
  const points = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const pad = 8;
    return data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 130;
        const y = 44 - pad - ((value - min) / (max - min || 1)) * (44 - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data]);

  return (
    <svg className="helix-spark" viewBox="0 0 130 44" role="img" aria-label={title}>
      <polyline points={points} pathLength="1" />
    </svg>
  );
}

function HeroParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      canvas.classList.add("is-static");
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const css = getComputedStyle(document.querySelector(".helix"));
    const accent = new THREE.Color(css.getPropertyValue("--accent").trim());
    const muted = new THREE.Color(css.getPropertyValue("--particle-muted").trim());
    const mouse = new THREE.Vector2(24, 24);
    const targetMouse = new THREE.Vector2(24, 24);
    const ndc = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const cursorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const worldCursor = new THREE.Vector3();
    const localCursor = new THREE.Vector3();
    let pointerStrength = 0;
    let targetPointerStrength = 0;
    const particleCount = window.matchMedia("(pointer: coarse)").matches ? 8500 : 16000;
    const positions = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount);

    camera.position.z = 6.4;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    for (let i = 0; i < particleCount; i += 1) {
      const lane = Math.floor(Math.random() * 13) - 6;
      const x = (Math.random() - 0.5) * 8.8;
      const y = lane * 0.18 + (Math.random() - 0.5) * 0.26;
      const z = (Math.random() - 0.5) * 2.8;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      seeds[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: reduced ? 38 : 0 },
        uMouse: { value: mouse },
        uPointerStrength: { value: 0 },
        uAccent: { value: accent },
        uMuted: { value: muted },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPointerStrength;
        uniform float uPixelRatio;
        attribute float aSeed;
        varying float vEnergy;
        varying float vWake;
        varying float vSeed;

        void main() {
          vec3 p = position;

          float speed = 0.22 + aSeed * 0.22;
          float track = 9.2;
          p.x = mod(p.x + uTime * speed + aSeed * 1.7 + track * 0.5, track) - track * 0.5;

          float current = sin(p.x * 1.45 + uTime * 0.82 + aSeed * 19.0);
          float crossCurrent = sin(p.x * 0.62 - uTime * 0.48 + aSeed * 31.0);
          p.y += current * 0.11 + crossCurrent * 0.06;
          p.z += sin(uTime * 0.36 + aSeed * 28.0) * 0.24;
          p.xy += vec2(crossCurrent, current) * 0.035;

          vec2 d = p.xy - uMouse;
          float dist = dot(d, d);
          float push = exp(-dist * 2.15) * uPointerStrength;
          float wake = exp(-dist * 0.72) * uPointerStrength;
          p.xy += normalize(d + vec2(0.0001)) * push * 1.18;
          p.x += wake * 0.18;
          p.z += push * 0.92;

          float ambient = 0.28 + 0.18 * sin(uTime * 1.2 + aSeed * 44.0);
          vWake = wake;
          vEnergy = ambient + push * 0.92;
          vSeed = aSeed;

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = clamp((2.2 + aSeed * 3.4 + push * 8.6) * uPixelRatio * (5.8 / -mv.z), 1.2, 13.5);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uAccent;
        uniform vec3 uMuted;
        varying float vEnergy;
        varying float vWake;
        varying float vSeed;

        void main() {
          float r = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.06, r) * (0.16 + vEnergy * 0.58 + vWake * 0.12);
          vec3 color = mix(uMuted, uAccent, smoothstep(0.08, 1.0, vEnergy + vWake * 0.28));
          color += vec3(0.06, 0.09, 0.08) * vSeed;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    points.position.set(1.2, -0.12, 0);
    scene.add(points);

    function resize() {
      const { clientWidth, clientHeight } = canvas;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
    }

    function move(event) {
      const rect = canvas.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      if (px < -0.04 || px > 1.04 || py < -0.04 || py > 1.04) {
        targetPointerStrength = 0;
        return;
      }

      ndc.set(px * 2 - 1, -(py * 2 - 1));
      raycaster.setFromCamera(ndc, camera);

      if (raycaster.ray.intersectPlane(cursorPlane, worldCursor)) {
        localCursor.copy(worldCursor);
        points.worldToLocal(localCursor);
        targetMouse.set(localCursor.x, localCursor.y);
        targetPointerStrength = 1;
      }
    }

    let frame = 0;
    function animate(time = 0) {
      mouse.lerp(targetMouse, 0.055);
      pointerStrength += (targetPointerStrength - pointerStrength) * 0.075;
      material.uniforms.uTime.value = reduced ? 38 : time * 0.001;
      material.uniforms.uPointerStrength.value = reduced ? 0 : pointerStrength;
      points.rotation.z = Math.sin(time * 0.00012) * 0.025;
      renderer.render(scene, camera);
      if (!reduced) frame = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas className="helix-particles" ref={canvasRef} aria-hidden="true" />;
}

function TickerTape() {
  const [rows, setRows] = useState(tickers);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRows((current) =>
        current.map((row) => {
          const drift = (Math.random() - 0.45) * (row.price > 1000 ? 64 : 0.38);
          return {
            ...row,
            price: Math.max(row.price + drift, 0.001),
            delta: Math.round(row.delta + (Math.random() - 0.48) * 8),
          };
        }),
      );
    }, 1800);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="helix-tape" aria-label="Live execution tape">
      {rows.map((row) => (
        <div className="helix-tape-row" key={row.pair}>
          <span>{row.pair}</span>
          <span>{row.venue}</span>
          <strong>{row.price > 1000 ? formatNumber(row.price, 1) : formatNumber(row.price, 3)}</strong>
          <em className={row.delta >= 0 ? "is-up" : "is-down"}>
            {row.delta >= 0 ? "+" : ""}
            {row.delta} bps
          </em>
          <span>{row.fill}</span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ item, index }) {
  const value = useCountUp(item.value, item.value < 20 ? 1 : 1);

  return (
    <article className="helix-kpi" data-reveal style={{ "--reveal-delay": `${index * 70}ms` }}>
      <div className="helix-kpi-head">
        <span>{item.label}</span>
        <em className={item.tone === "up" ? "is-up" : "is-down"}>{item.delta}</em>
      </div>
      <strong>
        {item.prefix}
        {value}
        {item.suffix}
      </strong>
      <Sparkline data={item.spark} title={`${item.label} intraday trend`} />
    </article>
  );
}

function CandlestickChart() {
  const min = Math.min(...candles.flat());
  const max = Math.max(...candles.flat());
  const scaleY = (value) => 184 - ((value - min) / (max - min)) * 144;

  return (
    <svg className="helix-candles" viewBox="0 0 620 230" role="img" aria-label="BTC perpetual basis tightening over the last twelve intervals">
      {[0, 1, 2, 3].map((line) => (
        <line key={line} x1="36" x2="596" y1={42 + line * 42} y2={42 + line * 42} />
      ))}
      {candles.map(([open, high, low, close], index) => {
        const x = 58 + index * 46;
        const up = close >= open;
        const top = scaleY(Math.max(open, close));
        const height = Math.max(Math.abs(scaleY(open) - scaleY(close)), 4);
        return (
          <g key={`${open}-${index}`} className={up ? "up" : "down"}>
            <line className="wick" x1={x} x2={x} y1={scaleY(high)} y2={scaleY(low)} />
            <rect x={x - 10} y={top} width="20" height={height} rx="2" />
          </g>
        );
      })}
      {["09:30", "10:15", "11:00", "11:45"].map((label, index) => (
        <text key={label} x={60 + index * 154} y="216">
          {label}
        </text>
      ))}
    </svg>
  );
}

function DepthChart() {
  return (
    <div className="helix-depth" role="img" aria-label="Aggregated order book depth showing bids and asks around mid price">
      {depth.map((row) => (
        <div className="helix-depth-row" key={row.label}>
          <span className="bid" style={{ "--depth": `${row.bid}%` }} />
          <b>{row.label}</b>
          <span className="ask" style={{ "--depth": `${row.ask}%` }} />
        </div>
      ))}
    </div>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("Request desk access");

  function submit(event) {
    event.preventDefault();
    setState(email.includes("@") ? "Desk access requested" : "Use a work email");
  }

  return (
    <form className="helix-form" onSubmit={submit}>
      <label htmlFor="helix-email">Work email</label>
      <div>
        <input
          id="helix-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="pm@fund.example"
          autoComplete="email"
        />
        <button type="submit">{state}</button>
      </div>
      <p>Private beta seats are reviewed by strategy, venue coverage, and average daily notional.</p>
    </form>
  );
}

export function FintechCryptoDashboardPage() {
  useReveal();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Helix Terminal | Crypto Portfolio and On-chain Analytics";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="helix">
      <header className="helix-hero">
        <HeroParticleField />
        <nav className="helix-nav" aria-label="Helix">
          <a className="helix-brand" href="/">
            Helix Terminal
          </a>
          <div className="helix-nav-links">
            <a href="#dashboard">Dashboard</a>
            <a href="#signals">Signals</a>
            <a href="#waitlist">Waitlist</a>
          </div>
        </nav>

        <section className="helix-hero-grid" aria-labelledby="helix-title">
          <div className="helix-hero-copy">
            <p className="helix-kicker">On-chain execution intelligence / closed beta</p>
            <h1 id="helix-title" aria-label="See flow, basis, and fills before the book moves.">
              <span aria-hidden="true"><span>See flow, basis,</span></span>
              <span aria-hidden="true"><span>and fills before</span></span>
              <span aria-hidden="true"><span>the book moves.</span></span>
            </h1>
            <p className="helix-dek">
              Helix Terminal consolidates venue risk, wallet behavior, perp basis, and execution
              telemetry into one dense command surface for professional crypto desks.
            </p>
            <div className="helix-actions">
              <a className="helix-primary" href="#waitlist">Join the waitlist</a>
              <a className="helix-secondary" href="#dashboard">Inspect dashboard</a>
            </div>
          </div>

          <aside className="helix-execution-card" aria-label="Execution health">
            <div className="helix-panel-head">
              <span>Execution mesh</span>
              <em>LIVE</em>
            </div>
            <TickerTape />
          </aside>
        </section>
      </header>

      <section className="helix-proof" data-reveal aria-label="Platform proof points">
        <div>
          <span>VENUES</span>
          <strong>18</strong>
          <p>CEX, DEX, RFQ, and custody routes normalized into one risk ledger.</p>
        </div>
        <div>
          <span>CHAIN COVERAGE</span>
          <strong>42</strong>
          <p>Wallet clusters scored by flow age, realized PnL, and exchange routing.</p>
        </div>
        <div>
          <span>FILL TELEMETRY</span>
          <strong>5 ms</strong>
          <p>P50 order ack stitched against post-trade slippage and maker rebates.</p>
        </div>
      </section>

      <section className="helix-dashboard-section" id="dashboard" aria-labelledby="dashboard-title">
        <div className="helix-section-copy" data-reveal>
          <p className="helix-kicker">Portfolio command surface</p>
          <h2 id="dashboard-title">Built for the desk that marks risk every minute.</h2>
          <p>
            No retail confetti, no vanity balances. Basis drift, venue inventory, smart-wallet
            pressure, route health, and fills stay visible in the same scan path.
          </p>
        </div>

        <div className="helix-terminal" data-reveal>
          <div className="helix-terminal-top">
            <div>
              <span>HELIX / PORTFOLIO RISK</span>
              <strong>Global book / BTC focus</strong>
            </div>
            <div className="helix-segmented" aria-label="Time range">
              <button type="button">1H</button>
              <button type="button" className="active">4H</button>
              <button type="button">1D</button>
            </div>
          </div>

          <div className="helix-kpi-grid">
            {kpis.map((item, index) => (
              <KpiCard key={item.label} item={item} index={index} />
            ))}
          </div>

          <div className="helix-chart-grid">
            <section className="helix-chart-card helix-chart-main">
              <div className="helix-panel-head">
                <span>BTC perp basis / execution pressure</span>
                <em>+23 bps</em>
              </div>
              <CandlestickChart />
            </section>

            <section className="helix-chart-card">
              <div className="helix-panel-head">
                <span>Aggregated depth</span>
                <em>104,862.4 mid</em>
              </div>
              <DepthChart />
            </section>
          </div>
        </div>
      </section>

      <section className="helix-signals" id="signals" aria-labelledby="signals-title">
        <div className="helix-section-copy" data-reveal>
          <p className="helix-kicker">Signal stack</p>
          <h2 id="signals-title">On-chain context without leaving the execution frame.</h2>
        </div>
        <div className="helix-signal-grid">
          {[
            ["Wallet cohorts", "Fresh exchange inflows segmented by realized basis and venue destination."],
            ["Basis monitor", "Perp/spot dislocations tracked per instrument with borrow-adjusted carry."],
            ["Fill audit", "Route-level slippage, maker share, and rejected quantity replayable by order ID."],
            ["Latency guard", "Venue ack drift and websocket gaps escalated before stale marks leak into sizing."],
          ].map(([title, copy], index) => (
            <article key={title} data-reveal style={{ "--reveal-delay": `${index * 65}ms` }}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="helix-waitlist" id="waitlist" data-reveal aria-labelledby="waitlist-title">
        <div>
          <p className="helix-kicker">Closed beta intake</p>
          <h2 id="waitlist-title">Bring the book. We'll bring the terminal.</h2>
          <p>
            Currently onboarding market-neutral funds, OTC desks, and active treasury teams with
            multi-venue crypto exposure.
          </p>
        </div>
        <WaitlistForm />
      </section>
    </main>
  );
}
