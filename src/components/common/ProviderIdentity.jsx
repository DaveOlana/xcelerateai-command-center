// Provider identity resolution for Learning Kit resource cards.
// Maps a resource's URL (or, failing that, its metadata.provider text) to a
// recognizable brand mark + accent color, so a learner can tell at a glance
// where a resource comes from (MDN, YouTube, GitHub, React docs, etc.)
// without reading the title.
//
// Pure presentation: reads only `resource.url` / `resource.metadata.provider`
// / `resource.type` (all already resolved by missionAdapter.js) and never
// touches raw roadmap JSON, AppContext, or normalization logic.
//
// Official brand marks aren't bundled as image assets in this app, so
// well-known ones are approximated as small inline vector glyphs (or, where
// lucide-react already ships a suitable brand icon, that icon is reused
// directly). Unrecognized providers fall back to a resource-type icon —
// never a broken image or a placeholder.
import {
  Github, Youtube, Chrome, Flame, GitBranch, Rocket, Zap,
  BookOpen, PlayCircle, Code2, FlaskConical, Package,
  GraduationCap, Book, FileText, Bookmark, Wrench, Globe,
} from 'lucide-react';

function ReactAtomIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="currentColor" strokeWidth="1.4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="currentColor" strokeWidth="1.4" transform="rotate(120 12 12)" />
    </svg>
  );
}

function NodeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 2.4 20.8 7.5V16.5L12 21.6 3.2 16.5V7.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function VercelIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 3 22 20H2Z" />
    </svg>
  );
}

function TailwindIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9.6c1.3-2.8 3.1-4.2 5.5-4.2 3 0 3.6 2.3 5.5 2.3 1.7 0 2.9-.9 3.5-2.1" />
      <path d="M4 15.4c1.3-2.8 3.1-4.2 5.5-4.2 3 0 3.6 2.3 5.5 2.3 1.7 0 2.9-.9 3.5-2.1" />
    </svg>
  );
}

function DockerIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <rect x="2.5" y="11" width="3" height="3" rx="0.4" />
      <rect x="6" y="11" width="3" height="3" rx="0.4" />
      <rect x="9.5" y="11" width="3" height="3" rx="0.4" />
      <rect x="6" y="7.3" width="3" height="3" rx="0.4" />
      <rect x="9.5" y="7.3" width="3" height="3" rx="0.4" />
      <path d="M2 14.2c0 3.1 2.6 5.3 6 5.3h5.4c3.6 0 6.8-1.9 8.4-5.1-.9-.9-2.3-1.2-3.3-.6-.4-.9-1.5-1.4-2.5-1.1v1.5H2Z" />
    </svg>
  );
}

function SupabaseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.2 2 4.4 13.6h5.9l-1 8.4 9-11.8h-6.1z" />
    </svg>
  );
}

function DigitalOceanIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2c-4 6-8 10.2-8 14a8 8 0 0 0 16 0c0-3.8-4-8-8-14Z" />
    </svg>
  );
}

function monogram(letters, fontSize = 9) {
  return function MonogramIcon({ className }) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <text
          x="12" y="15.5"
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="800"
          fill="currentColor"
          fontFamily="Manrope, Inter, sans-serif"
        >
          {letters}
        </text>
      </svg>
    );
  };
}

