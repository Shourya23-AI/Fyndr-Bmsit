import { useEffect, useRef, type ReactNode } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { BrowsePage } from './pages/BrowsePage';
import { Gate } from './components/Gate';
import { ComingSoon, NotFound } from './pages/ComingSoon';
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
      return { title: 'Library', node: <ComingSoon title="Library" part={3} about="Free books from Open Library, Project Gutenberg and more." /> };
    case 'community':
      return { title: 'Community', node: <ComingSoon title="Community" part={3} about="Join communities and post in them." /> };
    case 'groups':
      return { title: 'Groups', node: <ComingSoon title="Groups" part={3} about="Private groups, led by the person who made them." /> };
    case 'terms':
      return { title: 'Terms', node: <ComingSoon title="Terms" part={3} about="The rules for using Fyndr." /> };
    case 'privacy':
      return { title: 'Privacy', node: <ComingSoon title="Privacy" part={3} about="What Fyndr keeps and for how long." /> };
    case 'contact':
      return { title: 'Contact', node: <ComingSoon title="Contact" part={3} about="How to reach the Fyndr team." /> };
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
    document.title = route.path === '/' ? `Fyndr: ${title}` : `${title} - Fyndr`;
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
        {node}
      </main>
      <Footer />
    </>
  );
}
