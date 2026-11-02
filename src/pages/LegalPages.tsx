import { useState, type FormEvent, type ReactNode } from 'react';
import { AreaField, TextField } from '../components/Form';
import { Link } from '../lib/router';

export const CONTACT_EMAIL = 'admin.fyndr@gmail.com';
const UPDATED = '12 October 2026';
const CLOSED_DAYS = 30;
const MAX_DAYS = 365;

function Legal({ title, children, dated = true }: { title: string; children: ReactNode; dated?: boolean }) {
  return (
    <article className="page legal">
      <h1 className="page-head__title">{title}</h1>
      {dated && <p>Last updated {UPDATED}</p>}
      {children}
      <p style={{ marginTop: '2rem' }}><Link to="/" className="btn btn--solid">Back to Fyndr</Link></p>
    </article>
  );
}
const S = ({ h, children }: { h: string; children: ReactNode }) => (<><h2>{h}</h2><p>{children}</p></>);
const Mail = () => <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

export function TermsPage() {
  return (
    <Legal title="Terms and Conditions">
      <S h="1. Using Fyndr">Fyndr lists internships, jobs and courses from organizations our team has reviewed. By creating an account or using the site you agree to these terms. If you do not agree, please do not use Fyndr.</S>
      <S h="2. Your account">You must give accurate information and keep your login private. You are responsible for what happens under your account. You must verify your email, and your phone number before applying (candidates) or posting (organizations).</S>
      <S h="3. Candidates">Only apply to listings you are genuinely interested in. Do not upload documents that are not yours or that contain false information. When you apply, the resume you choose is shared with that organization and with Fyndr admins, as described in the <Link to="/privacy">Privacy Policy</Link>. You can withdraw an application at any time.</S>
      <S h="4. Organizations">Listings must be real, lawful and accurately described. Do not ask candidates for money, and do not use Fyndr to collect personal data for any other purpose. Use the resumes and details candidates share with you only to consider them for the listing they applied to, and do not pass them on to anyone else. We may remove a listing or suspend an organization that breaks these rules.</S>
      <S h="5. Verification">A Verified badge means our team checked the organization's details at the time of review. It is not a guarantee about any offer, employer or outcome. Please do your own checks before sharing personal information or paying anyone.</S>
      <S h="6. Content you upload">You keep ownership of what you upload (profiles, listings, proof documents). You allow Fyndr to store and display it as needed to run the service.</S>
      <S h="7. Community and groups">Be respectful. Do not post spam, hate, scams or other people's private details. Authors, community creators and group leaders can delete messages, and staff may remove content or accounts that break these rules.</S>
      <S h="8. Availability and changes">We may change, pause or stop parts of Fyndr at any time. We may update these terms; continuing to use Fyndr after a change means you accept it.</S>
      <S h="9. Liability">Fyndr is provided as is. To the extent the law allows, we are not liable for hiring decisions, listing accuracy or losses arising from use of the site.</S>
      <S h="10. Contact">Questions about these terms? Write to <Mail /> or use the <Link to="/contact">Contact page</Link>.</S>
    </Legal>
  );
}

export function PrivacyPage() {
  return (
    <Legal title="Privacy Policy">
      <S h="What we collect">Your name, email address and phone number; profile details you enter (education, skills, work experience and similar); a profile photo and a resume PDF if you add them; for organizations, the organization name, website, careers page link and the registration proof you upload; documents you choose to upload for verification; your applications and saved listings; messages you post in communities and groups; and a record of when you accepted the Terms and this policy.</S>
      <S h="How we use it">To run your account, show your resume to organizations you apply to, verify organizations and candidates, prevent fraud (for example, one phone number per account), review listings and reports, and keep the service secure.</S>
      <S h="Who can see it">When you apply, the organization that owns the listing receives a copy of the resume you chose, plus your name, email and the status of your application. Fyndr admins and moderators can see account details and the documents used for verification, and may review applications to keep the service safe. Community messages are visible to signed-in users; group messages only to the group's members. We do not sell your personal data.</S>
      <S h="Who handles it">Sign-in and storage run on Google Firebase (Authentication and Firestore), so your data is stored on Google's servers, which can be located outside India. Phone verification is handled by phone.email, which sends a one-time code by SMS and tells us the verified number. The Library searches Open Library and Project Gutenberg from your browser, so those sites see your search words.</S>
      <S h="How long we keep it">Your account and profile: until you delete your account. An application, and the copy of your resume shared through it: until you withdraw it, or {CLOSED_DAYS} days after the listing is closed or removed, and in any case no longer than {MAX_DAYS} days after you applied; then it is deleted. Organization verification documents: until the organization account is deleted. When you delete your account, your profile, files, applications, saved listings and phone number record are deleted straight away. We may keep limited records where the law requires it.</S>
      <S h="Your choices and rights">In Dashboard, Privacy and data, you can see who your resume was shared with and withdraw any application, download a copy of your data, and delete your account. You can edit your profile at any time. To ask for a correction or to raise a privacy concern, write to us at the address below.</S>
      <S h="Cookies and local storage">We store your theme (light or dark), your saved listings, your sign-in session and a short-lived copy of recently viewed pages in your browser so Fyndr loads faster. We do not use advertising cookies.</S>
      <S h="Security">We use industry-standard tools, but no online service is perfectly secure. Use a strong, unique password.</S>
      <S h="Changes to this policy">If we change this policy in a way that matters, we will update the date above.</S>
      <S h="Contact">Privacy questions and requests: <Mail />.</S>
    </Legal>
  );
}

const TOPICS = ['General question', 'Report a listing', 'Organization verification', 'Account or phone problem', 'Privacy request'] as const;

export function ContactPage() {
  const [f, setF] = useState({ name: '', email: '', topic: TOPICS[0] as string, msg: '' });
  const send = (e: FormEvent): void => {
    e.preventDefault();
    const body = `${f.msg}\n\nFrom: ${f.name} <${f.email}>`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[Fyndr] ' + f.topic)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <Legal title="Contact us" dated={false}>
      <p>Questions, feedback or a problem with a listing? Send us a message. This opens your email app with the message ready to send.</p>
      <form className="form-grid" onSubmit={send}>
        <TextField label="Your name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
        <TextField label="Your email" type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
        <label className="form-field"><span className="form-field__label">Topic</span>
          <select className="select" value={f.topic} onChange={e => setF({ ...f, topic: e.target.value })}>{TOPICS.map(t => <option key={t}>{t}</option>)}</select>
        </label>
        <AreaField label="How can we help?" rows={6} value={f.msg} onChange={e => setF({ ...f, msg: e.target.value })} required />
        <button type="submit" className="btn btn--orange">Send message</button>
      </form>
      <p>Or email us directly: <Mail /></p>
    </Legal>
  );
}
