import { useRef } from "react";
import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./AiChatbotPlatformPage.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const replies = [
  "Pull renewal risk from Intercom, Stripe, and the last call transcript.",
  "Draft a concise answer, cite the source system, and route pricing objections to RevOps.",
  "Close the loop with a customer-visible summary and an internal handoff note.",
];

const flowSteps = [
  {
    id: "01",
    label: "Listen",
    title: "Every channel becomes context.",
    copy: "Inbox, docs, CRM events, and product signals are normalized before the model speaks.",
  },
  {
    id: "02",
    label: "Reason",
    title: "Agents choose the next best action.",
    copy: "Guardrails, tools, and memory run in a visible chain so teams can trust the answer.",
  },
  {
    id: "03",
    label: "Resolve",
    title: "Handoffs land with receipts.",
    copy: "The platform writes summaries, opens tasks, and measures whether the customer got unstuck.",
  },
];

const useCases = [
  ["Support", "Deflect repetitive questions without hiding complex issues from your team."],
  ["Sales", "Qualify inbound chats and create CRM notes while reps stay in the conversation."],
  ["Success", "Spot churn signals and trigger playbooks from product usage and message tone."],
  ["Operations", "Turn messy internal requests into tracked actions with source citations."],
];

export function AiChatbotPlatformPage() {
  const page = useRef(null);
  const lenisRef = useRef(null);
  const shouldReduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function handleSectionLink(event) {
    const href = event.currentTarget.getAttribute("href");

    if (!href?.startsWith("#")) {
      return;
    }

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();

    if (shouldReduceMotion || !lenisRef.current?.lenis) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    } else {
      lenisRef.current.lenis.scrollTo(target, { duration: 1.15, offset: 0 });
    }

    window.history.replaceState(null, "", href);
  }

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function updateLenis(time) {
        lenisRef.current?.lenis?.raf(time * 1000);
      }

      lenisRef.current?.lenis?.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(updateLenis);
      gsap.ticker.lagSmoothing(0);

      if (reduceMotion) {
        gsap.set("[data-hero], [data-reveal], .ai-flow-step", { clearProps: "all" });
        return () => {
          gsap.ticker.remove(updateLenis);
        };
      }

      const mm = gsap.matchMedia();
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .from("[data-hero='nav']", { y: -18, autoAlpha: 0, duration: 0.55 })
        .from("[data-hero='copy']", { y: 34, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.12)
        .from("[data-hero='visual']", { y: 44, scale: 0.96, autoAlpha: 0, duration: 1 }, 0.28)
        .from(".ai-chat-line", { x: 20, autoAlpha: 0, duration: 0.5, stagger: 0.16 }, 0.62);

      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 82%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              el,
              { y: 34, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" }
            );
          },
        });
      });

      mm.add("(min-width: 681px)", () => {
        const flowTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".ai-flow",
            start: "top top",
            end: "+=150%",
            scrub: 0.7,
            pin: ".ai-flow-stage",
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        flowTimeline
          .from(".ai-flow-node", { scale: 0.72, autoAlpha: 0, stagger: 0.12, duration: 0.5 })
          .from(".ai-flow-line", { scaleX: 0, transformOrigin: "left", duration: 0.65 }, 0.18)
          .to(".ai-flow-track", { xPercent: -33.3333, duration: 0.9, ease: "power2.inOut" }, 0.75)
          .to(".ai-flow-track", { xPercent: -66.6666, duration: 0.9, ease: "power2.inOut" }, 1.7)
          .to(".ai-flow-node", { boxShadow: "0 0 36px rgba(94, 234, 212, 0.34)", stagger: 0.12, duration: 0.35 }, 0.85);
      });

      document.fonts?.ready?.then(() => ScrollTrigger.refresh());

      return () => {
        mm.revert();
        gsap.ticker.remove(updateLenis);
      };
    },
    { scope: page }
  );

  return (
    <ReactLenis root options={{ autoRaf: false, lerp: shouldReduceMotion ? 1 : 0.09 }} ref={lenisRef}>
      <div className="ai-page" ref={page}>
        <header className="ai-nav" data-hero="nav">
          <a className="ai-logo" href="/" aria-label="Return to project gallery">
            <span className="ai-logo-mark" aria-hidden="true" />
            Relay
          </a>
          <nav aria-label="Primary navigation">
            <a href="#workflow" onClick={handleSectionLink}>Workflow</a>
            <a href="#use-cases" onClick={handleSectionLink}>Use cases</a>
            <a href="#pricing" onClick={handleSectionLink}>Pricing</a>
          </nav>
          <a className="ai-nav-cta" href="#demo" onClick={handleSectionLink}>Book a demo</a>
        </header>

        <main>
          <section className="ai-hero" id="demo">
            <div className="ai-hero-copy">
              <p className="ai-kicker" data-hero="copy">AI support that shows its work</p>
              <h1 data-hero="copy">Chat automation for teams that cannot afford vague answers.</h1>
              <p className="ai-hero-lede" data-hero="copy">
                Relay turns customer conversations into resolved actions with cited context, routed
                handoffs, and model behavior your operators can actually inspect.
              </p>
              <div className="ai-hero-actions" data-hero="copy">
                <a className="ai-button ai-button-primary" href="#pricing" onClick={handleSectionLink}>Start free trial</a>
                <a className="ai-button ai-button-secondary" href="#workflow" onClick={handleSectionLink}>Watch the flow</a>
              </div>
              <dl className="ai-hero-metrics" data-hero="copy" aria-label="Product metrics">
                <div>
                  <dt>42%</dt>
                  <dd>fewer repeat tickets</dd>
                </div>
                <div>
                  <dt>11 min</dt>
                  <dd>median handoff saved</dd>
                </div>
                <div>
                  <dt>99.9%</dt>
                  <dd>audit trail uptime</dd>
                </div>
              </dl>
            </div>

            <div className="ai-hero-visual" data-hero="visual" aria-label="Relay product preview">
              <div className="ai-console">
                <div className="ai-console-top">
                  <span />
                  <span />
                  <span />
                  <strong>Live resolution</strong>
                </div>
                <div className="ai-prompt">
                  <span>Customer asks</span>
                  <p>Can I change plans without losing the seats already provisioned?</p>
                </div>
                <div className="ai-chat-stream" aria-label="Automated answer workflow">
                  {replies.map((reply) => (
                    <p className="ai-chat-line" key={reply}>{reply}</p>
                  ))}
                </div>
                <div className="ai-resolution">
                  <span className="ai-status-dot" />
                  Resolved with 4 cited sources
                </div>
              </div>
            </div>
          </section>

          <section className="ai-proof" aria-label="Customer logos" data-reveal>
            <span>Trusted by teams running high-volume conversations</span>
            <div>
              <strong>Northstar</strong>
              <strong>Plainframe</strong>
              <strong>Vaultline</strong>
              <strong>Metricly</strong>
            </div>
          </section>

          <section className="ai-flow" id="workflow">
            <div className="ai-flow-stage">
              <div className="ai-section-label">
                <span>Workflow</span>
                <p>One conversation, three accountable moves.</p>
              </div>
              <div className="ai-flow-map" aria-hidden="true">
                {flowSteps.map((step) => (
                  <span className="ai-flow-node" key={step.id}>{step.id}</span>
                ))}
                <span className="ai-flow-line" />
              </div>
              <div className="ai-flow-window">
                <div className="ai-flow-track">
                  {flowSteps.map((step) => (
                    <article className="ai-flow-card" key={step.id}>
                      <span>{step.label}</span>
                      <h2>{step.title}</h2>
                      <p>{step.copy}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="ai-use-cases" id="use-cases">
            <div className="ai-use-heading" data-reveal>
              <p className="ai-kicker">Built for the handoff moments</p>
              <h2>Minimal interface. Deep operational memory.</h2>
            </div>
            <div className="ai-use-grid">
              {useCases.map(([title, copy], index) => (
                <article className="ai-use-card" data-reveal key={title} style={{ "--delay": `${index * 70}ms` }}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="ai-trust" data-reveal>
            <div>
              <p className="ai-kicker">Trust controls</p>
              <h2>Operators can see what the model saw.</h2>
            </div>
            <ul>
              <li>Source citations on every generated answer</li>
              <li>PII redaction and retention controls by workspace</li>
              <li>Human approval gates for billing, legal, and churn risk</li>
            </ul>
          </section>

          <section className="ai-pricing" id="pricing" data-reveal>
            <div>
              <p className="ai-kicker">Launch plan</p>
              <h2>Start with one queue, then expand the agent graph.</h2>
            </div>
            <article>
              <span>Growth</span>
              <strong>$89</strong>
              <p>per operator seat, monthly</p>
              <a className="ai-button ai-button-primary" href="mailto:hello@example.com">Start free trial</a>
            </article>
          </section>
        </main>

        <footer className="ai-footer">
          <span>Relay</span>
          <a href="mailto:hello@example.com">hello@example.com</a>
        </footer>
      </div>
    </ReactLenis>
  );
}
