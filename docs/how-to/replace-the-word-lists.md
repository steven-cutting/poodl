---
title: "Replace the word lists"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [word_list_provisioning]
requires: []
---

# Replace the word lists

`src/lib/data/answers.txt` and `src/lib/data/guesses.txt` are data, not code. Swapping
them changes what the game plays with and nothing else — no rule anywhere names a
specific word.

The lists in the repository hold 2,393 answers and 11,440 accepted guesses, against a
design intent of roughly 2,300 and roughly 13,000. `words.allium` states floors beneath
those figures — `config.min_answer_words` is 2,000 and `config.min_guess_words` is
10,000 — because the failure worth catching is a half-written file rather than a list of
the wrong size. `tests/words.test.ts` asserts both floors, so a truncated file fails the
gate instead of shipping as a vocabulary small enough to repeat answers within a sitting.

## Provenance and licence

These files ship inside the published site, so the licence travels with the deployment.
`static/word-lists-NOTICE.txt` carries it, and `static/` is copied verbatim into `build/`.
The notice cannot live inside the `.txt` files themselves: `parse()` in
`src/lib/ports/words.ts` only drops blank lines, so a comment line would become a word and
fail the shape test.

| Source | Version | Licence |
| --- | --- | --- |
| SCOWL | 2020.12.07 | Permissive: copy, modify, distribute and sell, with the copyright notice retained. |
| 12dicts | 6.0.2 | Public domain, with acknowledgment requested. |

SCOWL is Kevin Atkinson's and 12dicts is Alan Beale's — 12dicts is distributed from
Atkinson's site, which is where that gets confused — and both state their terms inside the
archive rather than by reference. Only the 12dicts lists that are genuinely public domain are used: `2of12inf`
and the Lemmatized `2+2+3` lists derive from AGID, which the 12dicts ReadMe says prevents
their release, so Poodl does not read them.

Deliberately not used: the ENABLE list as commonly mirrored, which travels without a
licence file and is described by its mirror as a version of a dictionary whose name is a
trademark; any frequency table derived from the Google Web Trillion Word Corpus, which the
Linguistic Data Consortium distributes under terms of its own; and the word lists of any
commercial word game.

The answer list was filtered for familiarity: a word reaches it only if two independent
judgements call it common, and proper nouns, abbreviations, contractions, plain inflections
of shorter words, and an explicit block list of slurs are all excluded. The guess
dictionary keeps everything, as `words.allium` says it should. That block list is the one
place hand-editing word data is legitimate — the question is editorial rather than lexical,
and it is not a profanity filter.

## The obligations

From the `WordListSource` contract in [`words.allium`](../specs/words.allium):

- Every entry is exactly five letters, lowercase, English alphabet only.
- Neither list contains the same word twice.
- Every word in `answers.txt` also appears in `guesses.txt`. A player must be able to
  type the answer.
- The answer list is curated for familiarity — a losing player should recognise the word.
  The guess dictionary carries no such obligation and is expected to hold obscure words.
- Each list meets its floor: at least `min_answer_words` answers and `min_guess_words`
  accepted guesses.
- **`guesses.txt` is append-only across releases.** A replacement may add words and may
  re-curate `answers.txt` freely within the dictionary, but must never withdraw a word
  from `guesses.txt`. This is what lets a game in progress keep an answer Poodl still
  accepts, and a custom link issued months ago still decode to a playable word. Check a
  new dictionary against the outgoing one before shipping it; a word that disappears
  breaks links already in other people's hands, silently.

`tests/words.test.ts` asserts all of these against whatever is in the files, so a
truncated or malformed list fails the gate rather than shipping.

## The procedure

1. Obtain the lists, and record their provenance and licence. These files ship inside the
   published site, so their licence travels with the deployment.
2. Normalise them: lowercase, one word per line, no blank lines, no trailing whitespace.
3. Sort both files. Nothing depends on order, but a sorted file makes a diff readable.

   ```console
   sort -u < raw-answers.txt > src/lib/data/answers.txt
   sort -u < raw-guesses.txt > src/lib/data/guesses.txt
   ```

4. Confirm the subset relationship holds before running anything else:

   ```console
   comm -23 src/lib/data/answers.txt src/lib/data/guesses.txt
   ```

   Any output is an answer a player could not type. Add those words to the guess list.

5. Run `just frontend-unit`, then `just check`.

## Two things not to do

- **Do not correct a word to satisfy the spell-checker.** `src/lib/data/` is excluded
  from `typos` in `pyproject.toml` precisely because a five-letter dictionary is
  indistinguishable from a list of misspellings.
- **Do not withdraw a word from `guesses.txt` to make a diff smaller.** The append-only
  obligation is what makes `ReplacingTheListsBreaksNothingAlreadyInPlay` true: a game in
  progress keeps an answer Poodl still accepts, and a custom link issued by an earlier
  release still decodes to a word that can be played. A word that disappears breaks links
  already in other people's hands, silently.

## Related pages

- [Work with the specifications](work-with-the-specs.md)
- [Repository map](../project/repository-map.md)
- [Maintenance](../operations/maintenance.md)
