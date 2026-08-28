import type { StartableMode, ThemeChoice } from '$lib/domain/types';

/**
 * Everything that can happen to Poodl, as one closed set.
 *
 * There is one command per trigger the specifications name, and the names are
 * theirs. Two are not player actions: `open` is `PlayerOpensPoodl` — provided
 * by the `Arrival` surface, which is a doorway rather than a control — and
 * `countdown_elapsed` is the temporal trigger
 * `EndlessCountdownElapses` waits on — the shell watches the clock and says
 * when. `clipboard_settled` reports back from the one asynchronous effect the
 * engine emits.
 *
 * `new_game` carries a `StartableMode` rather than a `GameMode`, so asking for
 * a custom game is unrepresentable rather than refused. A custom game arrives
 * through `open_custom_link` and no other way.
 */
export type Command =
  // Arriving — game.allium
  | { kind: 'open' }
  | { kind: 'continue' }
  | { kind: 'new_game'; mode: StartableMode }
  // Playing — game.allium
  | { kind: 'enter_letter'; letter: string }
  | { kind: 'delete_letter' }
  | { kind: 'submit_guess' }
  | { kind: 'stop_countdown' }
  | { kind: 'countdown_elapsed' }
  // Settings — settings.allium
  | { kind: 'choose_theme'; choice: ThemeChoice }
  | { kind: 'set_high_contrast'; enabled: boolean }
  | { kind: 'set_animations'; enabled: boolean }
  | { kind: 'set_physical_keyboard'; enabled: boolean }
  | { kind: 'set_show_welcome'; enabled: boolean }
  | { kind: 'enable_hard_mode' }
  | { kind: 'disable_hard_mode' }
  // Statistics — statistics.allium
  | { kind: 'reset_statistics' }
  // Sharing — sharing.allium
  | { kind: 'create_custom_game'; entry: string }
  | { kind: 'share_current_answer' }
  | { kind: 'open_custom_link'; token: string }
  | { kind: 'accept_random_fallback' }
  | { kind: 'share_results' }
  | { kind: 'copy_shareable' }
  | { kind: 'clipboard_settled'; id: number; copied: boolean }
  // Dismissing whatever Poodl is currently saying, and putting away whatever it
  // made to be taken. Two commands, because the sentence and the thing it is
  // about have different lifetimes: reading a failure message must not take away
  // the text that message tells the player to select.
  | { kind: 'dismiss_notice' }
  | { kind: 'dismiss_shareable' };

/**
 * The one thing the engine cannot do itself.
 *
 * Writing to the clipboard is asynchronous and can fail, and `sharing.allium`
 * requires the action to report whether the copy succeeded. The engine says
 * what to copy; the shell copies it and dispatches `clipboard_settled` with the
 * `id` it was given, so a result that arrives late can be told from the one the
 * player is waiting on.
 */
export interface CopyEffect {
  kind: 'copy';
  id: number;
  text: string;
}

export type Effect = CopyEffect;
