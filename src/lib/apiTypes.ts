// Shapes the Fyndr server (server/routes/*.js) sends and expects.

export type Role = 'user' | 'org' | 'moderator' | 'admin';
export type OrgType = 'small' | 'enterprise';

export interface Me {
  id: string;
  name: string;
  email: string;
  role: Role;
  orgName?: string;
  orgType?: OrgType;
  verified?: boolean;
  phoneVerified: boolean;
  phoneMasked?: string;
  photo?: string;
  proofStatus?: string;
  /** Candidates only. */
  hasResume?: boolean;
  onboarded?: boolean;
  completion?: number;
  /** Organizations only: a free email address that is not allowed to post. */
  gmailBlocked?: boolean;
}

export interface SkillLevels {
  [skill: string]: number;
}

export interface WorkItem { role: string; org: string; place: string; from: string; to: string; points: string }
export interface EduItem { degree: string; institution: string; place: string; year: string; points: string }
export interface LangItem { name: string; level: number }
export interface Reference { name: string; role: string; phone: string; email: string }

export interface Profile {
  qualification?: string;
  field?: string;
  institution?: string;
  gradYear?: number | string;
  experience?: string;
  skills?: string[];
  jobTypes?: string[];
  locations?: string;
  headline?: string;
  summary?: string;
  projects?: string;
  link?: string;
  address?: string;
  linkedin?: string;
  twitter?: string;
  hobbies?: string[];
  skillLevels?: SkillLevels;
  reference?: Reference;
  jobs?: WorkItem[];
  education?: EduItem[];
  languages?: LangItem[];
  programme?: string;
  studyYear?: number;
  semester?: number;
  done?: boolean;
}

export interface ProfileResponse {
  profile: Profile;
  resume: { name: string; size: number; at: string } | null;
  completion: number;
  phone: string | null;
  name: string;
  email: string;
  photo: string | null;
  joined: string;
}

export type PostedType = 'Job' | 'Internship' | 'Course';
export type ListingStatus = 'pending' | 'approved' | 'rejected';

/** A listing posted by an organization on Fyndr (not the built-in catalog). */
export interface PostedListing {
  id: string;
  orgId: string;
  orgName: string;
  title: string;
  type: PostedType;
  location: string;
  pay: string;
  duration?: string;
  description?: string;
  image?: string;
  logo?: string;
  status: ListingStatus;
  created: string;
  orgVerified?: boolean;
  applicants?: number;
}

export type ApplicationStatus = 'applied' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
export const APPLICATION_STATUSES: readonly ApplicationStatus[] = ['applied', 'reviewing', 'interview', 'accepted', 'rejected'];

export interface MyApplication {
  id: string;
  listingId: string;
  status: ApplicationStatus;
  resumeType: 'site' | 'own';
  created: string;
  listing?: PostedListing | null;
}

export interface MyResponse {
  saved: string[];
  applications: MyApplication[];
}

export interface OrgApplication {
  id: string;
  listingId: string;
  status: ApplicationStatus;
  resumeType: 'site' | 'own';
  created: string;
  title: string;
  name?: string;
  email?: string;
}

export type OrgResume =
  | { type: 'own'; mime: string; data: string }
  | { type: 'site'; name: string; email: string; phone: string | null; photo: string | null; profile: Profile };

export const QUALIFICATIONS = ['High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Other'] as const;
export const EXPERIENCE = ['Student / Fresher', '0–1 years', '1–3 years', '3–5 years', '5+ years'] as const;
export const JOB_TYPES = ['Job', 'Internship', 'Freelance', 'Course'] as const;
