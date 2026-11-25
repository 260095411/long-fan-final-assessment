# Workshop 4 | Structuring Meaning: From Data to Database

Today we’ll learn how structured data defines what can be known and what can’t.  
We’ll explore how a dataset (from *Refugee Data Minder*) turns lived experiences into queryable tables.

You’ll learn:
- How to load structured data from Excel
- How to simulate a database inside Python
- How to query that data with SQL
- How to critical reflect on what is gained and lost through structure

**In**

```python
!pip install pandas openpyxl
```

**Out**

```text
Requirement already satisfied: pandas in /opt/homebrew/Caskroom/miniforge/base/lib/python3.12/site-packages (2.3.3)
Requirement already satisfied: openpyxl in /opt/homebrew/Caskroom/miniforge/base/lib/python3.12/site-packages (3.1.5)
ERROR: Could not find a version that satisfies the requirement sqlite3 (from versions: none)
ERROR: No matching distribution found for sqlite3
Installation output depends on your environment. pandas and openpyxl must be available before continuing.
```

**In**

```python
# Import our core libraries
import pandas as pd
import sqlite3
import openpyxl

# Create an in-memory database (temporary)
conn = sqlite3.connect(':memory:')

# Quick reminder: SQLite runs locally — no server, no saving.
# In real systems, this would be something like PostgreSQL.
```


## Step 1: Load the Dataset

Our data comes from the *Refugee Data Minder* archive.  
Each row represents a testimony or counter-narrative, and each column adds metadata:  
category, country, rights, or process.

We’ll load the **Database** sheet from the Excel file.

**In**

```python
# Load the "Database" sheet from the Excel file
db = pd.read_excel("dataset/03 Archival Indexing with Analytical Framing Approach (5.2.2).xlsx",
                   sheet_name="Database")

# Preview first 3 rows
display(db.head(3))
```

**Out (excerpt)**

```text
                  Category  NO                 Question                                                                                                                                                                  ...
Universal Refugee Category   1      What is asylum?\n\n If you are outside your country of origin and are afraid to return because you fear serious harm due to your race, religion, nationality, political opinion, or m...
Universal Refugee Category   2 Who is an asylum seeker?                                                                                                                                                                  ...
Universal Refugee Category   3        Who is a refugee?                                                                                                                                                                  ...
None
```

## Step 2: Inspect the Columns

Let’s look at what information this dataset contains.
Each column represents a different *dimension of meaning* or metadata.

**In**

```python
db.columns.tolist()
```

**Out(excerpt)**

```text
['Category', 'NO', 'Question', 'Answer', 'Procedure/Process', 'Rights/Specifications', 'UNHCR Narrative', 'UNHCR Narrative Tag', 'Counter Narrative-Testimony', 'Counter-Narrative Author', 'Counter-narrative Tag', ' In...
```

##  Step 3:Looping results

A loop lets us process each result one at a time. Here we use the first three Excel records already loaded in Step 1. These are Python dictionaries, not SQL query results: the SQL tables will be created later.

Convert the preview into a list of records, then use a for loop to print the question and author from each record.

Try changing head(3) to head(5). How many times does the loop run?

**In**

```python
results = db.head(3).to_dict(orient="records")

for record in results:
    print("Question:", record["Question"])
    print("Author:", record["Counter-Narrative Author"])
    print()
```

**Out**

```text
Question: What is asylum?


Author: nan

Question: Who is an asylum seeker?
Author: Ceren Yuksel

Question: Who is a refugee?
Author: Ceren Yuksel
```

## Step 4: Select the Key Fields

We’ll focus on a few fields that capture both structure and narrative:
- Category
- Question
- Answer
- Counter Narrative-Testimony
- Counter-Narrative Author
- Coverage (Location Country of Asylum)

We’ll rename them slightly to make them easier to work with in code.

**In**

```python
subset = db[[
    "Category",
    "Question",
    "Answer",
    "Counter Narrative-Testimony",
    "Counter-Narrative Author",
    "Coverage (Location Country of Asylum)"
]].rename(columns={
    "Counter Narrative-Testimony": "Counter_Narrative",
    "Counter-Narrative Author": "Author",
    "Coverage (Location Country of Asylum)": "Country_Asylum"
})

display(subset.head(3))
```

**Out (excerpt; long output shortened)**

```text
                  Category                 Question                                                                                                                                                                      ...
Universal Refugee Category      What is asylum?\n\n If you are outside your country of origin and are afraid to return because you fear serious harm due to your race, religion, nationality, political opinion, or membe...
Universal Refugee Category Who is an asylum seeker?                                                                                                                                                                      ...
Universal Refugee Category        Who is a refugee?                                                                                                                                                                      ...
None
```

## Step 5: Create Tables in Memory

Now let’s treat this structured data as a database.
We’ll create two tables — `questions` and `counter_narratives` — that mirror the structure in the dataset.

**In**

```python
# SQL DEMO — Step 4: Create Tables in Memory
# SELECT chooses the schema fields to display; WHERE keeps table entries.

# Save as SQL tables inside our SQLite connection
subset.to_sql("counter_narratives", conn, index=False, if_exists="replace")

# We'll simulate a smaller "questions" table derived from unique Question/Category pairs
questions = subset[["Category", "Question", "Answer"]].drop_duplicates().reset_index(drop=True)
questions["Question_ID"] = questions.index + 1
questions.to_sql("questions", conn, index=False, if_exists="replace")

pd.read_sql("SELECT name FROM sqlite_master WHERE type='table';", conn)
```

