import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./HomePage.css";

function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();

        let value = 0;
        const step = Math.ceil(target / 60);

        const timer = setInterval(() => {
          value += step;
          if (value >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(value);
          }
        }, 18);
      },
      { threshold: 0.4 }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const SERVICES = [
  {
    icon: "👥",
    title: "Suivi des patients",
    desc: "Consultation des informations du patient, de ses visites et du statut de prise en charge en temps réel."
  },
  {
    icon: "📅",
    title: "Gestion du personnel",
    desc: "Attribution des missions, suivi des tournées et accès rapide aux patients pour chaque soignant."
  },
  {
    icon: "🎯",
    title: "Coordination intelligente",
    desc: "Planification, reprogrammation, rapports de visite et suivi global depuis un seul espace unifié."
  }
];

const POINTS = [
  "Interface simple et professionnelle",
  "Suivi des visites en temps réel",
  "Gestion claire des rôles et des accès",
  "Organisation fluide pour tous les acteurs"
];

const CONTACTS = [
  { icon: "☎️", title: "Téléphone", info: "+212 6 00 00 00 00" },
  { icon: "✉️", title: "Email", info: "contact@medihome.ma" },
  { icon: "📍", title: "Adresse", info: "Marrakech, Maroc" }
];

function HomePage() {
  return (
    <div className="mh-root">
      <nav className="mh-nav">
        <Link to="/" className="mh-nav-brand">
          <div className="mh-nav-brand-icon">⚕️</div>
          MediHome
        </Link>

        <ul className="mh-nav-links">
          <li><a href="#services" className="mh-nav-link">Services</a></li>
          <li><a href="#why" className="mh-nav-link">Pourquoi nous</a></li>
          <li><a href="#contact" className="mh-nav-link">Contact</a></li>
        </ul>

        <div className="mh-nav-actions">
          <Link to="/auth" className="mh-btn mh-btn-secondary">Connexion</Link>
          <Link to="/auth" className="mh-btn mh-btn-primary">S'inscrire →</Link>
        </div>
      </nav>

      <section className="mh-hero">
        <div className="mh-hero-content">
          <div className="mh-hero-left">
            <div className="mh-badge">
              <span className="mh-badge-dot"></span>
              <span>Plateforme de soins à domicile</span>
            </div>

            <h1 className="mh-f-syne">
              Des soins à domicile, <em>coordonnés</em> avec précision
            </h1>

            <p>
              MediHome connecte patients, soignants et administrateurs dans une
              interface fluide, humaine et moderne.
            </p>

            <div className="mh-hero-cta">
              <Link to="/auth" className="mh-btn mh-btn-primary">
                Commencer gratuitement →
              </Link>
              <Link to="/auth" className="mh-btn mh-btn-secondary">
                Voir une démo
              </Link>
            </div>
          </div>

          <div className="mh-hero-right">
            <div className="mh-floating-card">
              <div className="mh-floating-card-icon">👨‍⚕️</div>
              <div className="mh-floating-card-content">
                <strong>Visite en cours</strong>
                <small>Dr. Benali · Casablanca</small>
              </div>
            </div>

            <div className="mh-hero-image">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80"
                alt="Visite médicale à domicile"
              />
              <div className="mh-hero-overlay">
                <div className="mh-hero-stat">
                  <strong>98%</strong>
                  <small>Satisfaction</small>
                </div>
                <div className="mh-hero-stat">
                  <strong>2500+</strong>
                  <small>Visites planifiées</small>
                </div>
                <div className="mh-hero-stat">
                  <strong>120+</strong>
                  <small>Soignants actifs</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mh-stats" id="stats-section">
        <div className="mh-stats-grid">
          <div className="mh-stat-item">
            <div className="mh-stat-number">
              <Counter target={2500} suffix="+" />
            </div>
            <div className="mh-stat-label">Visites réalisées</div>
          </div>

          <div className="mh-stat-item">
            <div className="mh-stat-number">
              <Counter target={120} suffix="+" />
            </div>
            <div className="mh-stat-label">Soignants certifiés</div>
          </div>

          <div className="mh-stat-item">
            <div className="mh-stat-number">
              <Counter target={98} suffix="%" />
            </div>
            <div className="mh-stat-label">Taux de satisfaction</div>
          </div>

          <div className="mh-stat-item">
            <div className="mh-stat-number">
              <Counter target={5} />
            </div>
            <div className="mh-stat-label">Villes couvertes</div>
          </div>
        </div>
      </section>

      <section className="mh-section" id="services">
        <div className="mh-section-header">
          <span className="mh-section-tag">Nos services</span>
          <h2 className="mh-section-title mh-f-syne">Une plateforme tout-en-un</h2>
          <p className="mh-section-desc">
            Pensée pour améliorer l'organisation des soins à domicile.
          </p>
        </div>

        <div className="mh-services-grid">
          {SERVICES.map((service) => (
            <div className="mh-service-card" key={service.title}>
              <div className="mh-service-icon">{service.icon}</div>
              <h3 className="mh-service-title mh-f-syne">{service.title}</h3>
              <p className="mh-service-desc">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mh-why-section" id="why">
        <div className="mh-why-content">
          <div className="mh-why-image">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80"
              alt="Équipe médicale"
            />
            <div className="mh-why-badge">
              <div className="mh-why-badge-num">98%</div>
              <div className="mh-why-badge-text">Satisfaction globale</div>
            </div>
          </div>

          <div className="mh-why-text">
            <span className="mh-section-tag">Pourquoi nous</span>
            <h2 className="mh-section-title mh-f-syne">Pourquoi choisir MediHome ?</h2>
            <p className="mh-section-desc">
              Notre solution simplifie les visites médicales à domicile grâce à une
              organisation claire, un suivi précis et une communication fluide entre
              tous les acteurs de santé.
            </p>

            <div className="mh-why-benefits">
              {POINTS.map((point) => (
                <div className="mh-benefit-item" key={point}>
                  <div className="mh-benefit-check">✓</div>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mh-section" id="contact">
        <div className="mh-section-header">
          <span className="mh-section-tag">Contact</span>
          <h2 className="mh-section-title mh-f-syne">Nous sommes disponibles</h2>
          <p className="mh-section-desc">
            Pour toute information complémentaire, n'hésitez pas à nous contacter.
          </p>
        </div>

        <div className="mh-contacts-grid">
          {CONTACTS.map((contact) => (
            <div className="mh-contact-card" key={contact.title}>
              <div className="mh-contact-icon">{contact.icon}</div>
              <h3 className="mh-contact-title mh-f-syne">{contact.title}</h3>
              <p className="mh-contact-info">{contact.info}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mh-cta-banner">
        <h2 className="mh-f-syne">Prêt à moderniser vos soins ?</h2>
        <p>
          Rejoignez des centaines de professionnels de santé qui font confiance à MediHome.
        </p>
        <div className="mh-cta-actions">
          <Link to="/auth" className="mh-btn mh-btn-primary">
            Démarrer gratuitement →
          </Link>
          <Link to="/auth" className="mh-btn mh-btn-secondary">
            Nous contacter
          </Link>
        </div>
      </section>

      <footer className="mh-footer">
        <Link to="/" className="mh-footer-brand">
          <div className="mh-footer-dot"></div>
          MediHome
        </Link>

        <span className="mh-footer-text">© 2025 MediHome. Tous droits réservés.</span>
        <span className="mh-footer-text">Marrakech, Maroc</span>
      </footer>
    </div>
  );
}

export default HomePage;