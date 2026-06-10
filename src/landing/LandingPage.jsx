import { Link } from "react-router-dom";
import { projects } from "../projects/projects.js";
import styles from "./LandingPage.module.css";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.arrowIcon}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

function ProjectCard({ project, index }) {
  return (
    <Link
      className={styles.projectCard}
      to={project.path}
      style={{ "--card-index": index }}
    >
      <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
      <span className={styles.plate} aria-hidden="true" />
      <span className={styles.cardBody}>
        <span className={styles.cardLabel}>{project.label}</span>
        <span className={styles.cardTitle}>{project.title}</span>
        <span className={styles.cardTone}>{project.tone}</span>
      </span>
      <span className={styles.cardAction} aria-label={`Open ${project.title}`}>
        <ArrowIcon />
      </span>
    </Link>
  );
}

export function LandingPage() {
  const marqueeItems = ["Demos", "Strategy", "Interfaces", "Motion", "Launches"];

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="page-title">
        <nav className={styles.nav} aria-label="Studio">
          <Link className={styles.brand} to="/">
            MAX/MINI
          </Link>
          <span className={styles.navMeta}>Creative agency demos</span>
        </nav>

        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Portfolio switchboard / 09 prototypes</p>
            <h1 id="page-title" className={styles.title}>
              Pick a world. Watch the studio change costume.
            </h1>
          </div>

          <div className={styles.heroPanel} aria-label="Studio notes">
            <span>Micro-Maximal landing index</span>
            <strong>Each route is sandboxed for a future bespoke demo.</strong>
            <p>
              The image plates are intentionally blank until the individual demo
              designs exist.
            </p>
          </div>
        </div>

        <div className={styles.projectGrid} aria-label="Demo projects">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
