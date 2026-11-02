import { useId, useState } from 'react';
import { categoryLabel } from '../lib/categories';
import { joinNames } from '../lib/format';
import { TIER_LABEL } from '../lib/group';
import type { Kind, Listing } from '../types';
import { BookmarkIcon, ChevronIcon, ExternalIcon } from './icons';

export const KIND_LABEL: Record<Kind, string> = { job: 'Job', internship: 'Internship', course: 'Course' };

const SHOWN_LINKS = 6;

interface Props {
  listing: Listing;
  saved: boolean;
  onToggleSaved: (id: string) => void;
}

export function ListingRow({ listing: l, saved, onToggleSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [allLinks, setAllLinks] = useState(false);
  const panelId = useId();
  const links = allLinks ? l.links : l.links.slice(0, SHOWN_LINKS);
  const hidden = l.links.length - links.length;

  return (
    <article className="row" data-kind={l.kind} data-open={open}>
      <div className="row__bar">
        <h3 className="row__heading">
          <button type="button" className="row__toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(o => !o)}>
            <span className="row__edge" aria-hidden="true" />
            <span className="row__main">
              <span className="row__kind">{KIND_LABEL[l.kind]}</span>
              <span className="row__title">{l.title}</span>
              <span className="row__sources">{joinNames(l.sources)}</span>
              <span className="row__facts">
                <span>{l.location}</span>
                <span>{l.pay}</span>
                {l.kind === 'course' && l.free && <span className="tag tag--free">{l.allFree ? 'Free' : 'Free options'}</span>}
              </span>
            </span>
            <span className="row__chev">
              <ChevronIcon />
            </span>
          </button>
        </h3>
        <button
          type="button"
          className="save"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${l.title} from saved` : `Save ${l.title}`}
          onClick={() => onToggleSaved(l.id)}
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      <div className="row__panel" id={panelId}>
        <div className="row__panel-inner">
          <div className="detail">
            <div className="detail__text">
              <p className="detail__summary">{l.summary}</p>
              <dl className="facts">
                <dt>Best for</dt>
                <dd>{l.bestFor.join(', ')}</dd>
                <dt>What you get</dt>
                <dd>{l.whatYouGet.join(', ')}</dd>
                {l.duration && (
                  <>
                    <dt>Length</dt>
                    <dd>{l.duration}</dd>
                  </>
                )}
                <dt>Field</dt>
                <dd>{categoryLabel(l.category)}</dd>
              </dl>
              {l.skills.length > 0 && (
                <ul className="chips" aria-label="Skills">
                  {l.skills.map(s => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              <p className="detail__note">
                {l.kind === 'course'
                  ? 'Prices, free options and certificates change, so check them on the site.'
                  : 'Check the pay, place and experience asked for before you apply. Never pay money to get a job or internship.'}
              </p>
            </div>
            <ul className="src-list">
              {links.map((s, i) => (
                <li key={s.name}>
                  <a className={i === 0 ? 'src src--primary' : 'src'} href={s.url} target="_blank" rel="noopener noreferrer">
                    <span className="src__name">Search on {s.name}</span>
                    <span className="src__side">
                      {s.tier && <span className="src__tier">{TIER_LABEL[s.tier]}</span>}
                      <ExternalIcon />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  </a>
                </li>
              ))}
              {hidden > 0 && (
                <li>
                  <button type="button" className="btn btn--quiet btn--small" onClick={() => setAllLinks(true)}>
                    Show {hidden} more {hidden === 1 ? 'site' : 'sites'}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
