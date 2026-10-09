import {
  Activity, Circle, CigaretteOff, ClipboardCheck, ClipboardList, Droplet, FilePlus2, FileText, Footprints,
  HeartPulse, History, LayoutDashboard, Lightbulb, Salad, ShieldAlert, ShieldCheck, UserRound, Users,
} from 'lucide-react';

// Explicit map (instead of `import * as icons`) keeps the production bundle small.
const ICONS = {
  Activity, CigaretteOff, ClipboardCheck, ClipboardList, Droplet, FilePlus2, FileText, Footprints,
  HeartPulse, History, LayoutDashboard, Lightbulb, Salad, ShieldAlert, ShieldCheck, UserRound, Users,
};

export default function Icon({ name, size = 20, ...rest }) {
  const Cmp = ICONS[name] || Circle;
  return <Cmp size={size} aria-hidden="true" {...rest} />;
}
