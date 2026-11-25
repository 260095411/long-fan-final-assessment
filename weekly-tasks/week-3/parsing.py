import json
import csv

# ---------------------------------------------------------------
# Task 3: experiments with the CSV / JSON datasets generated from
# the webpage (user_interactions.csv, user_interactions.json)
# ---------------------------------------------------------------

# ---------- 1. json.load(): JSON file -> Python list of dicts ----------
with open("user_interactions.json", "r", encoding="utf-8") as file:
    records = json.load(file)

print("JSON: total records =", len(records))
print("First record (Python dict):", records[0])

# ---------- 2. csv.reader(): CSV -> list of plain lists (all strings) ----------
with open("user_interactions.csv", "r", newline="", encoding="utf-8") as f:
    rows = list(csv.reader(f))

print("\ncsv.reader() header row:", rows[0])
print("csv.reader() first data row (plain list):", rows[1])

# ---------- 3. csv.DictReader(): CSV -> list of dicts (named columns) ----------
with open("user_interactions.csv", "r", newline="", encoding="utf-8") as f:
    csv_records = list(csv.DictReader(f))

# CSV reads everything as text, so click_count must be converted to int
for rec in csv_records:
    rec["click_count"] = int(rec["click_count"])

print("\ncsv.DictReader() first record (dict):", csv_records[0])

# ---------- 4. Original filtering condition: click_count >= 3 ----------
filtered = []
for r in records:
    if r["click_count"] >= 3:
        filtered.append(r)

print("\nOriginal condition click_count >= 3 ->", len(filtered), "records")

# ---------- 5. Modified filtering condition: click_count >= 6 ----------
# Change: raise the threshold from 3 to 6 and observe how many records remain.
filtered_new = []
for r in records:
    if r["click_count"] >= 6:
        filtered_new.append(r)

print("Modified condition click_count >= 6 ->", len(filtered_new), "records")
for r in filtered_new:
    print("   -", r["action"], r["click_count"], r["review_status"])

# A second, categorical alternative: keep only the 'comment' action
comments = []
for r in records:
    if r["action"] == "comment":
        comments.append(r)

print("Alternative condition action == 'comment' ->", len(comments), "records")

# ---------- 6. Moderation: compare 'approved' vs 'flagged' ----------
# 6a. Split ALL records
approved_all = []
flagged_all = []
for r in records:
    if r["review_status"] == "approved":
        approved_all.append(r)
    else:
        flagged_all.append(r)

print("\nAll records -> approved:", len(approved_all), "| flagged:", len(flagged_all))

# 6b. Breakdown per action
for action in ["like", "share", "comment"]:
    a = 0
    fl = 0
    for r in records:
        if r["action"] == action:
            if r["review_status"] == "approved":
                a += 1
            else:
                fl += 1
    print(f"   {action}: approved = {a}, flagged = {fl}")

# 6c. Split inside the original >= 3 filter
approved_data = []
flagged_data = []
for r in filtered:
    if r["review_status"] == "approved":
        approved_data.append(r)
    else:
        flagged_data.append(r)

print("Inside click_count >= 3 -> approved:", len(approved_data), "| flagged:", len(flagged_data))

# ---------- 7. Sorting: .sort() vs sorted() on the same list ----------
count_list = [1, 5, 2, 4, 3]
original = count_list.copy()

# sorted() builds and returns a NEW list; the original stays untouched
sorted_new = sorted(count_list)
print("\nBefore sorting:", original)
print("sorted() result (new list):", sorted_new)
print("Original after sorted():", count_list, "<- unchanged")

# .sort() rearranges the original list IN PLACE and returns None
count_list.sort()
print("Original after .sort():", count_list, "<- changed in place")
