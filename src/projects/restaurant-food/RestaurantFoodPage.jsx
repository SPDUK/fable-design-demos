import { useEffect, useMemo, useRef, useState } from "react";
import "./RestaurantFoodPage.css";
import heroImage from "./assets/maison-oree-hero.png";
import menuImage from "./assets/maison-oree-menu.png";
import chefImage from "./assets/maison-oree-chef.png";

const courses = [
  {
    numeral: "I",
    title: "Diver scallop, saffron, ruby citrus",
    note: "Torch-seared scallop with beurre blanc, caviar, and garden flowers.",
    price: "32",
  },
  {
    numeral: "II",
    title: "Agnolotti, truffle, chanterelle",
    note: "Hand-cut pasta folded around aged ricotta with hazelnut and herb oil.",
    price: "38",
  },
  {
    numeral: "III",
    title: "Dry-aged duck, cherry, black cardamom",
    note: "Crown-roasted over vine cuttings, finished tableside with jus.",
    price: "54",
  },
  {
    numeral: "IV",
    title: "Chocolate, smoked salt, preserved fig",
    note: "A quiet final course with Armagnac cream and feuille de brick.",
    price: "24",
  },
];

const timeSlots = ["17:30", "18:15", "19:00", "20:30", "21:15"];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="rf-icon">
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="rf-icon">
      <path d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11Z" />
      <path d="M12 10.5h.01" />
    </svg>
  );
}

