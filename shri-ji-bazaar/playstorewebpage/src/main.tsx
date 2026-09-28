import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search, HelpCircle, UserCircle, Share2, Heart, ChevronRight, ChevronLeft,
  MoreHorizontal, ShieldCheck, Smartphone, Flag, ExternalLink, Menu, X
} from "lucide-react";
import "./styles.css";


const screenshots = [
  "/assets/screenshot-1.webp",
  "/assets/screenshot-2.webp",
  "/assets/screenshot-3.webp",
  "/assets/screenshot-4.webp",
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
    const data = { title: "Shree Ji Bazar", text: "Shree Ji Bazar — Home Services", url: "https://playstore.shreejibazar.com/" };
    if (navigator.share) {
      try { await navigator.share(data); } catch {}
    } else {
      await navigator.clipboard?.writeText("https://playstore.shreejibazar.com/");
      notify("Link copied");
    }
  };

  const previous = () => setActiveShot((activeShot - 1 + screenshots.length) % screenshots.length);
  const next = () => setActiveShot((activeShot + 1) % screenshots.length);

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <a href="/store/games" aria-label="Google Play" className="f0UV3d" style={{display:'inline-flex',alignItems:'center',gap:6,textDecoration:'none'}}><svg viewBox="0 0 512 512" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M48 32C30.9 32 16 46.9 16 64v384c0 17.1 14.9 32 32 32h32c17.1 0 32-14.9 32-32V64c0-17.1-14.9-32-32-32H48zm162.7 107.7l-3.6 3.6L113.4 256l93.7 112.7 3.6-3.6L117.2 256l93.5-116.3zM233.4 260.9L317 360.7l-3.6 3.6-81.7-97.4 1.7-6zm-2.3 19.2L217.7 344l-3.6-3.6 16-64.6 1.3-5.3zm-8.7-11.4L199 296.4l3.5 3.6-45.5-90.5 1.3-5.2zM416 128v256c0 17.1 14.9 32 32 32h32c17.1 0 32-14.9 32-32V128c0-17.1-14.9-32-32-32h-32c-17.1 0-32 14.9-32 32zm-32 0v256h32V128h-32z" fill="#01875f"/><path d="M48 416h224V96H48v320zm64-160l64 48v-96l-64 48z" fill="#4285F4"/><path d="M312 128v256l119-128-119-128z" fill="#EA4335"/></svg></a>
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
            <h1>Shree Ji Bazar</h1>
            <a className="developer" href="#">Shree Ji Bazar</a>
            <div className="downloads"><strong>100+</strong><span>Downloads</span></div>
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
            <img src="/assets/app-icon.webp" alt="Shree Ji Bazar app icon"/>
          </div>
        </section>

        <section className="body-grid">
          <div className="main-column">
            <div className="gallery">
              <div className="gallery-window">
                <img src={screenshots[activeShot]} alt={`Shree Ji Bazar screenshot ${activeShot + 1}`}/>
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
                Shree Ji Bazar is your trusted platform for booking professional home services quickly and conveniently.
              </p>
              <p>
                Whether you need home cleaning, plumbing, electrical repairs, appliance servicing, beauty services,
                carpentry, painting, or other household solutions, Shree Ji Bazar connects you with verified service
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
