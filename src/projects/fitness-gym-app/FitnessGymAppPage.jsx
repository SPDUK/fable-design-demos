import { useEffect, useRef, useState } from "react";
import trainerElenaVoss from "./assets/trainer-elena-voss.jpg";
import trainerMayaCross from "./assets/trainer-maya-cross.jpg";
import trainerRafiOkoro from "./assets/trainer-rafi-okoro.jpg";
import workoutAfterburnHiit from "./assets/workout-afterburn-hiit.jpg";
import workoutForgeStrength from "./assets/workout-forge-strength.jpg";
import workoutMobilityReset from "./assets/workout-mobility-reset.jpg";
import "./FitnessGymAppPage.css";

const workouts = [
  {
    title: "Afterburn HIIT",
    meta: "28 min / 415 kcal",
    intensity: "Redline",
    image: workoutAfterburnHiit,
  },
  {
    title: "Forge Strength",
    meta: "46 min / upper push",
    intensity: "Heavy",
    image: workoutForgeStrength,
  },
  {
    title: "Mobility Reset",
    meta: "18 min / hips + spine",
    intensity: "Control",
    image: workoutMobilityReset,
  },
];

const trainers = [
  {
    name: "Maya Cross",
    role: "Hybrid strength coach",
    stat: "4.98 rating",
    image: trainerMayaCross,
    bio:
      "Maya programs strength blocks for people who want heavy lifts without losing sprint capacity. Her sessions pair barbell fundamentals with quick diagnostics, so every set has a purpose and every recovery window has a reason.",
    focus: ["Strength density", "Form audits", "Recovery pacing"],
  },
  {
    name: "Rafi Okoro",
    role: "Speed + conditioning",
    stat: "12k sessions",
    image: trainerRafiOkoro,
    bio:
      "Rafi builds engine work for busy athletes: short acceleration blocks, repeatable conditioning tests, and weekly pace targets that keep intensity high without turning every workout into punishment.",
    focus: ["Sprint mechanics", "HIIT blocks", "Wearable sync"],
  },
  {
    name: "Elena Voss",
    role: "Mobility architect",
    stat: "9 programs",
    image: trainerElenaVoss,
    bio:
      "Elena turns mobility into measurable training. She maps restricted ranges, assigns joint-specific prep, and keeps strength days moving by giving stiff shoulders, hips, and ankles a clear plan.",
    focus: ["Mobility mapping", "Joint prep", "Reset sessions"],
  },
];

const plans = [
  {
    name: "Starter",
    price: "$19",
    note: "Solo training, structured weeks, smart swaps.",
    cta: "Start training",
  },
  {
    name: "Athlete",
    price: "$39",
    note: "Live form checks, recovery scoring, trainer chat.",
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Crew",
    price: "$89",
    note: "Team boards, shared blocks, coach analytics.",
    cta: "Build your crew",
  },
];

function Icon({ name }) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    play: <path d="m9 7 8 5-8 5V7Z" />,
    bolt: (
      <>
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
      </>
    ),
    moon: <path d="M21 14.6A8 8 0 0 1 9.4 3 7 7 0 1 0 21 14.6Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="fg-icon">
      {paths[name]}
    </svg>
  );
}

