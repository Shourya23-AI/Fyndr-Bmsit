import type { Level, Listing } from '../types';
import type { Profile } from './apiTypes';

// "For you": ranks the built-in catalog against the profile, in the browser. No resume is read and no AI is involved.
// A match is a guide, not a promise. Every point of the score can be explained in words (see Match.reasons).

export type MatchLevel = 'strong' | 'good' | 'building';

export interface Match {
  listing: Listing;
  /** 0 to 100 */
  score: number;
  level: MatchLevel;
  /** Skills you listed that this listing asks for. */
  have: string[];
  /** Skills this listing asks for that you did not list. */
  missing: string[];
  reasons: string[];
}

export interface Gap {
  skill: string;
  /** How many of your top matches ask for it. */
  count: number;
  courses: Match[];
}

export interface Suggestions {
  /** False until the profile has at least one skill. */
  ready: boolean;
  picks: Match[];
  gaps: Gap[];
  courses: Match[];
  counts: Record<MatchLevel, number>;
}

const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9+#.\s]/g, ' ').replace(/\s+/g, ' ').trim();

const levelOf = (score: number): MatchLevel => (score >= 70 ? 'strong' : score >= 50 ? 'good' : 'building');

const KIND_WORD: Record<Listing['kind'], string> = { job: 'job', internship: 'internship', course: 'course' };

/** Experience text -> which catalog level suits it. */
function wantedLevels(experience: string | undefined): readonly Level[] {
  if (!experience || experience.startsWith('Student') || experience.startsWith('0')) return ['u', 'p', 'a'];
  return ['a', 'p'];
}

function hasSkill(skill: string, listing: Listing, listingSkills: readonly string[]): boolean {
  const s = norm(skill);
  if (!s) return false;
  if (listingSkills.some(x => x === s || (s.length > 3 && (x.includes(s) || s.includes(x))))) return true;
  // Short skills (c, r, go) only count as whole words in the title.
  return s.length <= 3 ? ` ${norm(listing.title)} `.includes(` ${s} `) : listing.hay.includes(s);
}

export function scoreListing(profile: Profile, l: Listing): Match {
  const mine = (profile.skills ?? []).map(norm).filter(Boolean);
  const theirs = l.skills.map(norm).filter(Boolean);
  const have: string[] = [];
  const missing: string[] = [];
  for (const need of l.skills) {
    (mine.some(m => hasSkill(m, l, [norm(need)])) ? have : missing).push(need);
  }
  const reasons: string[] = [];

  // Skills carry most of the score. A listing with no named skills is judged on the title instead.
  let skillPart: number;
  if (theirs.length) {
    skillPart = (have.length / theirs.length) * 60;
    if (have.length) reasons.push(`Matches ${have.length} of ${theirs.length} skills it asks for`);
  } else {
    const hit = mine.filter(m => hasSkill(m, l, [])).length;
    skillPart = Math.min(1, hit / 2) * 40;
    if (hit) reasons.push('Your skills appear in the title');
  }

  let fieldPart = 0;
  const field = norm(profile.field ?? '');
  const words = field.split(' ').filter(w => w.length > 3);
  if (words.some(w => l.hay.includes(w))) {
    fieldPart = 12;
    reasons.push(`Fits your field, ${profile.field}`);
  }

  let placePart = 0;
  const places = (profile.locations ?? '').split(',').map(norm).filter(Boolean);
  if (l.kind === 'course') {
    placePart = 6; // courses are online
  } else if (l.remote) {
    placePart = 10;
    reasons.push('Can be done remotely');
  } else if (places.length && l.city && places.includes(norm(l.city))) {
    placePart = 12;
    reasons.push(`In ${l.city}, one of your places`);
  }

  let typePart = 0;
  const types = profile.jobTypes ?? [];
  if (types.length) {
    const wanted = types.some(t => norm(t) === KIND_WORD[l.kind]);
    typePart = wanted ? 10 : -12;
    if (wanted) reasons.push(`You are looking for ${KIND_WORD[l.kind]}s`);
  }

  const levelPart = wantedLevels(profile.experience).includes(l.level) ? 6 : 0;

  const score = Math.max(0, Math.min(100, Math.round(skillPart + fieldPart + placePart + typePart + levelPart)));
  return { listing: l, score, level: levelOf(score), have, missing, reasons };
}

/**
 * Ranks the catalog for one profile.
 * picks: the best jobs and internships. gaps: skills your best matches ask for that you lack, each with courses that teach it.
 */
export function suggestFor(profile: Profile, all: readonly Listing[], opts: { limit?: number; courseLimit?: number } = {}): Suggestions {
  const limit = opts.limit ?? 60;
  const courseLimit = opts.courseLimit ?? 12;
  const empty: Suggestions = { ready: false, picks: [], gaps: [], courses: [], counts: { strong: 0, good: 0, building: 0 } };
  if (!(profile.skills ?? []).length) return empty;

  const jobs: Match[] = [];
  const courses: Match[] = [];
  for (const l of all) {
    const m = scoreListing(profile, l);
    if (m.score < 30) continue;
    (l.kind === 'course' ? courses : jobs).push(m);
  }
  const byScore = (a: Match, b: Match): number => b.score - a.score || b.listing.order - a.listing.order;
  jobs.sort(byScore);
  courses.sort(byScore);
  const picks = jobs.slice(0, limit);

  const counts: Record<MatchLevel, number> = { strong: 0, good: 0, building: 0 };
  for (const m of picks) counts[m.level] += 1;

  // Learning roadmap: which missing skills show up most often across your closest matches.
  const wanted = new Map<string, { label: string; count: number }>();
  for (const m of picks.slice(0, 25)) {
    for (const need of m.missing) {
      const key = norm(need);
      const cur = wanted.get(key);
      if (cur) cur.count += 1;
      else wanted.set(key, { label: need, count: 1 });
    }
  }
  const gaps: Gap[] = [...wanted.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([key, v]) => ({
      skill: v.label,
      count: v.count,
      courses: all
        .filter(l => l.kind === 'course' && l.skills.some(s => norm(s) === key || norm(s).includes(key)))
        .slice(0, 3)
        .map(l => ({ listing: l, score: 0, level: 'building' as const, have: [], missing: [], reasons: [`Teaches ${v.label}`] })),
    }));

  return { ready: true, picks, gaps, courses: courses.slice(0, courseLimit), counts };
}

/** Plain-language tips for a thin profile. */
export function profileTips(p: Profile, hasResume: boolean): string[] {
  const tips: string[] = [];
  if ((p.skills ?? []).length < 5) tips.push('List at least five skills. Skills are what matching is built on.');
  if (!(p.locations ?? '').trim()) tips.push('Add the cities you would work in, so nearby roles rank higher.');
  if (!(p.jobTypes ?? []).length) tips.push('Say whether you want jobs, internships or courses.');
  if (!(p.summary ?? '').trim()) tips.push('Write a two-line summary. It appears at the top of your resume.');
  if (!hasResume) tips.push('Upload a PDF resume, or apply with the one Fyndr builds from your profile.');
  return tips;
}
