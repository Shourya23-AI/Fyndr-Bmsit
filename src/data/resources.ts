export type ResType = 'guide' | 'cheatsheet' | 'study' | 'interview' | 'career';
export interface Resource { id: string; title: string; type: ResType; topic: string; source: string; url: string; blurb: string; tags: string[]; free: boolean }

export const TYPE_LABEL: Record<ResType, string> = { guide: 'Guide', cheatsheet: 'Cheat sheet', study: 'Study material', interview: 'Interview prep', career: 'Career' };

const r = (id: string, title: string, type: ResType, topic: string, source: string, url: string, blurb: string, tags: string[], free = true): Resource => ({ id, title, type, topic, source, url, blurb, tags, free });

export const RESOURCES: readonly Resource[] = [
  r('rm-fe', 'Frontend developer roadmap', 'guide', 'Web', 'roadmap.sh', 'https://roadmap.sh/frontend', 'Step-by-step path from HTML to modern frameworks.', ['html', 'css', 'javascript', 'web']),
  r('rm-be', 'Backend developer roadmap', 'guide', 'Web', 'roadmap.sh', 'https://roadmap.sh/backend', 'What to learn for servers, databases and APIs.', ['backend', 'api', 'database']),
  r('rm-py', 'Python roadmap', 'guide', 'Programming', 'roadmap.sh', 'https://roadmap.sh/python', 'A clear path through Python from basics to projects.', ['python']),
  r('rm-da', 'Data analyst roadmap', 'guide', 'Data', 'roadmap.sh', 'https://roadmap.sh/data-analyst', 'Skills and tools for entry-level data analysis.', ['data', 'sql', 'excel', 'analyst']),
  r('rm-ds', 'AI and data scientist roadmap', 'guide', 'AI', 'roadmap.sh', 'https://roadmap.sh/ai-data-scientist', 'Maths, Python, ML and deployment in order.', ['ai', 'ml', 'data science']),
  r('rm-do', 'DevOps roadmap', 'guide', 'Cloud', 'roadmap.sh', 'https://roadmap.sh/devops', 'Linux, CI/CD, containers and cloud.', ['devops', 'cloud', 'docker']),
  r('rm-cy', 'Cyber security roadmap', 'guide', 'Security', 'roadmap.sh', 'https://roadmap.sh/cyber-security', 'Networks, systems and security basics.', ['security', 'cyber']),
  r('rm-react', 'React roadmap', 'guide', 'Web', 'roadmap.sh', 'https://roadmap.sh/react', 'What to learn around React, in order.', ['react', 'javascript']),
  r('rm-git', 'Git and GitHub roadmap', 'guide', 'Tools', 'roadmap.sh', 'https://roadmap.sh/git-github', 'Version control from first commit to teamwork.', ['git', 'github']),
  r('mdn', 'MDN: learn web development', 'study', 'Web', 'MDN', 'https://developer.mozilla.org/en-US/docs/Learn_web_development', 'The reference teachers use for HTML, CSS and JavaScript.', ['html', 'css', 'javascript']),
  r('mdn-js', 'MDN JavaScript guide', 'study', 'Programming', 'MDN', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'Language reference and guides.', ['javascript']),
  r('react', 'React: learn', 'study', 'Web', 'react.dev', 'https://react.dev/learn', 'The official, interactive React tutorial.', ['react']),
  r('ts', 'TypeScript handbook', 'study', 'Programming', 'typescriptlang.org', 'https://www.typescriptlang.org/docs/handbook/intro.html', 'Types explained from the start.', ['typescript']),
  r('pytut', 'The Python tutorial', 'study', 'Programming', 'python.org', 'https://docs.python.org/3/tutorial/', 'Official tutorial, short and complete.', ['python']),
  r('fcc', 'freeCodeCamp curriculum', 'study', 'Web', 'freeCodeCamp', 'https://www.freecodecamp.org/learn', 'Free lessons and projects with certificates.', ['web', 'python', 'data']),
  r('cs50', 'CS50 (Harvard)', 'study', 'Computer science', 'Harvard', 'https://cs50.harvard.edu/x/', 'A famous free intro to computer science.', ['cs', 'c', 'python', 'algorithms']),
  r('mlcc', 'Machine Learning Crash Course', 'study', 'AI', 'Google', 'https://developers.google.com/machine-learning/crash-course', 'Free ML course with exercises.', ['ml', 'ai']),
  r('sqlbolt', 'SQLBolt interactive lessons', 'study', 'Data', 'SQLBolt', 'https://sqlbolt.com/', 'Learn SQL by typing queries.', ['sql', 'database']),
  r('sqlzoo', 'SQLZoo', 'study', 'Data', 'SQLZoo', 'https://sqlzoo.net/', 'Practice SQL on real tables.', ['sql']),
  r('gitbook', 'Pro Git book', 'study', 'Tools', 'git-scm.com', 'https://git-scm.com/book/en/v2', 'The complete Git book, free online.', ['git']),
  r('lgb', 'Learn Git Branching', 'study', 'Tools', 'learngitbranching.js.org', 'https://learngitbranching.js.org/', 'Visual, game-like Git practice.', ['git']),
  r('khan-stat', 'Statistics and probability', 'study', 'Maths', 'Khan Academy', 'https://www.khanacademy.org/math/statistics-probability', 'Free lessons for data and ML basics.', ['statistics', 'maths', 'data']),
  r('exceljet', 'Excel formulas', 'cheatsheet', 'Data', 'Exceljet', 'https://exceljet.net/formulas', 'Short, clear examples for common formulas.', ['excel', 'formulas']),
  r('devhints', 'Devhints cheat sheets', 'cheatsheet', 'Programming', 'devhints.io', 'https://devhints.io/', 'One-page cheat sheets for many tools.', ['cheat sheet', 'bash', 'css', 'git']),
  r('devhints-bash', 'Bash scripting cheat sheet', 'cheatsheet', 'Tools', 'devhints.io', 'https://devhints.io/bash', 'Syntax and tricks for the shell.', ['bash', 'linux']),
  r('devhints-es6', 'ES2015+ cheat sheet', 'cheatsheet', 'Programming', 'devhints.io', 'https://devhints.io/es6', 'Modern JavaScript on one page.', ['javascript']),
  r('cheatography', 'Cheatography', 'cheatsheet', 'General', 'Cheatography', 'https://cheatography.com/', 'Thousands of user-made cheat sheets.', ['cheat sheet']),
  r('lawsux', 'Laws of UX', 'cheatsheet', 'Design', 'lawsofux.com', 'https://lawsofux.com/', 'Design principles that are easy to remember.', ['ux', 'design']),
  r('neetcode', 'NeetCode roadmap', 'interview', 'Coding', 'NeetCode', 'https://neetcode.io/roadmap', 'Coding problems grouped by pattern.', ['dsa', 'algorithms', 'interview']),
  r('leetcode', 'LeetCode problems', 'interview', 'Coding', 'LeetCode', 'https://leetcode.com/problemset/', 'Practise coding questions by topic.', ['dsa', 'interview']),
  r('gfg', 'GeeksforGeeks', 'interview', 'Coding', 'GeeksforGeeks', 'https://www.geeksforgeeks.org/', 'Articles and practice for placements.', ['dsa', 'cs', 'placement']),
  r('indiabix', 'IndiaBIX aptitude', 'interview', 'Aptitude', 'IndiaBIX', 'https://www.indiabix.com/', 'Aptitude and reasoning practice for campus tests.', ['aptitude', 'reasoning', 'placement']),
  r('nptel', 'NPTEL courses', 'study', 'Engineering', 'NPTEL', 'https://nptel.ac.in/', 'Free IIT and IISc lecture courses.', ['engineering', 'india']),
  r('swayam', 'SWAYAM', 'study', 'General', 'Govt. of India', 'https://swayam.gov.in/', 'Free courses from Indian universities.', ['india', 'university']),
  r('ncert', 'NCERT textbooks', 'study', 'School', 'NCERT', 'https://ncert.nic.in/textbook.php', 'School textbooks, free to read.', ['school', 'india']),
  r('ndl', 'National Digital Library of India', 'study', 'General', 'IIT Kharagpur', 'https://ndl.iitkgp.ac.in/', 'Free study material for many levels.', ['library', 'india']),
  r('indeed-cv', 'Resume and cover letter advice', 'career', 'Career', 'Indeed', 'https://www.indeed.com/career-advice/resumes-cover-letters', 'How to write a resume that gets read.', ['resume', 'cv', 'cover letter']),
  r('owl', 'Purdue Online Writing Lab', 'career', 'Writing', 'Purdue', 'https://owl.purdue.edu/owl/purdue_owl.html', 'Writing, grammar and professional email help.', ['writing', 'email']),
  r('skillshop', 'Google Skillshop', 'career', 'Marketing', 'Google', 'https://skillshop.withgoogle.com/', 'Free training in ads and analytics.', ['marketing', 'analytics']),
  r('hubspot', 'HubSpot Academy', 'career', 'Marketing', 'HubSpot', 'https://academy.hubspot.com/', 'Free marketing and sales courses.', ['marketing', 'sales']),
];
