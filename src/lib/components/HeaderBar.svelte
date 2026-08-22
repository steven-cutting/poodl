<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import IconButton from '$lib/components/IconButton.svelte';
  import Wordmark from '$lib/components/Wordmark.svelte';
  import type { GameMode, GameStatus } from '$lib/domain/types';

  /**
   * The platform chrome: the brand lockup, the mode chip and the four actions.
   *
   * The chip is `GameNavigation`'s way in. `CurrentModeIsPerceivable` asks for
   * the mode "readable as text rather than signalled only by which control
   * looks selected", and the chip's visible word is that text; its label adds
   * what pressing it does, and the dialog it opens says the rest.
   * `AvailableWhetherOrNotAGameExists` holds because the chip is in the header
   * unconditionally — before hydration, on the welcome screen, always.
   *
   * The info button is how `Welcome.@guarantee AFirstVisitIsExplained` keeps
   * the explanation "reachable again afterwards rather than being shown once
   * and lost". Statistics and Settings keep the toolbar's old names, on
   * purpose, so nothing that asks for "Settings" by name has to learn a new
   * one; the share button is named for the dialog it opens, "Share a game",
   * which holds both ways of passing a word on.
   *
   * Below ~26rem the wordmark gives up its words and the divider goes: four
   * 44px targets, the chip and the mark have to share 288px, and the collapse
   * is designed rather than discovered. The width story holds the arithmetic.
   */
  let {
    mode = null,
    status = null,
    onopenmodes,
    onopensettings,
    onopenstatistics,
    onopenshare,
    onopenhelp
  }: {
    mode?: GameMode | null;
    status?: GameStatus | null;
    onopenmodes: () => void;
    onopensettings: () => void;
    onopenstatistics: () => void;
    onopenshare: () => void;
    onopenhelp: () => void;
  } = $props();

  const chipWord = $derived(mode ?? 'No game');

  /*
   * The label says the state and the action, and deliberately never the two
   * words "random game" together: `InvalidLinkNotice`'s "Play a random game"
   * is queried by that phrase, and a second control matching it would make
   * every such query ambiguous.
   */
  const chipLabel = $derived.by(() => {
    if (mode === null) {
      return 'No game under way — change game';
    }
    return status === 'in_progress'
      ? `Playing ${mode} — change game`
      : `${mode.charAt(0).toUpperCase()}${mode.slice(1)} finished — change game`;
  });
</script>

<header>
  <h1 class="brand"><Wordmark /></h1>
  <div class="controls">
    <button
      type="button"
      class="chip"
      aria-haspopup="dialog"
      aria-label={chipLabel}
      onclick={() => {
        onopenmodes();
      }}
    >
      <span>{chipWord}</span>
      <Icon name="chevron-down" size={16} />
    </button>
    <span class="divider" aria-hidden="true"></span>
    <IconButton icon="share" label="Share a game" popup="dialog" onclick={onopenshare} />
    <IconButton icon="chart-column" label="Statistics" popup="dialog" onclick={onopenstatistics} />
    <IconButton icon="settings" label="Settings" popup="dialog" onclick={onopensettings} />
    <IconButton icon="info" label="How to play" popup="dialog" onclick={onopenhelp} />
  </div>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-5);
    flex-wrap: wrap;
    min-block-size: 56px;
    border-block-end: var(--rule-w) solid var(--rule);
  }

  h1 {
    margin: 0;
    font-size: inherit;
    font-weight: inherit;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--s-2);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    padding: 0 var(--s-4);
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: var(--radius-card);
    background: transparent;
    color: var(--text-2);
    font: inherit;
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
    white-space: nowrap;
    cursor: pointer;
  }

  .chip:hover {
    background: var(--surface-hover);
    color: var(--text);
  }

  .divider {
    inline-size: var(--rule-w);
    block-size: 20px;
    margin-inline: var(--s-2);
    background: var(--rule);
  }

  @media (max-width: 26rem) {
    header {
      gap: var(--s-3);
    }

    /*
     * Out of the layout, not out of the accessibility tree: the mark beside
     * these words is aria-hidden, so `display: none` here would leave the
     * page's only h1 with an empty accessible name. The declarations are
     * `app.css`'s `.visually-hidden`.
     */
    .brand :global(.words) {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .divider {
      display: none;
    }

    .controls {
      gap: 0;
    }
  }
</style>
