import {
  addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, increment, limit, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc, where, writeBatch, type Firestore, type Timestamp,
} from 'firebase/firestore';
import { getFirebaseAuth } from './firebase';

// Communities and groups talk to Firestore directly, exactly like the old site. firestore.rules is what keeps this safe.

export interface Person { uid: string; name: string; email: string }
export interface Community { id: string; name: string; desc: string; creatorId: string; creatorName: string; memberCount: number; joined: boolean }
export interface Group { id: string; name: string; desc: string; leaderId: string; leaderName: string; leaderEmail: string; members: string[] }
export interface Poll { q: string; opts: string[]; multi: boolean }
export interface Post {
  id: string; authorId: string; authorName: string; text: string; t: number;
  reply?: { id: string; name: string; text: string }; poll?: Poll; votes: Record<string, number[]>; reactions: Record<string, string>;
}
export type RoomKind = 'communities' | 'groups';

export const LIMITS = { name: 60, desc: 300, text: 1000 } as const;
const one = (s: string, n: number): string => s.replace(/\s+/g, ' ').trim().slice(0, n);

async function db(): Promise<Firestore> {
  const auth = await getFirebaseAuth();
  if (!auth) throw new Error('Sign-in is not set up yet.');
  return getFirestore(auth.app);
}

export async function whoAmI(): Promise<Person> {
  const auth = await getFirebaseAuth();
  const u = auth?.currentUser;
  if (!u) throw new Error('Please sign in first.');
  return { uid: u.uid, name: u.displayName || (u.email ?? 'Member').split('@')[0] || 'Member', email: (u.email ?? '').toLowerCase() };
}

const ms = (t: unknown): number => (t && typeof (t as Timestamp).toMillis === 'function' ? (t as Timestamp).toMillis() : Date.now());

function fail(e: unknown, doing: string): never {
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  if (code.includes('permission-denied')) throw new Error(`You do not have permission for ${doing}. Check that your email is verified.`);
  throw new Error(e instanceof Error ? e.message : `Something went wrong ${doing}.`);
}

// ---------- communities ----------
export async function listCommunities(): Promise<Community[]> {
  try {
    const d = await db(); const me = await whoAmI();
    const [all, mine] = await Promise.all([
      getDocs(query(collection(d, 'communities'), orderBy('memberCount', 'desc'), limit(60))),
      getDocs(query(collection(d, 'memberships'), where('uid', '==', me.uid))),
    ]);
    const joined = new Set(mine.docs.map(x => String(x.data().cid)));
    return all.docs.map(x => ({ id: x.id, ...(x.data() as Omit<Community, 'id' | 'joined'>), joined: joined.has(x.id) }));
  } catch (e) { return fail(e, 'loading communities'); }
}

export async function createCommunity(name: string, desc: string): Promise<string> {
  try {
    const d = await db(); const me = await whoAmI();
    const n = one(name, LIMITS.name);
    if (n.length < 3) throw new Error('Give the community a name (at least 3 letters).');
    const ref = doc(collection(d, 'communities'));
    const b = writeBatch(d);
    b.set(ref, { name: n, desc: one(desc, LIMITS.desc), creatorId: me.uid, creatorName: me.name, createdAt: serverTimestamp(), memberCount: 1 });
    b.set(doc(d, 'memberships', `${ref.id}_${me.uid}`), { cid: ref.id, uid: me.uid, name: me.name, joinedAt: serverTimestamp() });
    await b.commit();
    return ref.id;
  } catch (e) { return fail(e, 'creating the community'); }
}

export async function setMembership(cid: string, join: boolean): Promise<void> {
  try {
    const d = await db(); const me = await whoAmI();
    const b = writeBatch(d);
    const m = doc(d, 'memberships', `${cid}_${me.uid}`);
    if (join) b.set(m, { cid, uid: me.uid, name: me.name, joinedAt: serverTimestamp() }); else b.delete(m);
    b.update(doc(d, 'communities', cid), { memberCount: increment(join ? 1 : -1) });
    await b.commit();
  } catch (e) { return fail(e, join ? 'joining' : 'leaving'); }
}

export async function listMembers(cid: string): Promise<string[]> {
  try {
    const d = await db();
    const s = await getDocs(query(collection(d, 'memberships'), where('cid', '==', cid), limit(300)));
    return s.docs.map(x => ({ n: String(x.data().name ?? 'Member'), t: ms(x.data().joinedAt) })).sort((a, b) => a.t - b.t).map(x => x.n);
  } catch (e) { return fail(e, 'loading members'); }
}

