---
name: word-list-change
description: Replace or extend the word lists while keeping every obligation the word list source states.
---

# Change the word lists

`src/lib/data/answers.txt`, `src/lib/data/guesses.txt` and `src/lib/data/daily-schedule.txt` are replaceable data. Swapping them changes what the game plays with and nothing else, which is exactly what the `WordListSource` contract promises.

1. Read `AGENTS.md` and `docs/how-to/replace-the-word-lists.md`, then the `WordListSource` contract in `docs/specs/words.allium`.
2. Keep the shape: one word per line, exactly five lowercase letters of the English alphabet, no duplicates within a list, sorted so a diff is readable. `daily-schedule.txt` is the one exception to sorting — its order is its whole content.
3. Keep the relationship: every word in `answers.txt` must also appear in `guesses.txt`, or a player could not type the answer they were asked to find. `daily-schedule.txt` must hold exactly the words of `answers.txt`, each once, in whatever order the supply gives — never the sorted order `answers.txt` is stored in.
4. Keep the curation split. The answer list is familiar vocabulary a losing player should recognise; the guess dictionary carries no such obligation and is expected to hold obscure words.
5. Keep the game's own name. `config.game_name` — `poodl` — has to be in `answers.txt`, and so in `guesses.txt`. No upstream collection carries it, so a fresh pair of lists needs it added by hand.
6. Record the provenance and licence of any list you bring in. These files ship inside the published site.
7. Never hand-edit a word to satisfy `typos`; the data directory is excluded from it in `pyproject.toml` precisely because a dictionary looks like a list of misspellings. The game's name in step 5 is the one hand-edit that is legitimate, alongside the slur block list.
8. Keep `daily-schedule.txt`'s positions frozen across releases: append a genuinely new word to its end; when a word leaves `answers.txt`, overwrite its schedule line with a word not already scheduled rather than deleting the line. Never reorder or delete an existing line — that changes which word a past or future day plays. `tests/words.test.ts` pins a digest of every position shipped so far: an append leaves it alone, and a repair inside that prefix changes it, so copy the new digest in by hand from the test's failure output and name the repaired position in the commit.
9. Run `just frontend-unit` — `tests/words.test.ts` asserts every obligation above — then `just check`.
