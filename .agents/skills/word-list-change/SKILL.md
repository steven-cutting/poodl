---
name: word-list-change
description: Replace or extend the word lists while keeping every obligation the word list source states.
---

# Change the word lists

`src/lib/data/answers.txt` and `src/lib/data/guesses.txt` are replaceable data. Swapping them changes what the game plays with and nothing else, which is exactly what the `WordListSource` contract promises.

1. Read `AGENTS.md` and `docs/how-to/replace-the-word-lists.md`, then the `WordListSource` contract in `docs/specs/words.allium`.
2. Keep the shape: one word per line, exactly five lowercase letters of the English alphabet, no duplicates within a list, sorted so a diff is readable.
3. Keep the relationship: every word in `answers.txt` must also appear in `guesses.txt`, or a player could not type the answer they were asked to find.
4. Keep the curation split. The answer list is familiar vocabulary a losing player should recognise; the guess dictionary carries no such obligation and is expected to hold obscure words.
5. Keep the game's own name. `config.game_name` — `poodl` — has to be in `answers.txt`, and so in `guesses.txt`. No upstream collection carries it, so a fresh pair of lists needs it added by hand.
6. Record the provenance and licence of any list you bring in. These files ship inside the published site.
7. Never hand-edit a word to satisfy `typos`; the data directory is excluded from it in `pyproject.toml` precisely because a dictionary looks like a list of misspellings. The game's name in step 5 is the one hand-edit that is legitimate, alongside the slur block list.
8. Run `just frontend-unit` — `tests/words.test.ts` asserts every obligation above — then `just check`.
