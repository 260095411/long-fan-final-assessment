# Task 3 — Small Explained Comparison of Observations

Data: `user_interactions.csv` and `user_interactions.json` generated from the
week-3 webpage (25 records: 8 `like`, 9 `share`, 8 `comment`).
All numbers below come from running `parsing.py` on these files.

## 1. CSV & JSON Parsing: `csv.reader()`, `csv.DictReader()`, `json.load()`

| Method | File | What Python gives you | First row looks like |
|---|---|---|---|
| `csv.reader()` | CSV | A **list of plain lists**; every value stays a **string**; you access fields by position (`row[0]`, `row[1]`) | `['like', '1', '2026-10-15T13:55:55.238Z', 'flagged']` |
| `csv.DictReader()` | CSV | A **list of dictionaries**; the header row becomes the keys (`rec["action"]`, `rec["click_count"]`); values are still strings, so `click_count` must be converted with `int()` | `{'action': 'like', 'click_count': 1, ...}` |
| `json.load()` | JSON | A **Python list** directly; each JSON object already becomes a **dict**, and numbers keep their type (`click_count` is already an `int`, no conversion needed) | `{'action': 'like', 'click_count': 1, ...}` |

**JSON → Python mapping:**
- A JSON **Array** `[ ... ]` becomes a Python **List** (`[]`).
- A JSON **Object** `{ ... }` becomes a Python **Dictionary** (`{}`, key:value pairs).
- JSON numbers stay numbers, JSON strings stay strings.

Observation: `csv.reader()` is the lowest level (you count columns by hand),
`csv.DictReader()` names the columns so code reads like `rec["action"]`, and
`json.load()` skips the string-conversion step because the JSON already carries
typed values.

## 2. Modify the Filtering Condition

Original condition `click_count >= 3` (the running total per action):

| Condition | Records kept |
|---|---|
| `click_count >= 3` (original) | 19 |
| `click_count >= 6` (raised threshold) | 10 |
| `action == "comment"` (categorical alternative) | 8 |

Observation: raising the threshold from `>= 3` to `>= 6` halves the result
(19 → 10) because only the later, higher-count clicks survive. Switching from a
numeric threshold to a category filter (`action == "comment"`) changes the
question completely: instead of "how many clicks are frequent enough", it asks
"which records belong to one type of button", and returns exactly the 8 comments.

## 3. Moderation: `approved` vs `flagged`

Over **all 25 records**: approved = 10, flagged = 15.

| Action | approved | flagged |
|---|---|---|
| like | 2 | 6 |
| share | 3 | 6 |
| comment | 5 | 3 |
| **Total** | **10** | **15** |

Inside the original `click_count >= 3` filter (19 records): approved = 8,
flagged = 11.

Observation: more records are `flagged` than `approved` overall (15 vs 10),
and the mix differs by action — comments lean `approved` (5 vs 3), while likes
lean `flagged` (6 vs 2). Note that `review_status` in this exercise is a random
classroom label (`Math.random()` in `script.js`), not a real moderation decision;
the split only shows how a moderation layer categorises records before analysis.

## 4. Sorting Methods: `.sort()` vs `sorted()`

Using the same list `[1, 5, 2, 4, 3]`:

- `sorted(count_list)` builds and returns a **new sorted list**; the original
  list is untouched (`[1, 5, 2, 4, 3]` stays `[1, 5, 2, 4, 3]`).
- `count_list.sort()` rearranges the **original list in place** and returns
  `None`; the original becomes `[1, 2, 3, 4, 5]`.

Observation: use `sorted()` when you need to keep the original order for later;
use `.sort()` when you only need the sorted version and do not mind losing the
original order.

## 5. How to run

1. Open the `week-3` folder in VS Code.
2. In the terminal: `python parsing.py`
3. Compare the printed counts with this note, then commit and push to GitHub.
