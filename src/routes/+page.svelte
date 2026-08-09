<script lang="ts">
  import { onMount } from 'svelte';

  import CustomGameForm from '$lib/components/CustomGameForm.svelte';
  import GameConclusion from '$lib/components/GameConclusion.svelte';
  import GameNavigation from '$lib/components/GameNavigation.svelte';
  import GameScreen from '$lib/components/GameScreen.svelte';
  import InvalidLinkNotice from '$lib/components/InvalidLinkNotice.svelte';
  import SettingsPanel from '$lib/components/SettingsPanel.svelte';
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
  let panel = $state<'settings' | 'statistics' | 'custom' | null>(null);

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
    // only while the attribute is absent.
    if (current.state.settings.theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', current.state.settings.theme);
    }

    if (current.state.settings.highContrast) {
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

{#if store === null || app === null}
  <!--
    What the prerendered file contains, and what a reader sees for the moment
    before hydration. It cannot be a board: the game is drawn per visitor, and
    module-scope work here runs once at build time.
  -->
  <p class="starting">Poodl is starting. Five letters, six attempts, as many games as you like.</p>
{:else}
  <p class="toolbar">
    <button type="button" onclick={() => (panel = 'settings')}>Settings</button>
    <button type="button" onclick={() => (panel = 'statistics')}>Statistics</button>
    <button type="button" onclick={() => (panel = 'custom')}>Set a word</button>
  </p>

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
  {:else}
    <GameNavigation
      mode={game?.mode ?? null}
      status={game?.status ?? null}
      {repeatMode}
      onnewgame={(mode: StartableMode) => {
        store?.dispatch({ kind: 'new_game', mode });
      }}
    />

    {#if game !== null}
      <!--
        One notice, one place. Whichever surface caused a notice shows it: the
        custom game form and the end-of-game modal show the links they made, and
        the board falls silent while either is open rather than saying the same
        thing twice. It matters most for the modal, which keeps the keyboard
        inside itself — a link behind it would be unreachable.
      -->
      <GameScreen
        {game}
        keyboard={keyboardKnowledge(game.guesses)}
        physicalKeyboard={app.settings.physicalKeyboard}
        notice={panel === null && !conclusionShowing ? app.notice : null}
        noticeSequence={app.noticeSequence}
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
        onshareanswer={() => {
          store?.dispatch({ kind: 'share_current_answer' });
        }}
        oncopylink={() => {
          store?.dispatch({ kind: 'copy_link' });
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
          }}
          notice={panel === null ? app.notice : null}
          noticeSequence={app.noticeSequence}
          oncopylink={() => {
            store?.dispatch({ kind: 'copy_link' });
          }}
        />
      {/if}
    {/if}
  {/if}

  {#if panel === 'settings'}
    <SettingsPanel
      settings={app.settings}
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
  {:else if panel === 'custom'}
    <CustomGameForm
      notice={app.notice}
      oncreate={(entry: string) => {
        store?.dispatch({ kind: 'create_custom_game', entry });
      }}
      oncopylink={() => {
        store?.dispatch({ kind: 'copy_link' });
      }}
      onclose={() => {
        panel = null;
        store?.dispatch({ kind: 'dismiss_notice' });
      }}
    />
  {/if}
{/if}

<style>
  .starting {
    margin-block: 2rem;
    color: var(--muted);
    text-align: center;
  }

  .toolbar {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-block: 0 1.25rem;
  }

  button {
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--key-border);
    border-radius: 4px;
    background: var(--key-background);
    color: var(--key-text);
    font: inherit;
    cursor: pointer;
  }
</style>
