import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <main className="notfound">
      <Logo />
      <p className="notfound-code">404</p>
      <h1>This page doesn't exist</h1>
      <p className="text-secondary">The link may be broken or the page may have moved.</p>
      <Link to="/" className="btn btn-primary">Go to home</Link>
    </main>
  );
}
