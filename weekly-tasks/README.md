# Weekly tasks — why these five

These are five tasks I produced during the unit (Weeks 3–7), copied here unaltered apart from removing
build junk (`__pycache__`, `.vscode`). Together they trace the path from *an interaction becoming a
record* to *a record becoming a rule* — which is the path the final prototype follows through an age gate.

| Week | Folder | What I did | Why it matters to the final project |
|---|---|---|---|
| 3 | `week-3` | Built a click recorder that writes each interaction as JSON, then parsed it in Python (`parsing.py`, `parsing_annotated.py`) and wrote up what the data could and could not show (`task3_observations.md`) | This is the mechanism an age gate hides: an event becomes a row with a timestamp. Doing it by hand showed me that the record is created *before* the interface tells you anything about it. |
| 4 | `week-4` | Worked with the RefugeeDataMinder archive: indexed records with an analytical framing, answered the set questions in `README_answers.md` | Archives classify before they describe. The age-gate dataset has the same property: the only fields it keeps are decision, method and timestamp — the person's own account is never a field. |
| 5 | `week-5` | Data walk: located data centres, pulled Street View images, and analysed them in Python (`part1.py`, `part2.py`, 28 KB write-up) | Infrastructure has an address. The evaluator in the prototype is not a cloud — it is a building with a retention policy. |
| 6 | `week-6` | Built the Flask news-search exercises: basic search → sorting → relevance score → date and text filters | Ranking is a rule with coefficients. An age estimate is the same operation applied to a face instead of a headline. |
| 7 | `week-7` | Analysis of the Cambridge Analytica / BHWIBR prototypes (`analysis/analyse.py`) and a journey diagram (`journey.json`) | The two-view structure of my prototype comes directly from this exercise: default view, then a reworked view that reveals what the first one left invisible. |

## Why not Week 1, 2, 8 or 9

Week 1–2 were set-up exercises (publish a page, install Anaconda) and Week 8–9 were prototype tutorials
built on the unit's example repositories. They did not produce a dataset or an argument of my own, so
they would not show how the final project was arrived at.

## Where the originals live

Unchanged originals remain at `Term-1/Critical-Coding-Practices/week-3` … `week-7` in this repository.
These copies exist so the submitted folder is self-contained.
