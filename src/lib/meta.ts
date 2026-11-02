// Where each course topic and job role can be searched. Typed port of the old features/catalog/meta.js.
// The URL patterns are unchanged, so every link behaves exactly as before.
// HONEST NOTE: catalog entries are SEARCH LINKS, not postings. Each button opens the provider's or job board's own search page.
const enc = encodeURIComponent;

/** [name, short key, pay text, duration, url for a topic, what the site offers] */
export type Provider = readonly [name: string, key: string, pay: string, duration: string, url: (topic: string) => string, what: string];
/** [name, url for a role and a place] */
export type Board = readonly [name: string, url: (role: string, place: string) => string];

export const PROVIDERS: readonly Provider[] = [
    ['Coursera', 'cour', 'Free to start · certificate paid', 'Flexible, about 4 to 12 weeks', q => 'https://www.coursera.org/search?query=' + enc(q), 'courses & specializations'],
    ['edX', 'edx', 'Free to start · certificate paid', 'Self-paced, about 4 to 12 weeks', q => 'https://www.edx.org/search?q=' + enc(q), 'university courses'],
    ['Udemy', 'udem', 'Paid · check current price', 'Self-paced, 3 to 30 hours', q => 'https://www.udemy.com/courses/search/?q=' + enc(q), 'hands-on courses'],
    ['YouTube', 'yt', 'Free', 'Self-paced video lessons', q => 'https://www.youtube.com/results?search_query=' + enc(q + ' full course'), 'full free video courses'],
    ['freeCodeCamp', 'fcc', 'Free', 'Self-paced', q => 'https://www.freecodecamp.org/news/search/?query=' + enc(q), 'free tutorials'],
    ['Codecademy', 'code', 'Free basics · Pro paid', 'Self-paced, interactive', q => 'https://www.codecademy.com/search?query=' + enc(q), 'interactive lessons'],
    ['Microsoft Learn', 'msl', 'Free', 'Self-paced modules', q => 'https://learn.microsoft.com/en-us/search/?terms=' + enc(q), 'learning paths'],
    ['MIT OpenCourseWare', 'mit', 'Free', 'Self-paced course materials', q => 'https://ocw.mit.edu/search/?q=' + enc(q), 'MIT course materials'],
    ['SWAYAM / NPTEL', 'swy', 'Free · exam certificate paid', 'About 4 to 12 weeks, semester style', q => 'https://swayam.gov.in/explorer?searchText=' + enc(q), 'Indian university courses'],
    ['LinkedIn Learning', 'li', 'Paid · free trial or library access', 'Self-paced, 1 to 8 hours', q => 'https://www.linkedin.com/learning/search?keywords=' + enc(q), 'video courses'],
    ['Alison', 'ali', 'Free · certificate paid', 'Self-paced, 2 to 15 hours', q => 'https://alison.com/courses?query=' + enc(q), 'free certificate courses'],
    ['FutureLearn', 'fl', 'Free to start · upgrade paid', 'Short courses, 2 to 6 weeks', q => 'https://www.futurelearn.com/search?q=' + enc(q), 'short courses'],
    ['Skillshare', 'ss', 'Paid · free trial', 'Self-paced, under 5 hours', q => 'https://www.skillshare.com/en/search?query=' + enc(q), 'creative classes'],
    ['Khan Academy', 'kan', 'Free', 'Self-paced lessons', q => 'https://www.khanacademy.org/search?page_search_query=' + enc(q), 'free lessons'],
    ['Google Cloud Skills Boost', 'gcp', 'Free and paid labs', 'Self-paced labs and quests', q => 'https://www.cloudskillsboost.google/catalog?keywords=' + enc(q), 'labs and quests'],
    ['DataCamp', 'dc', 'Free first chapters · subscription paid', 'Self-paced, 4 to 20 hours', q => 'https://www.datacamp.com/search?q=' + enc(q), 'interactive courses'],
    ['Class Central', 'cc', 'Free and paid · compares many providers', 'Varies by course', q => 'https://www.classcentral.com/search?q=' + enc(q), 'courses from many universities'],
    ['Udacity', 'udac', 'Paid · some free courses', 'Self-paced, 1 to 4 months', q => 'https://www.udacity.com/catalog?searchValue=' + enc(q), 'nanodegrees & free courses'],
    ['Pluralsight', 'ps', 'Paid · free trial', 'Self-paced, 1 to 10 hours', q => 'https://www.pluralsight.com/search?q=' + enc(q), 'tech skill courses'],
    ['Stanford Online', 'std', 'Free and paid', 'Self-paced or scheduled', q => 'https://online.stanford.edu/search-catalog?keywords=' + enc(q), 'Stanford courses'],
    ['Harvard Online', 'hv', 'Free to start · certificate paid', 'Self-paced, 2 to 12 weeks', q => 'https://pll.harvard.edu/catalog?keywords=' + enc(q), 'Harvard courses'],
    ['Google', 'gl', 'Free to search', 'Varies', q => 'https://www.google.com/search?q=' + enc(q + ' free online course'), 'free course search'],
    // ---- added later: always appended, so older listing ids stay the same ----
    ['Great Learning Academy', 'gla', 'Free courses · certificate on completion', 'Self-paced, 1 to 10 hours', q => 'https://www.mygreatlearning.com/academy/search?query=' + enc(q), 'free certificate courses'],
    ['upGrad', 'upg', 'Paid programs · some free', 'Weeks to months', q => 'https://www.upgrad.com/search/?q=' + enc(q), 'programs and short courses'],
    ['Simplilearn', 'sim', 'Free SkillUp courses · paid programs', 'Self-paced, 1 to 10 hours', q => 'https://www.simplilearn.com/search?query=' + enc(q), 'SkillUp and certification prep'],
    ['GeeksforGeeks', 'gfg', 'Free articles · paid courses', 'Self-paced', q => 'https://www.geeksforgeeks.org/search/?q=' + enc(q), 'tutorials and practice'],
    ['Kaggle Learn', 'kag', 'Free', 'Self-paced, 3 to 5 hours', q => 'https://www.kaggle.com/search?q=' + enc(q + ' in:courses'), 'micro-courses'],
    ['Coding Ninjas', 'cn', 'Free and paid', 'Self-paced, 2 to 40 hours', q => 'https://www.codingninjas.com/search?q=' + enc(q), 'coding courses'],
    ['Physics Wallah', 'pw', 'Free videos · paid batches', 'Batch or self-paced', q => 'https://www.pw.live/search?q=' + enc(q), 'exam and subject classes'],
    ['Unacademy', 'una', 'Free and paid', 'Batch or self-paced', q => 'https://unacademy.com/search?q=' + enc(q), 'exam and subject classes'],
    ['HubSpot Academy', 'hub', 'Free · certificate free', 'Self-paced, 1 to 6 hours', q => 'https://academy.hubspot.com/courses?query=' + enc(q), 'marketing and sales courses'],
    ['Brilliant', 'bri', 'Paid · free trial', 'Self-paced, interactive', q => 'https://brilliant.org/search/?q=' + enc(q), 'interactive STEM'],
    ['Infosys Springboard', 'inf', 'Free', 'Self-paced', q => 'https://www.google.com/search?q=' + enc(q + ' site:infyspringboard.onwingspan.com'), 'free learning paths'],
    ['IBM SkillsBuild', 'ibm', 'Free · badges free', 'Self-paced, 1 to 20 hours', q => 'https://www.google.com/search?q=' + enc(q + ' site:skillsbuild.org'), 'free learning paths'],
    ['Cisco Networking Academy', 'cis', 'Free and paid', 'Self-paced, 10 to 70 hours', q => 'https://www.google.com/search?q=' + enc(q + ' site:netacad.com'), 'networking and security'],
    ['AWS Skill Builder', 'aws', 'Free and paid', 'Self-paced, 1 to 30 hours', q => 'https://www.google.com/search?q=' + enc(q + ' site:skillbuilder.aws'), 'cloud training'],
    ['Oracle University', 'ora', 'Free learning paths · paid exams', 'Self-paced', q => 'https://www.google.com/search?q=' + enc(q + ' site:education.oracle.com OR site:mylearn.oracle.com'), 'Oracle and Java learning'],
    ['Saylor Academy', 'say', 'Free · certificate free', 'Self-paced, 10 to 40 hours', q => 'https://www.saylor.org/search/?q=' + enc(q), 'free college courses'],
    ['OpenLearn (Open University)', 'ol', 'Free · statement of participation', 'Self-paced, 1 to 24 hours', q => 'https://www.open.edu/openlearn/search?q=' + enc(q), 'free university courses'],
    ['Harvard CS50', 'cs50', 'Free · certificate paid', 'Self-paced, 6 to 12 weeks', q => 'https://www.google.com/search?q=' + enc(q + ' site:cs50.harvard.edu OR site:cs50.edx.org'), 'Harvard computer science'],
    ['Spoken Tutorial (IIT Bombay)', 'spk', 'Free · test certificate', 'Self-paced', q => 'https://spoken-tutorial.org/tutorial-search/?search_foss=' + enc(q), 'free software tutorials'],
    ['Internshala Trainings', 'int', 'Paid · often discounted', '4 to 8 weeks', q => 'https://trainings.internshala.com/search?q=' + enc(q), 'online trainings'],
    ['TED-Ed and YouTube Edu', 'ted', 'Free', 'Short lessons', q => 'https://www.youtube.com/results?search_query=' + enc(q + ' lecture playlist'), 'lecture playlists'],
    ['Google Digital Garage and Skillshop', 'gdg', 'Free', 'Self-paced, 1 to 40 hours', q => 'https://www.google.com/search?q=' + enc(q + ' site:skillshop.withgoogle.com OR site:learndigital.withgoogle.com'), 'Google certificates']
];

