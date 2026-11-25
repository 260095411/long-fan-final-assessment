"""Week 3 exercise 5 — read, filter and sort a recorded dataset.

Input:  sample_gate_attempts.csv (simulated data, made for this task)
Output: printed summary + groupby_methods.csv + refusals.csv

Standard library only: no pandas needed, so the file runs anywhere.
Run with:  python analyse_records.py
"""

import csv
from collections import Counter

INPUT = "sample_gate_attempts.csv"

# ---------------------------------------------------------------- 1. read
rows = []
with open(INPUT, newline="", encoding="utf-8") as handle:
    reader = csv.DictReader(handle)
    for row in reader:
        rows.append(row)

print(f"rows read: {len(rows)}")

# ---------------------------------------------------------------- 2. filter
# Take only the refusals: the people the gate turned away.
refusals = [r for r in rows if r["decision"] == "denied"]
print(f"refusals:   {len(refusals)}")

# Take only adults: the group where a refusal is an error, not a correct answer.
adults_refused = [r for r in refusals if int(r["true_age"]) >= 18]
print(f"adults refused (false negatives): {len(adults_refused)}")

# ---------------------------------------------------------------- 3. sort
# Sort every row by timestamp, oldest first.
rows_sorted = sorted(rows, key=lambda r: r["timestamp"])

# Sort refusals by how far the estimate was from the threshold.
refusals_sorted = sorted(refusals, key=lambda r: int(r["estimated_age"]))

# ---------------------------------------------------------------- 4. count
by_method = Counter(r["method"] for r in rows)
by_method_refused = Counter(r["method"] for r in refusals)

print("\nattempts by method:")
for method, total in by_method.most_common():
    refused = by_method_refused.get(method, 0)
    rate = (refused / total) * 100
    print(f"  {method:22s} {total:3d} attempts  {refused:3d} refused  ({rate:.0f}%)")

print("\nrefusals, sorted by estimated age (lowest first):")
for r in refusals_sorted[:8]:
    print(f"  {r['timestamp']}  method={r['method']:22s} estimated={r['estimated_age']:>2}  true={r['true_age']:>2}")

# ---------------------------------------------------------------- 5. write
with open("refusals.csv", "w", newline="", encoding="utf-8") as handle:
    writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(refusals_sorted)

with open("groupby_methods.csv", "w", newline="", encoding="utf-8") as handle:
    writer = csv.writer(handle)
    writer.writerow(["method", "attempts", "refused", "refusal_rate_percent"])
    for method, total in by_method.most_common():
        writer.writerow([method, total, by_method_refused.get(method, 0),
                         round(by_method_refused.get(method, 0) / total * 100, 1)])

print("\nwrote refusals.csv and groupby_methods.csv")

# ---------------------------------------------------------------- reflection
# What this shows: a refusal rate is not the same as an error rate.
# A high refusal rate can be correct (many children) or wrong (many adults
# without the required document). The CSV cannot tell us which, because the
# gate never records who was right — only what it decided.
