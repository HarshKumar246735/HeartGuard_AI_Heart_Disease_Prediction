import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, FileText, HeartPulse, History, LayoutDashboard, Lightbulb, LockKeyhole, ShieldCheck, Sparkles, Timer, UserPlus } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import Disclaimer from '../components/Disclaimer';
import useDocumentTitle from '../hooks/useDocumentTitle';
import '../css/landing.css';

const TRUST = [
  { icon: ClipboardList, title: 'Simple assessment', text: 'Eight health values, grouped into short sections.' },
  { icon: LockKeyhole, title: 'Secure data', text: 'Password-protected account with private history.' },
  { icon: Sparkles, title: 'AI-assisted prediction', text: 'A transparent logistic regression model.' },
  { icon: History, title: 'Personal history', text: 'Every assessment saved so you can compare over time.' },
];
const STEPS = [
  { icon: UserPlus, title: 'Create account', text: 'Sign up with your email in under a minute.' },
  { icon: ClipboardList, title: 'Enter health information', text: 'Add values from a recent check-up or blood test.' },
  { icon: HeartPulse, title: 'Get risk estimate', text: 'See an educational estimate with the factors behind it.' },
  { icon: BarChart3, title: 'Track your history', text: 'Review past results and download PDF reports.' },
];
const FEATURES = [
  { icon: HeartPulse, title: 'Risk prediction', text: 'A probability-based estimate shown as Low, Moderate or Higher.' },
  { icon: LayoutDashboard, title: 'Personal dashboard', text: 'Charts that show your risk mix and how it moves over time.' },
  { icon: History, title: 'Assessment history', text: 'Filter, search and sort every assessment you have saved.' },
  { icon: FileText, title: 'PDF reports', text: 'Download a clean report to keep or share with your clinician.' },
  { icon: Lightbulb, title: 'Health insights', text: 'Plain-language notes on blood pressure, cholesterol and more.' },
  { icon: ShieldCheck, title: 'Secure account', text: 'Hashed passwords, token-based sessions and private records.' },
];
const WHY = [
  ['Easy to use', 'Clear labels, units and "why do we ask this?" help on every field.'],
  ['Fast assessment', 'Most people finish in about two minutes.'],
  ['Personal history', 'Compare estimates over time instead of a single snapshot.'],
  ['Simple results', 'A clear level, a percentage and the factors worth noticing.'],
  ['Educational insights', 'General guidance, never prescriptions or diagnoses.'],
];

function EcgLine() {
  return (
    <svg className="ecg" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 40 H70 L85 40 L95 12 L110 62 L122 26 L132 40 H215 L228 40 L238 18 L252 58 L262 32 L270 40 H400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Landing() {
  useDocumentTitle('');
  return (
    <div className="landing">
      <a href="#home" className="skip-link">Skip to content</a>
      <PublicNavbar />
      <main>
        <section id="home" className="hero">
          <div className="hero-bg" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="hero-tag"><HeartPulse size={16} aria-hidden="true" /> Educational heart-risk estimate</p>
              <h1>Understand Your Heart Risk Before It Becomes a Concern.</h1>
              <p className="hero-sub">Use a simple health assessment to receive an educational heart-risk estimate powered by machine learning.</p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-lg">Start Assessment <ArrowRight size={18} aria-hidden="true" /></Link>
                <a href="#how-it-works" className="btn btn-secondary btn-lg">Learn How It Works</a>
              </div>
              <ul className="hero-points">
                <li><CheckCircle2 size={18} aria-hidden="true" /> Free to use</li>
                <li><CheckCircle2 size={18} aria-hidden="true" /> About two minutes</li>
                <li><CheckCircle2 size={18} aria-hidden="true" /> Not a diagnosis</li>
              </ul>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="mock-card">
                <div className="mock-head">
                  <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
                  <small>Illustration of a result card</small>
                </div>
                <p className="mock-kicker">Your heart risk estimate</p>
                <p className="mock-level">Moderate Estimated Risk</p>
                <div className="mock-meter"><span /><span /><span /><i /></div>
                <div className="mock-scale"><span>Low</span><span>Moderate</span><span>Higher</span></div>
                <div className="mock-ecg"><EcgLine /></div>
                <div className="mock-rows">
                  <div><span>Blood pressure</span><b>mmHg</b></div>
                  <div><span>Cholesterol</span><b>mg/dL</b></div>
                  <div><span>Max heart rate</span><b>bpm</b></div>
                </div>
              </div>
              <div className="float-chip chip-a"><ShieldCheck size={16} /> Private history</div>
              <div className="float-chip chip-b"><Timer size={16} /> ~2 min</div>
            </div>
          </div>
        </section>

        <section className="section trust" aria-label="Highlights">
          <div className="container trust-grid">
            {TRUST.map(({ icon: Icon, title, text }) => (
              <div className="trust-item" key={title}>
                <span className="trust-icon"><Icon size={22} aria-hidden="true" /></span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="section">
          <div className="container">
            <div className="section-head"><h2>How it works</h2><p>Four steps from sign-up to a saved, shareable report.</p></div>
            <ol className="steps">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li className="card step" key={title}>
                  <span className="step-num">{i + 1}</span>
                  <span className="step-icon"><Icon size={22} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="section section-alt">
          <div className="container">
            <div className="section-head"><h2>Everything you need to keep track</h2><p>A focused toolkit for understanding and revisiting your estimates.</p></div>
            <div className="feature-grid">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <article className="card card-hover feature" key={title}>
                  <span className="stat-icon"><Icon size={22} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container why">
            <div className="why-intro">
              <h2>Why HeartGuard AI</h2>
              <p>HeartGuard AI is a portfolio-grade full-stack product built around a deliberately simple model. It turns a handful of familiar health numbers into a clear, educational estimate, and keeps the history so you can see the bigger picture.</p>
            </div>
            <ul className="why-list">
              {WHY.map(([t, d]) => (<li key={t}><CheckCircle2 size={20} aria-hidden="true" /><div><h3>{t}</h3><p>{d}</p></div></li>))}
            </ul>
          </div>
        </section>

        <section id="disclaimer" className="section section-tight">
          <div className="container"><Disclaimer /></div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta">
              <h2>Ready to understand your heart risk?</h2>
              <p>Create a free account and complete your first assessment in about two minutes.</p>
              <Link to="/register" className="btn btn-lg cta-btn">Start Your Assessment <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