const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** The place value meaning "all of India" (as opposed to '' = remote only, or a city name). */
export const NATION = 'India';
const city = (c: string): string => (c && c !== NATION ? c : '');

export const BOARDS: readonly Board[] = [
    ['LinkedIn Jobs', (q, c) => 'https://www.linkedin.com/jobs/search/?keywords=' + enc(q) + (c === NATION ? '&location=India' : c ? '&location=' + enc(c + ', India') : '&location=India&f_WT=2')],
    ['Indeed India', (q, c) => 'https://in.indeed.com/jobs?q=' + enc(q) + '&l=' + enc(c || 'Remote')],
    ['Naukri', (q, c) => 'https://www.naukri.com/' + slug(q) + '-jobs' + (city(c) ? '-in-' + slug(c) : '')],
    ['Internshala', q => 'https://internshala.com/internships/keywords-' + slug(q.replace(/\bintern(ship)?\b/i, '')) + '/'],
    // ---- added later: always appended, so older listing ids stay the same ----
    ['Glassdoor', (q, c) => 'https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=' + enc(q) + (city(c) ? '&locKeyword=' + enc(c) : '')],
    ['Foundit (Monster)', (q, c) => 'https://www.foundit.in/srp/results?query=' + enc(q) + (city(c) ? '&locations=' + enc(c) : '')],
    ['TimesJobs', (q, c) => 'https://www.timesjobs.com/candidate/job-search.html?txtKeywords=' + enc(q) + '&txtLocation=' + enc(city(c))],
    ['Shine', q => 'https://www.shine.com/job-search/' + slug(q) + '-jobs'],
    ['Freshersworld', q => 'https://www.freshersworld.com/jobs/jobsearch/' + slug(q) + '-jobs'],
    ['Jooble', (q, c) => 'https://in.jooble.org/SearchResult?ukw=' + enc(q) + (city(c) ? '&rg=' + enc(c) : '')],
    ['Apna', q => 'https://apna.co/jobs?search=' + enc(q)],
    ['Hirist (tech)', q => 'https://www.hirist.tech/search/' + enc(q)],
    ['Wellfound (startups)', q => 'https://www.google.com/search?q=' + enc(q + ' site:wellfound.com')],
    ['Instahyre', q => 'https://www.google.com/search?q=' + enc(q + ' site:instahyre.com')],
    ['Cutshort', q => 'https://www.google.com/search?q=' + enc(q + ' site:cutshort.io')],
    ['Unstop', q => 'https://unstop.com/search?searchTerm=' + enc(q)]
];

export const cleanQuery = (q: string): string => q.replace(/\s+/g, ' ').trim().slice(0, 80);

/** The link for one board, role and place. place: a city, '' (remote) or NATION (all of India). */
export const boardUrl = (boardIndex: number, role: string, place: string = NATION): string => {
  const board = BOARDS[boardIndex];
  return board ? board[1](cleanQuery(role), place) : '';
};

/** One link per board, opening that board's own search for exactly what was typed. */
export const jobSearchLinks = (q: string, place: string = NATION): { name: string; url: string }[] =>
  BOARDS.map(b => ({ name: b[0], url: b[1](cleanQuery(q), place) }));

/** One link per learning site, opening that site's own search for exactly what was typed. */
export const courseSearchLinks = (q: string): { name: string; url: string }[] =>
  PROVIDERS.map(p => ({ name: p[0], url: p[4](cleanQuery(q)) }));
