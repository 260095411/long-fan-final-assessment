# Weekly tasks — why these five

The unit asks for five selected weekly tasks, plus a short explanation of their relevance to the
project. Each folder is self-contained: open `index.html` in a browser, or run the Python file.

| Week | Task | What it does | Why this one |
|---|---|---|---|
| 2 | `week-2-click-counter` | One button, one event listener, one count | The smallest unit of the final prototype: an interaction being counted. Everything an age gate does begins with an event being recorded. |
| 3 | `week-3-record-clicks` | Each click becomes a record with a timestamp, persisted in `localStorage`, exportable as JSON and CSV | The data layer the prototype describes: a decision written down. Doing it by hand made clear that a record is created by the code, not by the interface. |
| 3 | `week-3-python-analysis` | Reads a CSV of simulated gate attempts, filters refusals, sorts them, and counts by method | Shows the limit of the data: a refusal rate is not an error rate. The dataset records what the gate decided, never whether it was right — which is the report's central uncertainty. |
| 6 | `week-6-ranked-search` | Eight items ranked by adjustable weights (recency, engagement, source) | Where the "threshold" idea came from. A weighted rule produces a decision that looks like a fact; an age estimate is the same operation with a different input. |
| 7 | `week-7-gate-wireframe` | HTML wireframe of the two gate arrangements | The Week 7 wireframing exercise, applied to this project. Drawing both frames side by side exposed the shared silence: neither frame shows a refusal route or a stored record. |

## What I would do differently

The Week 5 data-walk exercise (Street View images of a data centre) is not included because the
images could not be reproduced in the repository without re-hosting third-party content. The
argument it supported — that infrastructure has a physical address — is carried in the report
instead, through the evaluator's storage step rather than through a photograph.
