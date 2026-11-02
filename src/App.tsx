import { useEffect, useRef, type ReactNode } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { BrowsePage } from './pages/BrowsePage';
import { Gate } from './components/Gate';
import { NotFound } from './pages/ComingSoon';
import { CommunityPage } from './pages/CommunityPage';
import { GroupsPage } from './pages/GroupsPage';
import { LibraryPage } from './pages/LibraryPage';
import { ContactPage, PrivacyPage, TermsPage } from './pages/LegalPages';
import { applySeo } from './lib/seo';
import { ApplyPage } from './pages/ApplyPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { PhonePage } from './pages/PhonePage';
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';
import { SavedPage } from './pages/SavedPage';
import { useRoute, type Route } from './lib/router';

interface Resolved {
  title: string;
  node: ReactNode;
}

const DEFAULT_DESC = 'Search jobs, internships and free courses in one place. Fyndr: Jobs | Courses | Growth.';
const DESCRIPTIONS: Record<string, string> = {
  jobs: 'Fresher jobs by city, with the best job sites to search first.',
  internships: 'Internships for students and freshers, with direct links to each site\'s search.',
  courses: 'Free and paid online courses in coding, data, design and more.',
  library: 'Guides, cheat sheets, study material and free books in one searchable library.',
  community: 'Join open communities for learners and job seekers on Fyndr.',
  groups: 'Private study groups and cohorts on Fyndr, led by the person who made them.',
  organizations: 'Post jobs and internships and review applicants on Fyndr.',
  terms: 'The rules for using Fyndr.',
  privacy: 'What Fyndr keeps, why, and for how long.',
  contact: 'How to reach the Fyndr team.',
};

function resolve(route: Route): Resolved {
  const first = route.segments[0] ?? '';
  switch (first) {
    case '':
      return { title: 'Jobs, internships and courses in one search', node: <HomePage /> };
    case 'browse':
      return { title: 'Browse everything', node: <BrowsePage key="all" kind="all" /> };
    case 'jobs':
      return { title: 'Jobs for freshers', node: <BrowsePage key="job" kind="job" /> };
    case 'internships':
      return { title: 'Internships', node: <BrowsePage key="internship" kind="internship" /> };
    case 'courses':
      return { title: 'Courses', node: <BrowsePage key="course" kind="course" /> };
    case 'saved':
    case 'liked': // the old site's address for the same page
      return { title: 'Saved', node: <SavedPage /> };
    case 'login':
      return { title: 'Sign in', node: <AuthPage mode="login" /> };
    case 'register':
      return { title: 'Create your account', node: <AuthPage mode="register" /> };
    case 'forgot':
      return { title: 'Reset your password', node: <AuthPage mode="forgot" /> };
    case 'profile':
      return { title: 'Profile', node: <Gate roles={['user']}><ProfilePage /></Gate> };
    case 'dashboard':
      return { title: 'Dashboard', node: <DashboardPage /> };
    case 'phone':
      return { title: 'Verify your phone', node: <Gate roles={['user', 'org']}><PhonePage /></Gate> };
    case 'apply':
      return { title: 'Apply', node: <ApplyPage id={route.segments[1] ?? ''} key={route.segments[1]} /> };
    case 'organizations':
      return { title: 'For organizations', node: <OrganizationsPage /> };
    case 'library':
      return { title: 'Library and resources', node: <LibraryPage /> };
    case 'community':
      return { title: 'Community', node: <Gate><CommunityPage id={route.segments[1] ?? ''} /></Gate> };
    case 'groups':
      return { title: 'Groups', node: <Gate><GroupsPage id={route.segments[1] ?? ''} /></Gate> };
    case 'terms':
      return { title: 'Terms', node: <TermsPage /> };
    case 'privacy':
      return { title: 'Privacy', node: <PrivacyPage /> };
    case 'contact':
      return { title: 'Contact', node: <ContactPage /> };
    default:
      return { title: 'Page not found', node: <NotFound /> };
  }
}

export function App() {
  const route = useRoute();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  const { title, node } = resolve(route);

  useEffect(() => {
    applySeo(title, DESCRIPTIONS[first] ?? DEFAULT_DESC, route.path);
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    main.current?.focus({ preventScroll: true }); // moves screen-reader and keyboard users to the new page
  }, [route.path, title]);

  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={e => {
          e.preventDefault(); // a real #main link would change the hash and the page
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <Header />
      <main id="main" ref={main} tabIndex={-1}>
        <div className="route" key={route.path}>
          {node}
        </div>
      </main>
      <Footer />
    </>
  );
}
