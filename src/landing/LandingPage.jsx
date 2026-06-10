import { useEffect, useRef, useState } from "react";
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

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.smallIcon}>
      <rect x="9" y="9" width="10" height="10" rx="1" />
      <path d="M5 15V5h10" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.smallIcon}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function ProjectCard({ project, index, onShowPrompt }) {
  return (
    <article
      className={styles.projectCard}
      style={{ "--card-index": index }}
    >
      <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
      <span className={styles.plate} aria-hidden="true" />
      <span className={styles.cardBody}>
        <span className={styles.cardLabel}>{project.label}</span>
        <span className={styles.cardTitle}>{project.title}</span>
        <span className={styles.cardTone}>{project.tone}</span>
      </span>
      <span className={styles.cardActions}>
        <button
          className={styles.promptButton}
          type="button"
          onClick={() => onShowPrompt(project)}
        >
          Show prompt
        </button>
        <Link className={styles.cardAction} to={project.path} aria-label={`Open ${project.title}`}>
          <ArrowIcon />
        </Link>
      </span>
    </article>
  );
}

function PromptModal({ project, onClose }) {
  const [copyState, setCopyState] = useState("Copy prompt");
  const closeButtonRef = useRef(null);
  const promptTextRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(project.prompt);
      setCopyState("Copied");
    } catch {
      promptTextRef.current?.select();
      const copied = document.execCommand("copy");
      setCopyState(copied ? "Copied" : "Selected");
    }
  }

  return (
    <div className={styles.modalLayer} role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="prompt-modal-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalKicker}>Prompt sheet</span>
            <h2 id="prompt-modal-title" className={styles.modalTitle}>
              {project.title}
            </h2>
          </div>
          <button
            aria-label="Close prompt"
            className={styles.closeButton}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <textarea
          className={styles.promptText}
          readOnly
          ref={promptTextRef}
          value={project.prompt}
          aria-label={`${project.title} prompt`}
        />

        <div className={styles.modalFooter}>
          <button className={styles.copyButton} onClick={copyPrompt} type="button">
            <CopyIcon />
            <span>{copyState}</span>
          </button>
          <button className={styles.secondaryCloseButton} onClick={onClose} type="button">
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

export function LandingPage() {
  const [selectedProject, setSelectedProject] = useState(null);
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
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onShowPrompt={setSelectedProject}
            />
          ))}
        </div>
      </section>
      {selectedProject ? (
        <PromptModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      ) : null}
    </main>
  );
}
