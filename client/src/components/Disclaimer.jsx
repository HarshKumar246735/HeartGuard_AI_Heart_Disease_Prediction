import { Info } from 'lucide-react';
import { DISCLAIMER } from '../utils/constants';

export default function Disclaimer({ className = '' }) {
  return (
    <div className={`disclaimer ${className}`} role="note">
      <Info size={18} aria-hidden="true" />
      <p>{DISCLAIMER}</p>
    </div>
  );
}