**Out**

```text
              name
counter_narratives
         questions
```

Each table now represents a **relational structure**:
- `questions`: holds the categories, questions, and answers.
- `counter_narratives`: holds the testimonies, authors, and countries.

They’re linked conceptually by the question text, just like how relational keys connect entities.

## Step 6: Writing Your First Query

A **query** is a structured question to a system.  
Let’s ask:  
> “Show me all counter-narratives in the *Legal* category.”

**In **

```python
# SQL FOCUS — Step 6: Writing Your First Query
# SELECT: choose Category, Question, Counter_Narrative and Author.
# WHERE: keep rows whose Category is Durable Solutions.

query1 = """
SELECT Category, Question, Counter_Narrative, Author
FROM counter_narratives
WHERE Category = 'Durable Solutions';
"""
pd.read_sql(query1, conn)
```

**Out (excerpt; long output shortened)**

```text
         Category                      Question                                                                                                                                                                          ...
Durable Solutions        What is  resettlement? UNHCR's Data Problem\n\nUNHCR does not have an integrated system to know what data to use, how to source, how to assemble and assess the validity of the data it collects...
Durable Solutions Can I apply for resettlement?                                                                                                                                                                          ...
Durable Solutions         What is repatriation?                                                                                                                                                                          ...
Durable Solutions                          None                                                                                                                                                                          ...
Durable Solutions    What is local Integration?                                                                                                                                                                          ...
```

## Mini-Exercise

Every query encodes assumptions:
- What counts as “data”
- What categories are available
- Who has permission to ask and interpret

Try modifying your query to filter by **Country_Asylum** or **Category** and see what changes.

**In**

```python
# Write here
```

**Out**

```text
# Write here
```

## Step 7: Counting as Abstraction

Let’s see how many counter-narratives exist per category.
Counting is a form of *abstraction*: it reveals patterns but hides detail.

**In**

```python
# SQL FOCUS — Step 6: Counting as Abstraction
# SELECT: choose the category and calculated count.
# COUNT(*): count rows in each group, including rows with no narrative text.
# GROUP BY: form one group for each Category value.
# ORDER BY ... DESC: show larger counts first.

query3 = """
SELECT Category, COUNT(*) AS total_narratives
FROM counter_narratives
GROUP BY Category
ORDER BY total_narratives DESC;
"""
pd.read_sql(query3, conn)
```

**Out**

```text
                           Category  total_narratives
Conditions in the Country of Asylum                 9
         Universal Refugee Category                 8
                    Decision Making                 6
                               None                 6
                  Durable Solutions                 5
                    UNHCR's Mandate                 2
```

## Step 8: Joining Tables

Now we’ll connect our two tables.  
In SQL, a `JOIN` merges data from related tables through a shared key or field.

Here we’ll connect questions with their corresponding counter-narratives.

**In**

```python
# SQL FOCUS — Step 8: Joining Tables
# SELECT: choose output fields from q (questions) and c (counter_narratives).
# JOIN ... ON: match the two tables using their Question text.
# LIMIT 5: return at most five joined rows. Without ORDER BY, their order is not guaranteed.

query4 = """
SELECT q.Category, q.Question, q.Answer, c.Counter_Narrative, c.Author, c.Country_Asylum
FROM questions q
JOIN counter_narratives c
ON q.Question = c.Question
LIMIT 5;
"""
pd.read_sql(query4, conn)
```

**Out(excerpt; long output shortened)**

```text
                  Category                                                    Question                                                                                                                                   ...
Universal Refugee Category                                         What is asylum?\n\n                                                                                                                                   ...
Universal Refugee Category                                    Who is an asylum seeker?                                                                                                                                   ...
Universal Refugee Category                                           Who is a refugee?                                                                                                                                   ...
Universal Refugee Category What is the difference between a refugee and asylum seeker?                                                                                                                                   ...
Universal Refugee Category   What is the difference between "refugees" and "migrants"? Migrants leave voluntarily, seeking a better quality of life. They can return to their country of origin without risks and have th...
```

### Reflection: What Queries Hide

When we query by predefined categories:
- Whose stories appear?
- Whose disappear?
- What does structure make visible, and what does it erase?

The Refugee Data Minder interface uses similar queries behind its filters.
The code you’ve written today is the invisible logic behind what users see.

**In**

```python
# Convert one record to a JSON-style format (as the interface might show it)
example = pd.read_sql(query4, conn).to_dict(orient="records")[0]
example
```

**Out(excerpt; long output shortened)**

```text
{'Category': 'Universal Refugee Category', 'Question': 'What is asylum?\n\n', 'Answer': "If you are outside your country of origin and are afraid to return because you fear serious harm due to your race, religion, nat...
```

## Step 9: From Query to Interface

When you interact with an archive like Refugee Data Minder:
- Dropdown filters are visual *queries*.
- The backend database determines what can be retrieved.
- The interface defines what becomes visible.
