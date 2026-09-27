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
          <a href="/store/games" aria-label="Google Play logo" className="f0UV3d"><svg className="kOqhQd" aria-hidden="true" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h40v40H0V0z"></path><g><path d="M19.7,19.2L4.3,35.3c0,0,0,0,0,0c0.5,1.7,2.1,3,4,3c0.8,0,1.5-0.2,2.1-0.6l0,0l17.4-9.9L19.7,19.2z" fill="#EA4335"></path><path d="M35.3,16.4L35.3,16.4l-7.5-4.3l-8.4,7.4l8.5,8.3l7.5-4.2c1.3-0.7,2.2-2.1,2.2-3.6C37.5,18.5,36.6,17.1,35.3,16.4z" fill="#FBBC04"></path><path d="M4.3,4.7C4.2,5,4.2,5.4,4.2,5.8v28.5c0,0.4,0,0.7,0.1,1.1l16-15.7L4.3,4.7z" fill="#4285F4"></path><path d="M19.8,20l8-7.9L10.5,2.3C9.9,1.9,9.1,1.7,8.3,1.7c-1.9,0-3.6,1.3-4,3c0,0,0,0,0,0L19.8,20z" fill="#34A853"></path></g></svg><span aria-hidden="true">google_logo Play</span></a>
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