// Ordered by specificity — more specific hostnames (e.g. subdomains) are
// listed before broader ones so `.find()` resolves the right entry first.
const PROVIDERS = [
  { match: /developer\.mozilla\.org/i, name: 'MDN', Icon: monogram('MDN', 6.5), color: '#CBD5E1' },
  { match: /javascript\.info/i, name: 'javascript.info', Icon: monogram('JS'), color: '#F7DF1E' },
  { match: /freecodecamp\.org/i, name: 'freeCodeCamp', Icon: Flame, color: '#00A65E' },
  { match: /youtube\.com|youtu\.be/i, name: 'YouTube', Icon: Youtube, color: '#FF0000' },
  { match: /github\.io/i, name: 'GitHub', Icon: Github, color: '#CBD5E1' },
  { match: /github\.com/i, name: 'GitHub', Icon: Github, color: '#CBD5E1' },
  { match: /git-scm\.com/i, name: 'Git', Icon: GitBranch, color: '#F05033' },
  { match: /code\.visualstudio\.com/i, name: 'VS Code', Icon: Code2, color: '#007ACC' },
  { match: /nodejs\.org/i, name: 'Node.js', Icon: NodeIcon, color: '#539E43' },
  { match: /vercel\.com/i, name: 'Vercel', Icon: VercelIcon, color: '#E4E4E7' },
  { match: /reactrouter\.com/i, name: 'React Router', Icon: ReactAtomIcon, color: '#61DAFB' },
  { match: /reactnavigation\.org/i, name: 'React Navigation', Icon: ReactAtomIcon, color: '#61DAFB' },
  { match: /reactnative\.dev/i, name: 'React Native', Icon: ReactAtomIcon, color: '#61DAFB' },
  { match: /react\.dev/i, name: 'React', Icon: ReactAtomIcon, color: '#61DAFB' },
  { match: /vite\.dev/i, name: 'Vite', Icon: Zap, color: '#8B7CF6' },
  { match: /tailwindcss\.com/i, name: 'Tailwind CSS', Icon: TailwindIcon, color: '#38BDF8' },
  { match: /expressjs\.com/i, name: 'Express', Icon: monogram('Ex'), color: '#CBD5E1' },
  { match: /wordpress\.org/i, name: 'WordPress', Icon: monogram('W'), color: '#3499CD' },
  { match: /docs\.expo\.dev/i, name: 'Expo', Icon: Rocket, color: '#E4E4E7' },
  { match: /npmjs\.com/i, name: 'npm', Icon: monogram('npm', 6.5), color: '#CB3837' },
  { match: /web\.dev|developer\.chrome\.com/i, name: 'web.dev', Icon: Chrome, color: '#4285F4' },
  { match: /docker\.com/i, name: 'Docker', Icon: DockerIcon, color: '#2496ED' },
  { match: /supabase\.com/i, name: 'Supabase', Icon: SupabaseIcon, color: '#3ECF8E' },
  { match: /digitalocean\.com/i, name: 'DigitalOcean', Icon: DigitalOceanIcon, color: '#0080FF' },
  { match: /scrimba\.com/i, name: 'Scrimba', Icon: monogram('S'), color: '#A855F7' },
  { match: /frontendmasters\.com/i, name: 'Frontend Masters', Icon: monogram('FM', 7.5), color: '#E0364E' },
  { match: /udemy\.com/i, name: 'Udemy', Icon: monogram('U'), color: '#A435F0' },
  { match: /codecademy\.com/i, name: 'Codecademy', Icon: monogram('C'), color: '#3B82F6' },
  { match: /w3schools\.com/i, name: 'W3Schools', Icon: monogram('W3', 7.5), color: '#04AA6D' },
  { match: /css-tricks\.com/i, name: 'CSS-Tricks', Icon: monogram('CT', 7.5), color: '#5B9DD9' },
  { match: /stackoverflow\.com/i, name: 'Stack Overflow', Icon: monogram('SO', 7.5), color: '#F48024' },
  { match: /egghead\.io/i, name: 'egghead.io', Icon: monogram('eh'), color: '#FACC15' },
  { match: /flexboxfroggy\.com/i, name: 'Flexbox Froggy', Icon: Code2, color: '#4ADE80' },
];

// Resource-type → fallback icon, used only when the URL's host doesn't match
// any known provider above. Keeps every card visually meaningful even for
// brand-new/unrecognized domains, without inventing a fake logo.
const TYPE_FALLBACK_ICON = {
  'Official Documentation': BookOpen,
  Video: PlayCircle,
  'Interactive Practice': Code2,
  'Playground / Lab': FlaskConical,
  Project: Package,
  Course: GraduationCap,
  Book,
  Article: FileText,
  'Cheat Sheet': FileText,
  Reference: Bookmark,
  Tool: Wrench,
};

const FALLBACK_COLOR = '#94A3B8';

function hostnameOf(url) {
  if (!url || url === '#') return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function titleCaseFromHost(host) {
  const label = host.split('.').slice(0, -1).join('.') || host;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Resolve { name, Icon, color } for a resource's originating provider.
 * Never returns null — always falls back to a sensible, type-aware default
 * so every ResourceCard can render a provider mark unconditionally.
 */
export function getProviderIdentity(resource) {
  const host = hostnameOf(resource?.url);

  if (host) {
    const entry = PROVIDERS.find((p) => p.match.test(host));
    if (entry) return entry;
  }

  const providerText = resource?.metadata?.provider || null;
  if (providerText) {
    const entry = PROVIDERS.find((p) => p.name.toLowerCase() === providerText.toLowerCase());
    if (entry) return entry;
    return { name: providerText, Icon: Globe, color: FALLBACK_COLOR };
  }

  const FallbackIcon = TYPE_FALLBACK_ICON[resource?.type] || Globe;
  return {
    name: host ? titleCaseFromHost(host) : 'Resource',
    Icon: FallbackIcon,
    color: FALLBACK_COLOR,
  };
}
