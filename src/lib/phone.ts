import { API_BASE } from './config';

// Phone verification through phone.email. It runs the SMS and the code in a popup and gives the browser a short-lived token.
// The browser never claims a number itself: the token goes to the Fyndr server, which asks phone.email who it belongs to.

const CHANNEL = 'fyndr-phone';
const TOKEN_KEY = 'fyndr-phone-token';

export async function phoneClientId(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/phone-config`);
    if (!res.ok) return null;
    const { clientId } = (await res.json()) as { clientId?: string | null };
    return clientId && !/^YOUR/i.test(clientId) ? clientId : null;
  } catch {
    return null;
  }
}

function loginUrl(id: string): string {
  // phone-callback.html sits next to index.html (it is in /public).
  const back = new URL('phone-callback.html', window.location.href.split('#')[0]).href;
  return `https://www.phone.email/auth/log-in?client_id=${encodeURIComponent(id)}&redirect_url=${encodeURIComponent(back)}`;
}

// Firefox and phones often block or break popups, so there the whole tab goes to phone.email and comes back.
const preferRedirect = (): boolean => /Firefox|FxiOS|Android|iPhone|iPad|iPod|Mobi/.test(navigator.userAgent);

export interface PhoneWait {
  token: Promise<string>;
  /** True when this tab left for phone.email (the page will reload on return). */
  redirected: boolean;
  cancel: () => void;
}

/** Must be called straight from a click so popup blockers allow it. */
export function startPhoneLogin(clientId: string): PhoneWait {
  const url = loginUrl(clientId);
  const redirect = (): PhoneWait => {
    window.location.assign(url);
    return { token: new Promise<string>(() => {}), redirected: true, cancel: () => {} };
  };
  if (preferRedirect()) return redirect();

  const left = (screen.width - 500) / 2;
  const top = (screen.height - 600) / 2;
  const popup = window.open(
    url,
    'peLoginWindow',
    `toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=500,height=560,top=${top},left=${left}`,
  );
  if (!popup) return redirect();

  let stop = (): void => {};
  let fail: (reason: { cancelled: true }) => void = () => {};
  const token = new Promise<string>((resolve, reject) => {
    fail = reject;
    const channel = 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL) : null;
    const onMessage = (msg: unknown): void => {
      const m = msg as { type?: string; token?: string } | null;
      if (m?.type === 'fyndr-phone-token' && m.token) {
        channel?.postMessage({ type: 'fyndr-phone-ack' });
        stop();
        resolve(m.token);
      }
    };
    const onWindow = (e: MessageEvent): void => {
      if (e.origin === window.location.origin) onMessage(e.data);
    };
    if (channel) channel.onmessage = e => onMessage(e.data);
    window.addEventListener('message', onWindow);
    stop = () => {
      channel?.close();
      window.removeEventListener('message', onWindow);
    };
  });
  return {
    token,
    redirected: false,
    cancel() {
      stop();
      try {
        popup.close();
      } catch {
        // already closed
      }
      fail({ cancelled: true });
    },
  };
}

/** phone-callback.html returns to  #/phone?token=...  Moves the token out of the address bar and into storage. */
export function takePendingToken(hashToken: string | null): string {
  let token = hashToken ?? '';
  for (const store of [sessionStorage, localStorage]) {
    try {
      token ||= store.getItem(TOKEN_KEY) ?? '';
      store.removeItem(TOKEN_KEY);
    } catch {
      // storage can be blocked by privacy settings
    }
  }
  if (hashToken) window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/phone');
  return token;
}

export const isCancelled = (e: unknown): boolean => typeof e === 'object' && e !== null && 'cancelled' in e;
