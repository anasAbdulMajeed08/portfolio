// ─────────────────────────────────────────────────────────────
// Site feature flags. Behaviour switches live here; copy and
// wording live in src/data/content.js.
// ─────────────────────────────────────────────────────────────

export const config = {
  intro: {
    /**
     * Play the loading sequence only once per browser session.
     *   false — every page load plays the full intro (default)
     *   true  — the first load plays it; reloads and repeat visits in the
     *           same tab skip straight to the page (state kept in
     *           sessionStorage, so a new tab or a closed-and-reopened
     *           browser sees the intro again)
     */
    oncePerSession: false,

    /** sessionStorage key used when `oncePerSession` is on. */
    storageKey: 'intro-seen',
  },
}
