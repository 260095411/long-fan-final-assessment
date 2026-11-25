# Week 4 Workshop — Questions & Responses

---

## Q1. How many columns does this dataset have?

The dataset contains **21 columns** and 36 rows:

1. Category
2. NO
3. Question
4. Answer
5. Procedure/Process
6. Rights/Specifications
7. UNHCR Narrative
8. UNHCR Narrative Tag
9. Counter Narrative-Testimony
10. Counter-Narrative Author
11. Counter-narrative Tag
12. ` Inconsistency Gapminder` (with leading space)
13. Coverage (Time)
14. Coverage Location (Country of Origin)
15. Coverage (Location Country of Asylum)
16. Counter-Narrative - Scholarship/Advocacy
17. Unique Identifier
18. Keys
19. Box Server (Link)
20. Creator
21. Access

---

## Q2. Under which column would we find the personal stories of refugees?

Personal testimonies are found in the **`Counter Narrative-Testimony`** column.

To print the content of a specific testimony:

```python
# Print the first testimony
print(db.loc[0, "Counter Narrative-Testimony"])

# Loop through and print all testimonies
for i, row in db.iterrows():
    print(f"--- Record {i + 1} ---")
    print(row["Counter Narrative-Testimony"])
    print()
```

---

## Q3. What other columns should you look at to understand the Inconsistency Gapminder, and why?

The Inconsistency Gapminder column marks a divergence between the official UNHCR account and lived experience. To understand what that divergence *is*, you need to read both sides:

| Column | Purpose |
|---|---|
| `Rights/Specifications` | The official legal framework — what rights are formally supposed to exist |
| `UNHCR Narrative` | UNHCR's official account of the situation on the ground |
| `Counter Narrative-Testimony` | The lived experience of refugees and aid workers — the counter-archive perspective |
| `UNHCR Narrative Tag` / `Counter-narrative Tag` | Keywords that reveal how each side frames the same issue |
| `Question` | The research question that this gap responds to |

Without reading the UNHCR narrative and the counter-narrative side by side, the Gapminder annotation is just a label — you cannot see *what* the inconsistency actually consists of.

---

## Q4. What code is needed to view the actual contents of a testimony?

Following the loop structure introduced in Step 3:

```python
results = db.head(5).to_dict(orient="records")

for record in results:
    print("Question:", record["Question"])
    print("Testimony:", record["Counter Narrative-Testimony"])
    print("Author:", record["Counter-Narrative Author"])
    print()
```

Alternatively, using pandas directly:

```python
print(db["Counter Narrative-Testimony"].iloc[0])
```

---

## Q5. How would you show the number of records in each Category?

Using `COUNT()` and `GROUP BY()`:

```sql
SELECT Category, COUNT(*) AS total_records
FROM counter_narratives
GROUP BY Category
ORDER BY total_records DESC;
```

Results from the dataset:

| Category | Number of Records |
|---|---|
| Conditions in the Country of Asylum | 9 |
| Universal Refugee Category | 8 |
| (missing / NaN) | 6 |
| Decision Making | 6 |
| Durable Solutions | 5 |
| UNHCR's Mandate | 2 |

---

## Q6. How can you write a query for a different Category? What differences do you see in the counter-narratives?

Example query for the "Durable Solutions" category:

```sql
SELECT Category, Question, Counter_Narrative, Author
FROM counter_narratives
WHERE Category = 'Durable Solutions';
```

This returns 5 records. The counter-narratives in this category address resettlement, repatriation, and local integration — and consistently reveal gaps between official policy and practice:

- UNHCR lacks an integrated data system for resettlement ("UNHCR's Data Problem")
- Verification exercises in Dadaab camp did not match reality on the ground
- Repatriation is described as "voluntary" but is experienced as pressured
- Returns to South Sudan did not deliver the protection promised
- Filipino Muslim refugees in Sabah are "lost in numbers" — invisible in official statistics

Across these testimonies, the official framing of "durable solutions" as a completed process contrasts sharply with the lived experience of people who remain unprotected or displaced.

---

## Q7. What does a NaN in the Category field imply about the record?

Six rows have a missing (NaN) Category. In these rows, the `Question` field is also blank, but the `Counter Narrative-Testimony` column still contains substantial content — for example, "Compromising the Protection Mandate for Funding," "Is Repatriation Really Voluntary?," and "LGBTQI as a Specific Need."

This suggests that these records are **supplementary or ad-hoc testimonies** that were added to the archive without being formally categorised. The absence of a Category is itself an archival observation:

1. The database's own classification system cannot accommodate every testimony.
2. Some voices end up "unclassified" — a small-scale version of the larger archival gaps the project critiques.
3. It raises the question of what else might be missing or unrecorded that the archive's structure does not even permit us to see.

---

## Q8. How does the Counter_Narrative provide more context to the Question than the Answer itself?

The `Answer` column contains UNHCR's official legal definition — for example, the standard definition of asylum based on the 1951 Convention. It is abstract, universal, and idealised.

The `Counter_Narrative` column contains lived experience — specific accounts from Ceren Yuksel, Benjamin, and others about what actually happens: verification exercises that fail, repatriation that is not genuinely voluntary, LGBTQI refugees who fall through institutional cracks.

Where the Answer describes a smooth, universal legal process, the Counter_Narrative reveals that outcomes depend on context: which camp, which officer, which country of asylum, and which institutional priorities are in play. The counter-narrative does not simply repeat the official definition — it supplies the detail, contradiction, and situated experience that the legal definition leaves out.

---

## Q9. How can you identify gaps between the UNHCR narrative and the Counter Narrative without using the InconsistencyGapMinder column?

The Gapminder column is a human-written annotation pointing to an inconsistency. To identify gaps independently, we can compare the two narratives directly:

### Approach 1 — Compare length and depth

Where the counter-narrative is substantially longer or more detailed than the UNHCR narrative, it likely contains information that the official account omits.

```python
for i, row in db.iterrows():
    unhcr_len = len(str(row["UNHCR Narrative"])) if pd.notna(row["UNHCR Narrative"]) else 0
    counter_len = len(str(row["Counter Narrative-Testimony"])) if pd.notna(row["Counter Narrative-Testimony"]) else 0

    if counter_len > unhcr_len * 2:
        print(f"Potential gap at row {i}:")
        print(f"  UNHCR narrative: {unhcr_len} chars")
        print(f"  Counter-narrative: {counter_len} chars")
```

### Approach 2 — Compare tags

Where UNHCR Narrative Tags and Counter Narrative Tags frame the same issue in different terms (for example, "Tech for Good" versus "Data Problem"), the mismatch itself indicates a gap in framing.

```sql
SELECT
    UNHCR_Narrative_Tag,
    Counter_Narrative_Tag,
    COUNT(*) AS total
FROM my_subset
GROUP BY UNHCR_Narrative_Tag, Counter_Narrative_Tag
ORDER BY total DESC;
```

### Approach 3 — Look for absences

Identify topics that appear in counter-narratives (e.g. LGBTQI-specific needs, funding pressures on protection) but are absent from the UNHCR narrative entirely.

### Reflection

The exercise demonstrates that archival gaps are not always labelled in advance. Learning to spot them — by comparing framing, length, keywords, and presence/absence — is the critical move that the Gapminder annotation was designed to make visible in the first place.