export async function wipeRoom(kind: RoomKind, id: string): Promise<void> {
  try {
    const d = await db();
    const posts = await getDocs(collection(d, kind, id, 'posts'));
    await Promise.all(posts.docs.map(p => deleteDoc(p.ref)));
    await deleteDoc(doc(d, kind, id));
  } catch (e) { return fail(e, 'deleting'); }
}

// ---------- groups ----------
export async function listGroups(): Promise<Group[]> {
  try {
    const d = await db(); const me = await whoAmI();
    const s = await getDocs(query(collection(d, 'groups'), where('members', 'array-contains', me.email), limit(60)));
    return s.docs.map(x => ({ id: x.id, ...(x.data() as Omit<Group, 'id'>) }));
  } catch (e) { return fail(e, 'loading groups'); }
}

export async function getGroup(id: string): Promise<Group | null> {
  try {
    const d = await db();
    const s = await getDoc(doc(d, 'groups', id));
    return s.exists() ? { id: s.id, ...(s.data() as Omit<Group, 'id'>) } : null;
  } catch (e) { return fail(e, 'opening the group'); }
}

export async function createGroup(name: string, desc: string): Promise<string> {
  try {
    const d = await db(); const me = await whoAmI();
    const n = one(name, LIMITS.name);
    if (n.length < 3) throw new Error('Give the group a name (at least 3 letters).');
    const ref = await addDoc(collection(d, 'groups'), { name: n, desc: one(desc, LIMITS.desc), leaderId: me.uid, leaderName: me.name, leaderEmail: me.email, members: [me.email], createdAt: serverTimestamp() });
    return ref.id;
  } catch (e) { return fail(e, 'creating the group'); }
}

export async function changeMember(id: string, email: string, add: boolean): Promise<void> {
  try {
    const d = await db();
    const e = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error('That does not look like an email address.');
    await updateDoc(doc(d, 'groups', id), { members: add ? arrayUnion(e) : arrayRemove(e) });
  } catch (e) { return fail(e, add ? 'adding that person' : 'removing that person'); }
}

// ---------- chat (same for both) ----------
export function watchPosts(kind: RoomKind, id: string, on: (p: Post[]) => void, onError: (m: string) => void): () => void {
  let stop = (): void => undefined; let dead = false;
  void db().then(d => {
    if (dead) return;
    stop = onSnapshot(
      query(collection(d, kind, id, 'posts'), orderBy('createdAt', 'desc'), limit(120)),
      snap => on(snap.docs.map(x => {
        const v = x.data();
        return { id: x.id, authorId: String(v.authorId), authorName: String(v.authorName ?? 'Member'), text: String(v.text ?? ''), t: ms(v.createdAt), reply: v.reply, poll: v.poll, votes: v.votes ?? {}, reactions: v.reactions ?? {} } as Post;
      })),
      err => onError(err.message),
    );
  }).catch(e => onError(e instanceof Error ? e.message : 'Could not load messages'));
  return () => { dead = true; stop(); };
}

export async function sendPost(kind: RoomKind, id: string, text: string, extra: { reply?: { id: string; name: string; text: string }; poll?: Poll } = {}): Promise<void> {
  try {
    const d = await db(); const me = await whoAmI();
    const body: Record<string, unknown> = { authorId: me.uid, authorName: me.name, text: text.trim().slice(0, LIMITS.text), createdAt: serverTimestamp() };
    if (extra.reply) body.reply = { id: extra.reply.id, name: extra.reply.name.slice(0, 80), text: extra.reply.text.slice(0, 80) };
    if (extra.poll) body.poll = extra.poll;
    await addDoc(collection(d, kind, id, 'posts'), body);
  } catch (e) { return fail(e, 'posting'); }
}

export async function react(kind: RoomKind, id: string, p: Post, emoji: string): Promise<void> {
  try { const d = await db(); const me = await whoAmI(); await updateDoc(doc(d, kind, id, 'posts', p.id), { [`reactions.${me.uid}`]: p.reactions[me.uid] === emoji ? '' : emoji }); } catch (e) { return fail(e, 'reacting'); }
}

export async function vote(kind: RoomKind, id: string, p: Post, idx: number): Promise<void> {
  try {
    const d = await db(); const me = await whoAmI();
    const cur = p.votes[me.uid] ?? [];
    const next = p.poll?.multi ? (cur.includes(idx) ? cur.filter(i => i !== idx) : [...cur, idx]) : [idx];
    await updateDoc(doc(d, kind, id, 'posts', p.id), { [`votes.${me.uid}`]: next });
  } catch (e) { return fail(e, 'voting'); }
}

export async function removePost(kind: RoomKind, id: string, postId: string): Promise<void> {
  try { const d = await db(); await deleteDoc(doc(d, kind, id, 'posts', postId)); } catch (e) { return fail(e, 'deleting the message'); }
}
