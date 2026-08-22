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

The lists in the repository hold 1,122 answers and 15,029 accepted guesses, against a
design intent of roughly 1,100 and roughly 15,000. `words.allium` states floors beneath
those figures — `config.min_answer_words` is 1,000 and `config.min_guess_words` is
10,000 — because the failure worth catching is a half-written file rather than a list of
the wrong size. `tests/words.test.ts` asserts both floors, so a truncated file fails the
gate instead of shipping as a vocabulary small enough to repeat answers within a sitting.

A third file sits beside them. `src/lib/data/answers-scowl.txt` is the 2,394-word answer
list the game shipped with before the easier list replaced it. Nothing imports it, so it is
not bundled; it is kept so the harder curation can be restored by swapping the two file
names, and because it is what the SCOWL and 12dicts filtering described below produced.

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
| Maintainer-supplied lists | — | Unknown. Both the shipped answer list and the 14,855-word guess list merged into the dictionary were copied from a version of Poodl the maintainer built with Replit, which neither provided nor recorded where their words came from. |

SCOWL is Kevin Atkinson's and 12dicts is Alan Beale's — 12dicts is distributed from
Atkinson's site, which is where that gets confused — and both state their terms inside the
archive rather than by reference. Only the 12dicts lists that are genuinely public domain are used: `2of12inf`
and the Lemmatized `2+2+3` lists derive from AGID, which the 12dicts ReadMe says prevents
their release, so Poodl does not read them.

The SCOWL and 12dicts curation took nothing whose licence could not be read: not the ENABLE
list as commonly mirrored, which travels without a licence file and is described by its
mirror as a version of a dictionary whose name is a trademark; not any frequency table
derived from the Google Web Trillion Word Corpus, which the Linguistic Data Consortium
distributes under terms of its own; and not the word lists of any commercial word game. The
maintainer-supplied lists that now sit on top of it do not meet that bar, and this page
does not pretend they do. Their origin was not recorded by the tool that produced them, and
the guess list is the size of at least one commercial word game's published dictionary.
That is a recorded risk, not a resolved provenance. If the origin is ever established,
write it here and in `static/word-lists-NOTICE.txt`. If it turns out to carry terms Poodl
cannot meet, `answers.txt` can be re-curated freely — back to `answers-scowl.txt`, for
one — but withdrawing words from `guesses.txt` would breach the append-only obligation
below, and that trade-off is a decision to take then, in the open, not one this page
pre-empts.

The shipped answer list is the maintainer-supplied easier list, trimmed by hand before it
was sorted: duplicates and entries that were not five letters were dropped, as were one
trademark (`skype`, which no dictionary here holds), fifteen words too obscure to call
familiar — `agaze`, `aimer`, `airts`, `areal`, `blent`, `breve`, `bruit`, `clave`, `donee`,
`drupe`, `eclat`, `plasm`, `resew`, `thane` and `tromp` — and one ethnic slur, `gypsy`,
which the supplied list carried and the block list described below has always kept out of
`answers-scowl.txt`. A losing player is shown the answer, so the answer pool is where that
judgement has to be made; `gypsy` stays in `guesses.txt`, where it already was before this
list arrived, because that file is append-only. It can still be typed, and is simply never
drawn. Plain inflections such as `acids` and `tried` were deliberately kept.

`answers-scowl.txt` was filtered differently, for familiarity by rule: a word reached it
only if two independent judgements called it common, and proper nouns, abbreviations,
contractions, plain inflections of shorter words, and an explicit block list of slurs were
all excluded. The guess dictionary keeps everything, as `words.allium` says it should: it
is the union of every list it has ever been given.

That split is deliberate, and it is the whole of the policy. A slur is kept out of
`answers.txt` because a losing player is shown the answer and never chose to see it. The
same word stays in `guesses.txt` because a player who types a real word should not be told
it is not one, and because the append-only obligation means anything the dictionary has
ever carried stays. Curating the answer pool is therefore the only lever; expect the
dictionary to hold words the answer pool would never show.

Hand-editing word data is legitimate in exactly two places. The first is that block list,
and the same judgement applied by hand when a supplied list arrives without one — the
question is editorial rather than lexical, and it is not a profanity filter. The second
is `poodl` itself, which appears in neither upstream collection: it is `config.game_name`,
its provenance is the specification rather than a dictionary, and it is added by hand to
both files after the upstream lists have been normalised and sorted.

## The obligations

From the `WordListSource` contract in [`words.allium`](../specs/words.allium):

- Every entry is exactly five letters, lowercase, English alphabet only.
- Neither list contains the same word twice.
- Every word in `answers.txt` also appears in `guesses.txt`. A player must be able to
  type the answer.
- The answer list is curated for familiarity — a losing player should recognise the word.
  The guess dictionary carries no such obligation and is expected to hold obscure words.
- **Every supply includes `config.game_name`** — `poodl` — in `answers.txt`, and therefore
  in `guesses.txt`. It is the only word any specification names, and
  `GameNameIsInTheAnswerList` makes it an ordinary answer: drawable, typable, and sendable
  as a custom link. Curation is otherwise free, but it may not drop this one entry.
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

5. Add the game's own name back, in both files. No upstream collection carries it, so a
   fresh pair of lists will not have it and `tests/words.test.ts` will say so:

   ```console
   printf 'poodl\n' >> src/lib/data/answers.txt
   printf 'poodl\n' >> src/lib/data/guesses.txt
   sort -u -o src/lib/data/answers.txt src/lib/data/answers.txt
   sort -u -o src/lib/data/guesses.txt src/lib/data/guesses.txt
   ```

6. Run `just frontend-unit`, then `just check`.

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
