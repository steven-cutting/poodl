/**
 * The link a custom game travels in.
 *
 * `sharing.allium`'s `AnswerObfuscation` contract asks `custom_game_url` for a
 * link that opening resolves back to the token, and for the answer to appear
 * nowhere in it except inside the token. Both functions here are pure string
 * work: the page they are given is a URL, not the page they are running on, so
 * nothing in this file reaches for `window`.
 */

/** The query parameter the token rides in. */
export const CUSTOM_GAME_PARAM = 'g';

/**
 * The link for a token, built from the page Poodl is served at.
 *
 * Anything the page was already carrying — another query parameter, a
 * fragment — is dropped rather than carried along, so the link says the token
 * and nothing else.
 */
export function customGameUrl(token: string, pageUrl: string): string {
  const url = new URL(pageUrl);
  url.search = '';
  url.hash = '';
  url.searchParams.set(CUSTOM_GAME_PARAM, token);
  return url.toString();
}

/**
 * The token a link carries, or null when it carries none.
 *
 * Whatever is there is handed back as it stands, an empty value included.
 * Judging it belongs to `decodeToken`, which is the one place that knows what
 * this scheme produces — and a link that says `?g=` and nothing more is a Poodl
 * link that lost its token on the way, which
 * `InvalidLinksAreExplainedAndSurvivable` wants explained rather than ignored.
 */
export function tokenFromUrl(pageUrl: string): string | null {
  return new URL(pageUrl).searchParams.get(CUSTOM_GAME_PARAM);
}
