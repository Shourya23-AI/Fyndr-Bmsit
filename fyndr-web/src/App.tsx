import { useEffect, useRef, type ReactNode } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { BrowsePage } from './pages/BrowsePage';
import { ComingSoon, NotFound } from './pages/ComingSoon';
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
    case 'register':
    case 'forgot':
      return { title: 'Sign in', node: <ComingSoon title="Sign in" part={2} about="Sign in with email or phone to keep your profile and applications." /> };
    case 'profile':
      return { title: 'Profile', node: <ComingSoon title="Your profile" part={2} about="Skills, projects and cities, so Fyndr can match you to roles." /> };
    case 'dashboard':
      return { title: 'Dashboard', node: <ComingSoon title="Dashboard" part={2} about="Your matches, applications and the courses that close your gaps." /> };
    case 'apply':
      return { title: 'Apply', node: <ComingSoon title="Apply" part={2} about="Apply to listings posted by organizations." /> };
    case 'organizations':
      return { title: 'Organizations', node: <ComingSoon title="Organizations" part={2} about="Organizations that post openings on Fyndr." /> };
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
