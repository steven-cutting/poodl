<script lang="ts">
  import { onMount } from 'svelte';

  import GameConclusion from '$lib/components/GameConclusion.svelte';
  import GameNavigation from '$lib/components/GameNavigation.svelte';
  import GameScreen from '$lib/components/GameScreen.svelte';
  import HeaderBar from '$lib/components/HeaderBar.svelte';
  import HowToPlayPanel from '$lib/components/HowToPlayPanel.svelte';
  import InvalidLinkNotice from '$lib/components/InvalidLinkNotice.svelte';
  import SettingsPanel from '$lib/components/SettingsPanel.svelte';
  import SharePanel from '$lib/components/SharePanel.svelte';
  import StatisticsPanel from '$lib/components/StatisticsPanel.svelte';
  import WelcomeScreen from '$lib/components/WelcomeScreen.svelte';
  import { createStore } from '$lib/app/store.svelte';
  import type { Store } from '$lib/app/store.svelte';
  import { canContinue, isFinishedByPlay } from '$lib/app/state';
  import { answersUnseen } from '$lib/domain/answerPool';
  import { keyboardKnowledge } from '$lib/domain/keyboard';
  import { CUSTOM_GAME_PARAM, tokenFromUrl } from '$lib/domain/links';
  import type { StartableMode, ThemeChoice } from '$lib/domain/types';
  import { createNavigatorClipboard } from '$lib/ports/clipboard';
  import { createSystemClock } from '$lib/ports/clock';
  import { createMediaPreferences } from '$lib/ports/preferences';
  import { createCryptoRandom } from '$lib/ports/random';
  import { createWebStorage } from '$lib/ports/storage';
  import { createIntervalTimer } from '$lib/ports/timer';
  import { createBundledWordList } from '$lib/ports/words';

  /*
   * The whole application, assembled.
   *
   * Everything that differs per visitor — the draw, the stored game, the device
   * preferences, the token in the address bar — happens after hydration.
   * `+layout.ts` prerenders every route, so module-scope work runs once in Node
   * at build time, and a port adapter constructed there would be reaching for a
   * `localStorage` and a `navigator` that do not exist. `onMount` never runs on
   * the server, which is what keeps the build honest.
   *
   * The word list is the exception: it is bundled data with no side effect, so
   * it can be read at module scope and is, because the statistics panel needs it
   * to count what is left in the pool.
   */
  const words = createBundledWordList();

  /*
   * The type argument rather than an annotation on the binding. With
   * `let store: Store | null = $state(null)` TypeScript narrows the binding to
   * `null` at its declaration and never widens it again — the assignment lives
   * inside `onMount`, which is a callback control-flow analysis does not follow.
   */
  let store = $state<Store | null>(null);
  let panel = $state<'settings' | 'statistics' | 'share' | 'modes' | 'help' | null>(null);

  onMount(() => {
    const created = createStore(
      {
        storage: createWebStorage(),
        clock: createSystemClock(),
        random: createCryptoRandom(),
        clipboard: createNavigatorClipboard(),
        words,
        preferences: createMediaPreferences(),
        timer: createIntervalTimer()
      },
      { pageUrl: window.location.href }
    );

    store = created;

    /*
     * Opening first, then the token. `BeginGame` dismisses the welcome screen,
     * so a link that decodes lands on the game it names even with the welcome
     * setting on; a link that does not lands on the welcome screen with the
     * refusal beside it, which is what `InvalidLinksAreExplainedAndSurvivable`
     * asks for.
     */
    created.dispatch({ kind: 'open' });

    const token = tokenFromUrl(window.location.href);

    if (token !== null) {
      created.dispatch({ kind: 'open_custom_link', token });

      /*
       * Spend the token once. Left in the address bar, the next reload would
       * open the same link again and retire whatever was on the board — which
       * for a stat-eligible game with a guess in it is a loss the player never
       * asked for.
       */
      const url = new URL(window.location.href);
      url.searchParams.delete(CUSTOM_GAME_PARAM);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }

    return () => {
      created.destroy();
    };
  });

  const app = $derived(store?.state ?? null);
  const game = $derived(app?.currentGame ?? null);

  /*
   * From the store rather than from the state, because a results grid is
   * rendered on the way out: `PaletteFollowsHighContrast` follows high contrast
   * as it applies, so the grid on screen has to move when the device does.
   */
  const shareable = $derived(store?.shareable ?? null);

  /** The mode "New game" repeats. Custom is not startable, so it never lands here. */
  const repeatMode = $derived<StartableMode>(
    game !== null && game.mode !== 'custom' ? game.mode : (app?.lastMode ?? 'random')
  );

  const hardModeCostsThisGame = $derived(
    game !== null && game.status === 'in_progress' && game.guesses.length >= 1
  );

  /*
   * Which game's conclusion the player has closed, remembered by the moment it
   * started. A game is identified by that rather than by the object, because
   * every dispatch replaces the object; two games cannot share the moment,
   * because starting one always retires the other first.
   */
  let closedConclusionFor = $state<number | null>(null);

  const conclusionShowing = $derived(
    game !== null && isFinishedByPlay(game) && closedConclusionFor !== game.startedAt
  );

  /*
   * One notice, one place, applied to the one kind that has a surface of its
   * own. `InvalidLinkNotice` explains the refusal and offers the way out of it;
   * passing the same notice on as well put the sentence on the board a second
   * time, in a second live region, with a second control named "Dismiss".
   */
  const boardNotice = $derived(
    app?.notice?.kind === 'custom_link_invalid' ? null : (app?.notice ?? null)
  );

  /*
   * The share dialog is handed the notice and the shareable the engine holds,
   * because both are what it makes. That means whatever the board was already
   * saying — a guess rejection, the grid the conclusion made — would be
   * inherited by a dialog that made neither and discarded when it closes. So
   * the dialog opens on a clean surface.
   *
   * Only this panel: `SettingsPanel` and `StatisticsPanel` render neither, and
   * clearing on their behalf would throw away a link the player is still
   * looking at. An invalid-link notice is left alone too — `InvalidLinkNotice`
   * is its surface, it carries the way out of a dead end, and `boardNotice`
   * has already excluded it from anything the dialog could inherit.
   */
  function openSharePanel(): void {
    if (boardNotice !== null) {
      store?.dispatch({ kind: 'dismiss_notice' });
    }
    store?.dispatch({ kind: 'dismiss_shareable' });
    panel = 'share';
  }

  /*
   * settings.allium — the `Appearance` surface reaching the document. `app.css`
   * keys every palette on `:root`, so the attributes go on the documentElement
   * and nowhere else.
   */
  $effect(() => {
    const root = document.documentElement;
    const current = store;

    if (current === null) {
      return;
    }

    // `system` writes nothing, because app.css reaches the device preference
    // only while the attribute is absent. `app.html` ships the attribute as
    // `dark` — the default — so the prerendered page paints it before this
    // runs; every other choice is written over it here.
    if (current.state.settings.theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', current.state.settings.theme);
    }

    /*
     * The effective value, not the setting. `MoreContrastFromTheDeviceTurnsHighContrastOn`
     * gives the device the same last word it has over motion, and the store is
     * where that negotiation is settled.
     *
     * Unlike the theme this is not also written as a media query in `app.css`,
     * and the difference is deliberate. Theme has three answers and one of
     * them, `system`, is the device's to give as it changes: the query is what
     * carries that answer, `color-scheme` included, once the attribute is
     * removed, and the attribute exists to override it. High contrast
     * overrides nothing — the device wins outright, which is exactly why a
     * query would be a second answer to a question the store has already
     * answered, agreeing only for as long as the cascade order says so. The
     * cost is that a device asking for more contrast sees the standard palette
     * until the first paint, which is the same wait a stored setting already
     * has.
     */
    if (current.highContrastActive) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    if (current.animationsActive) {
      root.setAttribute('data-animations', 'on');
    } else {
      root.removeAttribute('data-animations');
    }
  });
