import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import Disclaimer from '../components/Disclaimer';
import useDocumentTitle from '../hooks/useDocumentTitle';
import '../css/landing.css';

const PAGES = {
  privacy: { title: 'Privacy', body: ['HeartGuard AI stores your account details (name, email, hashed password) and the assessments you submit so that you can see your history.', 'Your assessments are only visible to you and to administrators of this deployment.', 'You can delete individual assessments or your entire account at any time from the app.'] },
  terms: { title: 'Terms', body: ['HeartGuard AI provides educational risk estimates only. It is not a medical device and does not diagnose, treat or prevent any condition.', 'Do not use it to make medical decisions. Always consult a qualified healthcare professional.', 'The service is provided as is, without warranties.'] },
  contact: { title: 'Contact', body: ['For questions about this deployment, contact the administrator who shared this application with you.'] },
};

export default function Legal({ page }) {
  const p = PAGES[page];
  useDocumentTitle(p.title);
  return (
    <div className="landing">
      <PublicNavbar />
      <main className="container legal">
        <h1>{p.title}</h1>
        <p className="legal-note">Template text. Replace with your own policy before a public launch.</p>
        {p.body.map((t) => <p key={t}>{t}</p>)}
        <Disclaimer />
        <p><Link to="/">Back to home</Link></p>
      </main>
      <PublicFooter />
    </div>
  );
}
