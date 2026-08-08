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

The lists currently in the repository are placeholders: fifty answers and a hundred
accepted guesses, enough to exercise the code and far short of a playable vocabulary. The
specification's design intent is roughly 2,300 answers and roughly 13,000 accepted
guesses.

## The obligations

From the `WordListSource` contract in [`words.allium`](../specs/words.allium):

- Every entry is exactly five letters, lowercase, English alphabet only.
- Neither list contains the same word twice.
- Every word in `answers.txt` also appears in `guesses.txt`. A player must be able to
  type the answer.
- The answer list is curated for familiarity — a losing player should recognise the word.
  The guess dictionary carries no such obligation and is expected to hold obscure words.

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
- **Do not replace the lists in a release that also changes behaviour.** A replacement
  can invalidate an in-progress game and any outstanding custom link, which is an open
  question in the specification rather than a settled answer.

## Related pages

- [Work with the specifications](work-with-the-specs.md)
- [Repository map](../project/repository-map.md)
- [Maintenance](../operations/maintenance.md)