</script>

<svelte:head>
  <title>Poodl</title>
  <meta name="description" content="An unlimited-play, Wordle-style word guessing game." />
</svelte:head>

<div class="shell">
  <!--
    Above the hydration branch, so the prerendered document already carries the
    header, the h1 and the chip. Before the store exists the chip says no game
    is under way and every control only moves the local panel state.
  -->
  <HeaderBar
    mode={game?.mode ?? null}
    status={game?.status ?? null}
    onopenmodes={() => (panel = 'modes')}
    onopensettings={() => (panel = 'settings')}
    onopenstatistics={() => (panel = 'statistics')}
    onopenshare={openSharePanel}
    onopenhelp={() => (panel = 'help')}
  />

  <main>
    {#if store === null || app === null}
      <!--
        What the prerendered file contains, and what a reader sees for the moment
        before hydration. It cannot be a board: the game is drawn per visitor, and
        module-scope work here runs once at build time.
      -->
      <p class="starting">
        Poodl is starting. Five letters, six attempts, as many games as you like.
      </p>
    {:else}
      {#if app.notice?.kind === 'custom_link_invalid'}
        <InvalidLinkNotice
          onaccept={() => {
            store?.dispatch({ kind: 'accept_random_fallback' });
          }}
          ondismiss={() => {
            store?.dispatch({ kind: 'dismiss_notice' });
          }}
        />
      {/if}

      {#if app.awaitingWelcome}
        <WelcomeScreen
          isFirstVisit={app.lastMode === null && game === null}
          canContinue={canContinue(app)}
          lastMode={app.lastMode}
          currentMode={game?.mode ?? null}
          currentStatus={game?.status ?? null}
          oncontinue={() => {
            store?.dispatch({ kind: 'continue' });
          }}
          onnewgame={(mode: StartableMode) => {
            store?.dispatch({ kind: 'new_game', mode });
          }}
        />
      {:else if game !== null}
        <!--
        One notice, one place. Whichever surface caused a notice shows it: the
        share dialog and the end-of-game modal show the links they made, and
        the board falls silent while either is open rather than saying the same
        thing twice. It matters most for the modal, which keeps the keyboard
        inside itself — a link behind it would be unreachable.

        The keys go the same way. A dialog takes focus and holds it, so while
        one is open the board is not the surface facing the player: leaving its
        window listener mounted let letters, Enter and Backspace reach a board
        nobody could see, and spend an attempt on it.
      -->
        <GameScreen
          {game}
          keyboard={keyboardKnowledge(game.guesses)}
          physicalKeyboard={app.settings.physicalKeyboard && panel === null}
          notice={panel === null && !conclusionShowing ? boardNotice : null}
          noticeSequence={app.noticeSequence}
          shareable={panel === null && !conclusionShowing ? shareable : null}
          announcement={app.announcement}
          announcementSequence={app.announcementSequence}
          onletter={(letter: string) => {
            store?.dispatch({ kind: 'enter_letter', letter });
          }}
          ondelete={() => {
            store?.dispatch({ kind: 'delete_letter' });
          }}
          onsubmit={() => {
            store?.dispatch({ kind: 'submit_guess' });
          }}
          oncopy={() => {
            store?.dispatch({ kind: 'copy_shareable' });
          }}
          ondismissnotice={() => {
            store?.dispatch({ kind: 'dismiss_notice' });
          }}
          onshowresult={isFinishedByPlay(game) && !conclusionShowing
            ? () => {
                closedConclusionFor = null;
              }
            : undefined}
        />

        {#if conclusionShowing}
          <GameConclusion
            status={game.status === 'won' ? 'won' : 'lost'}
            mode={game.mode}
            answer={game.answer}
            attemptsUsed={game.guesses.length}
            secondsRemaining={store.secondsRemaining}
            {repeatMode}
            onstop={() => {
              store?.dispatch({ kind: 'stop_countdown' });
            }}
            onnewgame={(mode: StartableMode) => {
              store?.dispatch({ kind: 'new_game', mode });
            }}
            onshareresults={() => {
              store?.dispatch({ kind: 'share_results' });
            }}
            onshareanswer={() => {
              store?.dispatch({ kind: 'share_current_answer' });
            }}
            onclose={() => {
              closedConclusionFor = game.startedAt;
              // A link made in here ends with it, as one made in the share
              // dialog does: passing the word on belongs to the surfaces that
              // offer it, and the board offers it no longer. The grid stays —
              // `TheGridIsAvailableAsText` wants it where the player is looking.
              if (shareable?.kind === 'custom_link') {
                store?.dispatch({ kind: 'dismiss_notice' });
                store?.dispatch({ kind: 'dismiss_shareable' });
              }
            }}
            notice={panel === null ? boardNotice : null}
            noticeSequence={app.noticeSequence}
            shareable={panel === null ? shareable : null}
            oncopy={() => {
              store?.dispatch({ kind: 'copy_shareable' });
            }}
          />
        {/if}
      {/if}

      {#if panel === 'settings'}
        <SettingsPanel
          settings={app.settings}
          highContrastActive={store.highContrastActive}
          hardModeMayBeEnabled={store.hardModeMayBeEnabled}
          hardModeReleased={game?.hardModeReleased ?? false}
          {hardModeCostsThisGame}
          onclose={() => (panel = null)}
          onchoosetheme={(choice: ThemeChoice) => {
            store?.dispatch({ kind: 'choose_theme', choice });
          }}
          onhighcontrast={(enabled: boolean) => {
            store?.dispatch({ kind: 'set_high_contrast', enabled });
          }}
          onanimations={(enabled: boolean) => {
            store?.dispatch({ kind: 'set_animations', enabled });
          }}
          onphysicalkeyboard={(enabled: boolean) => {
            store?.dispatch({ kind: 'set_physical_keyboard', enabled });
          }}
          onshowwelcome={(enabled: boolean) => {
            store?.dispatch({ kind: 'set_show_welcome', enabled });
          }}
          onenablehardmode={() => {
            store?.dispatch({ kind: 'enable_hard_mode' });
          }}
          ondisablehardmode={() => {
            store?.dispatch({ kind: 'disable_hard_mode' });
          }}
        />
      {:else if panel === 'statistics'}
        <StatisticsPanel
          statistics={app.statistics}
          answersUnseen={answersUnseen(app.pool, words.answerWords())}
          answersMayRepeat={app.pool.hasRecycled}
          onreset={() => {
            store?.dispatch({ kind: 'reset_statistics' });
          }}
          onclose={() => (panel = null)}
        />
      {:else if panel === 'share'}
        <SharePanel
          notice={boardNotice}
          noticeSequence={app.noticeSequence}
          {shareable}
          mode={game?.mode ?? null}
          status={game?.status ?? null}
          onshareanswer={game !== null
            ? () => {
                store?.dispatch({ kind: 'share_current_answer' });
              }
            : undefined}
          oncreate={(entry: string) => {
            store?.dispatch({ kind: 'create_custom_game', entry });
          }}
          oncopy={() => {
            store?.dispatch({ kind: 'copy_shareable' });
          }}
          onclose={() => {
            panel = null;
            store?.dispatch({ kind: 'dismiss_notice' });
            // The link was made in here, so closing this is the end of it.
            store?.dispatch({ kind: 'dismiss_shareable' });
          }}
        />
      {:else if panel === 'modes'}
        <GameNavigation
          mode={game?.mode ?? null}
          status={game?.status ?? null}
          {repeatMode}
          onnewgame={(mode: StartableMode) => {
            store?.dispatch({ kind: 'new_game', mode });
            // The dialog must not sit over the fresh board it just asked for.
            panel = null;
          }}
          onclose={() => (panel = null)}
        />
      {:else if panel === 'help'}
        <HowToPlayPanel onclose={() => (panel = null)} />
      {/if}
    {/if}
  </main>
</div>

<style>
  .shell {
    max-inline-size: var(--shell-max);
    margin-inline: auto;
    padding: 0 var(--shell-pad) var(--s-11);
  }

  main {
    padding-block-start: var(--s-6);
  }

  .starting {
    margin-block: 2rem;
    color: var(--text-2);
    text-align: center;
  }
</style>