export function FitnessGymAppPage() {
  const pageRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = window.requestAnimationFrame(() => page.classList.add("is-mounted"));

    const revealEls = [...page.querySelectorAll("[data-reveal]")];
    const counters = [...page.querySelectorAll("[data-countup]")];
    let counterFrame = 0;

    const countUp = (el) => {
      const target = Number(el.dataset.countup);
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) {
        el.textContent = `${target.toLocaleString()}${suffix}`;
        return;
      }

      const start = performance.now();
      const duration = 1200;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = `${Math.round(target * eased).toLocaleString()}${suffix}`;
        if (progress < 1) counterFrame = window.requestAnimationFrame(tick);
      };
      counterFrame = window.requestAnimationFrame(tick);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          countObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.7 },
    );

    revealEls.forEach((el) => revealObserver.observe(el));
    counters.forEach((el) => countObserver.observe(el));

    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(counterFrame);
      revealObserver.disconnect();
      countObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!selectedTrainer) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelectedTrainer(null);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedTrainer]);

  return (
    <div className="fg-page" ref={pageRef}>
      <header className="fg-nav">
        <a className="fg-brand" href="/" aria-label="PulseForge home">
          <span className="fg-brand-mark">
            <Icon name="bolt" />
          </span>
          PulseForge
        </a>
        <nav aria-label="Fitness app sections">
          <a href="#workouts">Workouts</a>
          <a href="#progress">Progress</a>
          <a href="#coaches">Coaches</a>
          <a href="#plans">Plans</a>
        </nav>
        <a className="fg-nav-cta" href="#plans">
          Join now
        </a>
      </header>

      <main>
        <section className="fg-hero" aria-labelledby="fg-title">
          <div className="fg-hero-copy">
            <p className="fg-label fg-hero-kicker">
              <Icon name="moon" />
              Dark mode training OS
            </p>
            <h1 id="fg-title">
              <span>
                <span>Go harder.</span>
              </span>
              <span>
                <span>Track it.</span>
              </span>
            </h1>
            <p className="fg-hero-text">
              PulseForge turns every block into a coached interval: workout
              previews, recovery-aware goals, and progress signals that make
              tomorrow impossible to ignore.
            </p>
            <div className="fg-actions" aria-label="Primary actions">
              <a className="fg-button fg-button-primary" href="#plans">
                Start 14-day trial
                <Icon name="arrow" />
              </a>
              <a className="fg-button fg-button-secondary" href="#workouts">
                <Icon name="play" />
                Preview sessions
              </a>
            </div>
          </div>

          <div className="fg-hero-visual" aria-label="Live workout tracking preview">
            <div className="fg-energy-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="fg-phone">
              <div className="fg-phone-top">
                <span>LIVE BLOCK</span>
                <strong>08:42</strong>
              </div>
              <div className="fg-training-ring">
                <svg viewBox="0 0 160 160" aria-hidden="true">
                  <circle cx="80" cy="80" r="62" />
                  <circle cx="80" cy="80" r="62" />
                  <circle cx="80" cy="80" r="45" />
                </svg>
                <div>
                  <span>HR</span>
                  <strong>154</strong>
                  <small>bpm</small>
                </div>
              </div>
              <div className="fg-intervals">
                <span>Burpee sprint</span>
                <strong>04 / 08</strong>
                <div className="fg-progress-line">
                  <i />
                </div>
              </div>
              <div className="fg-mini-chart" aria-hidden="true">
                <span style={{ "--h": "38%" }} />
                <span style={{ "--h": "58%" }} />
                <span style={{ "--h": "44%" }} />
                <span style={{ "--h": "82%" }} />
                <span style={{ "--h": "64%" }} />
                <span style={{ "--h": "92%" }} />
                <span style={{ "--h": "70%" }} />
              </div>
            </div>
            <aside className="fg-live-card">
              <span>RECOVERY</span>
              <strong>91%</strong>
              <small>green light for strength</small>
            </aside>
            <aside className="fg-rep-card">
              <span>REP CHECK</span>
              <strong>+18%</strong>
              <small>cleaner lockout this week</small>
            </aside>
          </div>
        </section>

        <section className="fg-metrics" aria-label="PulseForge outcomes">
          <div>
            <strong data-countup="72" data-suffix="%">
              0%
            </strong>
            <span>members who hit a weekly streak by day 10</span>
          </div>
          <div>
            <strong data-countup="640" data-suffix="+">
              0+
            </strong>
            <span>trainer-built blocks across strength, HIIT, mobility</span>
          </div>
          <div>
            <strong data-countup="14" data-suffix="m">
              0m
            </strong>
            <span>monthly logged minutes inside live coaching mode</span>
          </div>
        </section>

        <section className="fg-section fg-workouts" id="workouts" aria-labelledby="workouts-title">
          <div className="fg-section-heading" data-reveal>
            <p className="fg-label">Workout previews</p>
            <h2 id="workouts-title">Pick the pressure. See the burn before you start.</h2>
          </div>
          <div className="fg-workout-grid">
            {workouts.map((workout, index) => (
              <article
                className={`fg-workout-card fg-workout-card-${index + 1}`}
                key={workout.title}
                data-reveal
                style={{ "--reveal-delay": `${index * 80}ms` }}
              >
                <img src={workout.image} alt={`${workout.title} training preview`} />
                <div>
                  <span>{workout.intensity}</span>
                  <h3>{workout.title}</h3>
                  <p>{workout.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="fg-section fg-progress" id="progress" aria-labelledby="progress-title">
          <div className="fg-progress-copy" data-reveal>
            <p className="fg-label">Progress tracking demo</p>
            <h2 id="progress-title">A dashboard that rewards consistency, not guesswork.</h2>
            <p>
              The app blends load, sleep, heart-rate drift, and completed blocks
              into one training readiness score. Every number has a next move.
            </p>
          </div>
          <div className="fg-dashboard" data-reveal style={{ "--reveal-delay": "120ms" }}>
            <div className="fg-dashboard-header">
              <div>
                <span>June block</span>
                <strong>Week 3</strong>
              </div>
              <button type="button">Sync wearable</button>
            </div>
            <div className="fg-readiness">
              <span>Readiness</span>
              <strong>88</strong>
              <small>push heavy today</small>
            </div>
            <div className="fg-week-grid" aria-label="Weekly training completion">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <span key={`${day}-${index}`} className={index < 5 ? "is-done" : ""}>
                  {day}
                </span>
              ))}
            </div>
            <div className="fg-line-chart" aria-hidden="true">
              <svg viewBox="0 0 520 180" preserveAspectRatio="none">
                <path d="M8 140 C72 84 124 132 184 86 S300 48 354 74 438 96 512 34" />
                <path d="M8 140 C72 84 124 132 184 86 S300 48 354 74 438 96 512 34 L512 176 L8 176Z" />
              </svg>
            </div>
          </div>
        </section>

        <section className="fg-section fg-coaches" id="coaches" aria-labelledby="coaches-title">
          <div className="fg-section-heading fg-section-heading-wide" data-reveal>
            <p className="fg-label">Trainer profiles</p>
            <h2 id="coaches-title">Real coaches for the days your motivation has no signal.</h2>
          </div>
          <div className="fg-trainer-grid">
            {trainers.map((trainer, index) => (
              <article
                className="fg-trainer-card"
                key={trainer.name}
                data-reveal
                style={{ "--reveal-delay": `${index * 70}ms` }}
              >
                <button
                  type="button"
                  className="fg-trainer-trigger"
                  aria-haspopup="dialog"
                  onClick={() => setSelectedTrainer(trainer)}
                >
                  <img src={trainer.image} alt={`${trainer.name}, ${trainer.role}`} />
                  <span className="fg-trainer-copy">
                    <span>{trainer.stat}</span>
                    <span className="fg-trainer-name">{trainer.name}</span>
                    <span className="fg-trainer-role">{trainer.role}</span>
                  </span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="fg-section fg-pricing" id="plans" aria-labelledby="plans-title">
          <div className="fg-pricing-head" data-reveal>
            <p className="fg-label">Subscription CTAs</p>
            <h2 id="plans-title">Commit to the version that keeps showing up.</h2>
          </div>
          <div className="fg-plan-grid">
            {plans.map((plan, index) => (
              <article
                className={`fg-plan ${plan.featured ? "is-featured" : ""}`}
                key={plan.name}
                data-reveal
                style={{ "--reveal-delay": `${index * 80}ms` }}
              >
                <span>{plan.name}</span>
                <strong>
                  {plan.price}
                  <small>/mo</small>
                </strong>
                <p>{plan.note}</p>
                <a href="#plans" className="fg-button fg-button-primary">
                  {plan.cta}
                  <Icon name="check" />
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="fg-footer">
        <p>PulseForge</p>
        <a href="#plans">Start training before Monday has an opinion</a>
      </footer>

      {selectedTrainer ? (
        <div
          className="fg-modal-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTrainer(null);
          }}
        >
          <section
            className="fg-trainer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trainer-modal-title"
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="fg-modal-close"
              aria-label={`Close ${selectedTrainer.name} profile`}
              onClick={() => setSelectedTrainer(null)}
            >
              <Icon name="close" />
            </button>
            <img
              src={selectedTrainer.image}
              alt={`${selectedTrainer.name}, ${selectedTrainer.role}`}
            />
            <div className="fg-modal-copy">
              <p className="fg-label">Coach profile</p>
              <h2 id="trainer-modal-title">{selectedTrainer.name}</h2>
              <p className="fg-modal-role">{selectedTrainer.role}</p>
              <p>{selectedTrainer.bio}</p>
              <div className="fg-coach-focus" aria-label={`${selectedTrainer.name} focus areas`}>
                {selectedTrainer.focus.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <a
                href="#plans"
                className="fg-button fg-button-primary"
                onClick={() => setSelectedTrainer(null)}
              >
                Book coach
                <Icon name="arrow" />
              </a>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