export function RestaurantFoodPage() {
  const pageRef = useRef(null);
  const [activeCourse, setActiveCourse] = useState(0);
  const [booking, setBooking] = useState({
    date: "2026-06-18",
    time: "19:00",
    party: "2",
    room: "Salon Noir",
    name: "",
    email: "",
  });
  const [status, setStatus] = useState("idle");

  const bookingSummary = useMemo(() => {
    const party = Number(booking.party) === 1 ? "1 guest" : `${booking.party} guests`;
    return `${party} on ${booking.date} at ${booking.time} in ${booking.room}`;
  }, [booking]);

  useEffect(() => {
    document.title = "Maison Oree | Candlelit Fine Dining";
    const page = pageRef.current;
    if (!page) return undefined;

    document.documentElement.classList.add("rf-js");
    const revealItems = [...page.querySelectorAll("[data-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -10% 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));
    requestAnimationFrame(() => page.classList.add("is-loaded"));

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;

    const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
    const revealVisibleItems = () => {
      page.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.06) {
          item.classList.add("is-visible");
        }
      });
    };
    const scrollToHash = (hash = window.location.hash, behavior = prefersReduced ? "auto" : "smooth") => {
      const id = hash.replace("#", "");
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      const offset = id === "top" ? 0 : 94;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior });
      window.setTimeout(revealVisibleItems, behavior === "auto" ? 0 : 420);
    };

    const onAnchorClick = (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || !page.contains(link)) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", hash);
      scrollToHash(hash);
    };
    const onHashChange = () => scrollToHash(window.location.hash);

    const updateScroll = () => {
      ticking = false;
      const vh = window.innerHeight || 1;
      const maxScroll = document.documentElement.scrollHeight - vh || 1;
      page.style.setProperty("--page-p", (window.scrollY / maxScroll).toFixed(4));

      const hero = page.querySelector(".rf-hero");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        page.style.setProperty("--hero-y", `${clamp(-rect.top / vh, 0, 1) * 42}px`);
      }

      const ledger = page.querySelector(".rf-menu");
      if (ledger) {
        const rect = ledger.getBoundingClientRect();
        const progress = clamp(-rect.top / Math.max(rect.height - vh, 1));
        page.style.setProperty("--ledger-p", progress.toFixed(4));
        setActiveCourse(Math.min(courses.length - 1, Math.floor(progress * courses.length)));
      }
      revealVisibleItems();
    };

    const onScroll = () => {
      if (!ticking && !prefersReduced) {
        ticking = true;
        requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    if (window.location.hash) {
      window.setTimeout(() => scrollToHash(window.location.hash, "auto"), 0);
    }
    page.addEventListener("click", onAnchorClick);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });

    return () => {
      observer.disconnect();
      page.removeEventListener("click", onAnchorClick);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScroll);
      document.documentElement.classList.remove("rf-js");
    };
  }, []);

  const updateBooking = (event) => {
    const { name, value } = event.target;
    setBooking((current) => ({ ...current, [name]: value }));
    setStatus("idle");
  };

  const submitBooking = (event) => {
    event.preventDefault();
    setStatus("sent");
  };

  return (
    <div className="rf-page" ref={pageRef}>
      <div className="rf-scroll-meter" aria-hidden="true" />

      <header className="rf-nav" aria-label="Primary">
        <a className="rf-mark" href="#top" aria-label="Maison Oree home">
          <span>MO</span>
          <strong>Maison Oree</strong>
        </a>
        <nav>
          <a href="#menu">Menu</a>
          <a href="#chef">Chef</a>
          <a href="#visit">Visit</a>
        </nav>
        <a className="rf-nav-cta" href="#reserve">
          Reserve
          <ArrowIcon />
        </a>
      </header>

      <main id="top">
        <section className="rf-hero" aria-labelledby="hero-title">
          <img className="rf-hero__image" src={heroImage} alt="" />
          <div className="rf-hero__scrim" aria-hidden="true" />
          <div className="rf-hero__content">
            <p className="rf-label rf-hero__label">A private tasting room above Mayfair</p>
            <h1 id="hero-title" aria-label="Maison Oree" className="rf-hero__title">
              <span><span>Maison</span></span>
              <span><span>Oree</span></span>
            </h1>
            <div className="rf-hero__lower">
              <p>
                Candlelit French technique, British seasonality, and a cellar built for long
                evenings. Twelve tables. One room. Service from dusk.
              </p>
              <div className="rf-hero__actions">
                <a className="rf-button rf-button--primary" href="#reserve">
                  Book a table
                  <ArrowIcon />
                </a>
                <a className="rf-button rf-button--ghost" href="#menu">
                  Preview menu
                </a>
              </div>
            </div>
          </div>
          <div className="rf-essentials" data-reveal>
            <span>Tue-Sat</span>
            <strong>17:30-23:30</strong>
            <span>14 Shepherd Market, London</span>
            <a href="tel:+442079460184">+44 20 7946 0184</a>
          </div>
          <div className="rf-scroll-cue" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </div>
        </section>

        <section className="rf-intro" aria-labelledby="intro-title">
          <div className="rf-container rf-intro__grid">
            <p className="rf-label" data-reveal>
              Service note
            </p>
            <h2 id="intro-title" data-reveal>
              Dinner moves like a score: quiet entrances, vivid crescendos, and no wasted gesture.
            </h2>
            <div className="rf-intro__copy" data-reveal>
              <p>
                Each evening begins with shellfish and citrus at the counter, passes through
                hand-folded pasta and ember-roasted cuts, then closes with a final glass chosen
                from the north wall cellar.
              </p>
              <div className="rf-statline" aria-label="Restaurant highlights">
                <span><strong>12</strong> tables</span>
                <span><strong>06</strong> courses</span>
                <span><strong>420</strong> cellar labels</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rf-menu" id="menu" aria-labelledby="menu-title">
          <div className="rf-container rf-menu__layout">
            <div className="rf-menu__sticky" data-reveal>
              <p className="rf-label">Menu preview</p>
              <h2 id="menu-title">The evening ledger</h2>
              <p>
                A sample of the current tasting sequence. The kitchen rewrites it each market
                morning around fish landings, game, and orchard fruit.
              </p>
              <div className="rf-ledger-meter" aria-hidden="true">
                <span />
              </div>
            </div>

            <div className="rf-menu__courses" aria-label="Featured courses">
              {courses.map((course, index) => (
                <article
                  className={`rf-course ${activeCourse === index ? "is-active" : ""}`}
                  key={course.title}
                  data-reveal
                  style={{ "--reveal-delay": `${index * 80}ms` }}
                >
                  <span className="rf-course__num">{course.numeral}</span>
                  <div>
                    <h3>{course.title}</h3>
                    <p>{course.note}</p>
                  </div>
                  <span className="rf-course__price">GBP {course.price}</span>
                </article>
              ))}
              <figure className="rf-menu-photo" data-reveal>
                <img src={menuImage} alt="Agnolotti with truffle, herbs, and hazelnut on a black table" />
                <figcaption>
                  Current pasta course: agnolotti folded at 16:00, finished to order.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="rf-reserve" id="reserve" aria-labelledby="reserve-title">
          <div className="rf-container rf-reserve__grid">
            <div className="rf-reserve__copy" data-reveal>
              <p className="rf-label">Reservations</p>
              <h2 id="reserve-title">Hold the room before the candles are lit.</h2>
              <p>
                Online requests are confirmed by the host desk within the hour. For private cellar
                dinners, choose the Cabinet Prive and we will send a pairing proposal.
              </p>
              <div className="rf-reserve__summary" aria-live="polite">
                <span>Your table</span>
                <strong>{bookingSummary}</strong>
              </div>
            </div>

            <form className="rf-booking" onSubmit={submitBooking} data-reveal>
              <label>
                Date
                <input name="date" type="date" value={booking.date} onChange={updateBooking} />
              </label>
              <label>
                Time
                <select name="time" value={booking.time} onChange={updateBooking}>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Guests
                <input
                  name="party"
                  type="number"
                  min="1"
                  max="8"
                  value={booking.party}
                  onChange={updateBooking}
                />
              </label>
              <label>
                Room
                <select name="room" value={booking.room} onChange={updateBooking}>
                  <option>Salon Noir</option>
                  <option>Chef's Counter</option>
                  <option>Cabinet Prive</option>
                </select>
              </label>
              <label className="rf-booking__wide">
                Name
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="A. Laurent"
                  value={booking.name}
                  onChange={updateBooking}
                />
              </label>
              <label className="rf-booking__wide">
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={booking.email}
                  onChange={updateBooking}
                />
              </label>
              <button className="rf-button rf-button--primary rf-booking__wide" type="submit">
                Request reservation
                <ArrowIcon />
              </button>
              {status === "sent" ? (
                <p className="rf-booking__status" role="status">
                  Request held. The host desk will confirm {bookingSummary.toLowerCase()}.
                </p>
              ) : (
                <p className="rf-booking__status">
                  Jacket optional. Champagne by the glass from 17:30.
                </p>
              )}
            </form>
          </div>
        </section>

        <section className="rf-chef" id="chef" aria-labelledby="chef-title">
          <div className="rf-container rf-chef__grid">
            <figure className="rf-chef__image" data-reveal>
              <img src={chefImage} alt="Chef Adrien Vale at the marble pass in a candlelit kitchen" />
            </figure>
            <div className="rf-chef__story" data-reveal>
              <p className="rf-label">Chef story</p>
              <h2 id="chef-title">Adrien Vale cooks with the patience of a watchmaker.</h2>
              <p>
                Raised between Lyon and Kent, Adrien built Maison Oree around the small rituals
                that make service feel personal: sauce finished in copper, herbs cut to order,
                and a handwritten note for every returning guest.
              </p>
              <blockquote>
                "Luxury is not abundance. It is knowing exactly when to stop."
              </blockquote>
              <a className="rf-text-link" href="#reserve">
                Ask for the chef's counter
                <ArrowIcon />
              </a>
            </div>
          </div>
        </section>

        <section className="rf-visit" id="visit" aria-labelledby="visit-title">
          <div className="rf-container rf-visit__grid">
            <div className="rf-visit__copy" data-reveal>
              <p className="rf-label">Location</p>
              <h2 id="visit-title">Hidden in Shepherd Market, two minutes from Green Park.</h2>
              <p>
                The entrance is beneath the brass lantern on Hertford Street. Valet is available
                after 18:00; the cellar bar opens early for confirmed reservations.
              </p>
              <div className="rf-contact-list">
                <a href="https://maps.google.com/?q=14+Shepherd+Market+London" target="_blank" rel="noreferrer">
                  <PinIcon />
                  Open directions
                </a>
                <a href="mailto:reservations@maisonoree.example">reservations@maisonoree.example</a>
              </div>
            </div>
            <div className="rf-map" aria-label="Stylized map showing Maison Oree near Shepherd Market" data-reveal>
              <span className="rf-map__street rf-map__street--one" />
              <span className="rf-map__street rf-map__street--two" />
              <span className="rf-map__street rf-map__street--three" />
              <span className="rf-map__block rf-map__block--one" />
              <span className="rf-map__block rf-map__block--two" />
              <span className="rf-map__block rf-map__block--three" />
              <span className="rf-map__pin">
                <PinIcon />
                Maison Oree
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="rf-footer">
        <div className="rf-container rf-footer__grid">
          <div>
            <span className="rf-footer__mark">Maison Oree</span>
            <p>Fine dining, private cellar dinners, and late service in Mayfair.</p>
          </div>
          <a className="rf-button rf-button--ghost" href="#reserve">
            Reserve tonight
          </a>
        </div>
      </footer>
    </div>
  );
}
