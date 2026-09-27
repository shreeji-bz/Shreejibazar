import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search, HelpCircle, UserCircle, Share2, Heart, ChevronRight, ChevronLeft,
  MoreHorizontal, ShieldCheck, Smartphone, Flag, ExternalLink, Menu, X
} from "lucide-react";
import "./styles.css";

type RelatedApp = {
  name: string;
  developer: string;
  icon: string;
};

const screenshots = [
  "/assets/screenshot-1.png",
  "/assets/screenshot-2.png",
  "/assets/screenshot-3.png",
  "/assets/screenshot-4.png",
];

const relatedApps: RelatedApp[] = [
  { name: "Koshur Academy", developer: "Sachiva Web & Security", icon: "/assets/related-1.svg" },
  { name: "Namaste Shastri Ji", developer: "Sachiva Web & Security", icon: "/assets/related-2.svg" },
  { name: "ServeGo Provider", developer: "Sachiva Web & Security", icon: "/assets/related-3.svg" },
  { name: "ServeGo Service", developer: "Sachiva Web & Security", icon: "/assets/related-4.svg" },
  { name: "11Acre.ai", developer: "Sachiva Web & Security", icon: "/assets/related-5.svg" },
];

function App() {
  const [activeShot, setActiveShot] = useState(0);
  const [liked, setLiked] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const install = () => {
    setInstalled(true);
    notify("Installation started");
  };

  const share = async () => {
    const data = { title: "ServeGo", text: "ServeGo — Home Services", url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch {}
    } else {
      await navigator.clipboard?.writeText(window.location.href);
      notify("Link copied");
    }
  };

  const previous = () => setActiveShot((activeShot - 1 + screenshots.length) % screenshots.length);
  const next = () => setActiveShot((activeShot + 1) % screenshots.length);

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">MyStore</div>
          <nav className={`main-nav ${mobileMenu ? "open" : ""}`}>
            <a href="#">Games</a>
            <a className="active" href="#">Apps</a>
            <a href="#">Books</a>
            <a href="#">Kids</a>
          </nav>
          <div className="header-actions">
            <button aria-label="Search"><Search size={21}/></button>
            <button aria-label="Help"><HelpCircle size={20}/></button>
            <button className="avatar" aria-label="Account"><UserCircle size={25}/></button>
            <button className="menu-btn" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
              {mobileMenu ? <X size={23}/> : <Menu size={23}/>}
            </button>
          </div>
        </div>
      </header>

      <main className="content">
        <section className="hero">
          <div className="hero-copy">
            <h1>ServeGo</h1>
            <a className="developer" href="#">Sachiva Web &amp; Security</a>
            <div className="downloads"><strong>10+</strong><span>Downloads</span></div>
            <div className="hero-buttons">
              <button className={`install ${installed ? "installed" : ""}`} onClick={install}>
                {installed ? "Installed" : "Install"}
              </button>
              <button className="text-action" onClick={share}><Share2 size={19}/>Share</button>
              <button className={`text-action ${liked ? "liked" : ""}`} onClick={() => setLiked(!liked)}>
                <Heart size={19} fill={liked ? "currentColor" : "none"}/>
                {liked ? "Added to wishlist" : "Add to wishlist"}
              </button>
            </div>
            <div className="device-note"><Smartphone size={15}/> This app is available for your device</div>
          </div>
          <div className="hero-icon">
            <img src="/assets/app-icon.png" alt="ServeGo app icon"/>
          </div>
        </section>

        <section className="body-grid">
          <div className="main-column">
            <div className="gallery">
              <div className="gallery-window">
                <img src={screenshots[activeShot]} alt={`ServeGo screenshot ${activeShot + 1}`}/>
                <button className="gallery-arrow left" onClick={previous} aria-label="Previous"><ChevronLeft size={25}/></button>
                <button className="gallery-arrow right" onClick={next} aria-label="Next"><ChevronRight size={25}/></button>
              </div>
              <div className="thumbs">
                {screenshots.map((src, i) => (
                  <button key={src} className={`thumb ${i === activeShot ? "selected" : ""}`} onClick={() => setActiveShot(i)}>
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            </div>

            <section className="section about">
              <SectionTitle title="About this app" onClick={() => setAboutOpen(!aboutOpen)} />
              <p>
                ServeGo is your trusted platform for booking professional home services quickly and conveniently.
              </p>
              <p>
                Whether you need home cleaning, plumbing, electrical repairs, appliance servicing, beauty services,
                carpentry, painting, or other household solutions, ServeGo connects you with verified service
                professionals in your area.
              </p>
              {aboutOpen && (
                <div className="extra-copy">
                  <p>Browse services, compare providers, choose a convenient time and manage your service requests from one place.</p>
                  <ul>
                    <li>Verified service professionals</li>
                    <li>Convenient service discovery</li>
                    <li>Simple booking experience</li>
                    <li>Service history and updates</li>
                  </ul>
                </div>
              )}
              <div className="key-features">Key Features...</div>
              <div className="updated"><strong>Updated on</strong><span>Jul 30, 2026</span></div>
              <span className="category">House &amp; Home</span>
            </section>

            <section className="section">
              <SectionTitle title="Data safety" onClick={() => setSafetyOpen(!safetyOpen)} />
              <p>Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region, and age.</p>
              <div className="safety-card">
                <div className="safety-row">
                  <Share2 size={18}/>
                  <div><strong>No data shared with third parties</strong><span>Learn more about how developers declare data sharing</span></div>
                </div>
                <div className="safety-row">
                  <ShieldCheck size={18}/>
                  <div><strong>No data collected</strong><span>Learn more about how developers declare collection</span></div>
                </div>
                <button className="details" onClick={() => setSafetyOpen(!safetyOpen)}>
                  {safetyOpen ? "Hide details" : "See details"}
                </button>
                {safetyOpen && <div className="safety-details">This demo section is configurable from the application's data model.</div>}
              </div>
            </section>

            <section className="section whats-new">
              <h2>What's new</h2>
              <p>Initial production release.</p>
              <p>• Performance improvements<br/>• Bug fixes</p>
            </section>

            <button className="flag"><Flag size={15}/> Flag as inappropriate</button>
          </div>

          <aside className="sidebar">
            <div className="rating-card">
              <div className="rating-box">3+</div>
              <strong>Rated for 3+</strong>
              <span>Users interact</span>
              <a href="#">Learn more</a>
            </div>

            <div className="support">
              <button className="support-title" onClick={() => setSupportOpen(!supportOpen)}>
                <span>App support</span><ChevronRight className={supportOpen ? "rotate" : ""} size={18}/>
              </button>
              {supportOpen && (
                <div className="support-links">
                  <a href="mailto:support@example.com">Email support</a>
                  <a href="#">Website</a>
                  <a href="#">Privacy Policy</a>
                </div>
              )}
            </div>

            <div className="related">
              <div className="related-title"><strong>More by Sachiva Web &amp;<br/>Security</strong><ChevronRight size={18}/></div>
              {relatedApps.map(app => (
                <a className="related-app" href="#" key={app.name}>
                  <img src={app.icon} alt=""/>
                  <div><strong>{app.name}</strong><span>{app.developer}</span></div>
                </a>
              ))}
            </div>
          </aside>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-cols">
          <div><h4>Store</h4><a href="#">Home</a><a href="#">Apps</a><a href="#">Games</a><a href="#">Books</a><a href="#">Gift cards</a></div>
          <div><h4>Help</h4><a href="#">Help Center</a><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Developers</a></div>
        </div>
        <div className="footer-bottom">
          <div className="legal"><a href="#">Terms of Service</a><a href="#">Privacy</a><a href="#">About</a><a href="#">Developers</a><a href="#">Store</a><span>All prices include GST.</span></div>
          <div className="locale">🇮🇳 India (English)</div>
        </div>
      </footer>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function SectionTitle({title, onClick}: {title: string; onClick: () => void}) {
  return (
    <button className="section-title" onClick={onClick}>
      <h2>{title}</h2><ChevronRight size={20}/>
    </button>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
);
