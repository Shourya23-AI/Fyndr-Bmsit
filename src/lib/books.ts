export interface Book { id: string; title: string; author: string; year: number | null; cover: string | null; url: string; free: boolean; source: 'Open Library' | 'Project Gutenberg' }

interface OLDoc { key: string; title?: string; author_name?: string[]; first_publish_year?: number; cover_i?: number; ia?: string[]; ebook_access?: string }
interface GutBook { id: number; title: string; authors: { name: string }[]; formats: Record<string, string> }

const enc = encodeURIComponent;

export async function searchBooks(q: string, signal: AbortSignal): Promise<Book[]> {
  const [ol, gu] = await Promise.allSettled([
    fetch(`https://openlibrary.org/search.json?q=${enc(q)}&limit=24&fields=key,title,author_name,first_publish_year,cover_i,ia,ebook_access`, { signal }).then(r => r.json() as Promise<{ docs: OLDoc[] }>),
    fetch(`https://gutendex.com/books/?search=${enc(q)}&languages=en`, { signal }).then(r => r.json() as Promise<{ results: GutBook[] }>),
  ]);
  const out: Book[] = [];
  if (gu.status === 'fulfilled') {
    for (const b of gu.value.results.slice(0, 12)) {
      out.push({ id: `g${b.id}`, title: b.title, author: b.authors[0]?.name ?? 'Unknown', year: null, cover: b.formats['image/jpeg'] ?? null, url: `https://www.gutenberg.org/ebooks/${b.id}`, free: true, source: 'Project Gutenberg' });
    }
  }
  if (ol.status === 'fulfilled') {
    for (const d of ol.value.docs) {
      const ia = d.ia?.[0];
      out.push({
        id: d.key, title: d.title ?? 'Untitled', author: d.author_name?.[0] ?? 'Unknown', year: d.first_publish_year ?? null,
        cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
        url: ia && d.ebook_access !== 'no_ebook' ? `https://archive.org/details/${ia}` : `https://openlibrary.org${d.key}`,
        free: d.ebook_access === 'public', source: 'Open Library',
      });
    }
  }
  if (ol.status === 'rejected' && gu.status === 'rejected') throw new Error('Could not reach the book catalogs. Check your connection.');
  return out;
}

export const FIND_ELSEWHERE: readonly [string, string, (q: string) => string][] = [
  ['Internet Archive', 'read or borrow', q => `https://archive.org/search?query=${enc(q)}&sin=TXT`],
  ['Google Books', 'preview or buy', q => `https://www.google.com/search?tbm=bks&q=${enc(q)}`],
  ['OpenStax', 'free college textbooks', q => `https://openstax.org/search?query=${enc(q)}`],
  ['Wikibooks', 'free textbooks', q => `https://en.wikibooks.org/w/index.php?search=${enc(q)}`],
  ['arXiv', 'free research papers', q => `https://arxiv.org/search/?query=${enc(q)}&searchtype=all`],
  ['LibriVox', 'free audiobooks', q => `https://librivox.org/search?q=${enc(q)}&search_form=advanced`],
];
