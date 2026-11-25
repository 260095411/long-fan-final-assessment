# %% Setup | Install dependencies
# Run this once in your terminal before opening the script:
# python -m pip install pandas openpyxl
# sqlite3 is included with Python.
# Run the script with this folder as your working directory.

<<<<<<< HEAD
=======

>>>>>>> b45b5b5e4b6bc6c82588fd1cad7f3e78b3273168
# %% Setup | Libraries and in-memory database
# Import our core libraries
import pandas as pd
import sqlite3
import openpyxl

# Create an in-memory database (temporary)
conn = sqlite3.connect(':memory:')

# Quick reminder: SQLite runs locally — no server, no saving.
# In real systems, this would be something like PostgreSQL.


# %% Step 1: Load the Dataset
# Load the "Database" sheet from the Excel file
<<<<<<< HEAD
db = pd.read_excel("03 Archival Indexing with Analytical Framing Approach (5.2.2).xlsx",
=======
db = pd.read_excel("dataset/03 Archival Indexing with Analytical Framing Approach (5.2.2).xlsx",
>>>>>>> b45b5b5e4b6bc6c82588fd1cad7f3e78b3273168
                   sheet_name="Database")

# Preview first 3 rows
print(db.head(3))

#Print all column names
print(db.columns)

# %% Step 2: Inspect the Columns
print(db.columns.tolist())



# %% Step 3: Looping 
results = db.head(10).to_dict(orient="records")

for record in results:
    print("Question:", record["Question"])
    print("Author:", record["Counter-Narrative Author"])
    print()


# %% Step 4: Select the Key Fields
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

print(subset.head(3))

#reveal all its contents for the first 3 records
for i, row in subset.head(3).iterrows():
    print(f"\n--- Record {i + 1} ---")
    print(f"Category: {row['Category']}")
    print(f"Question: {row['Question']}")
    print(f"Answer: {row['Answer']}")
    print(f"Counter-narrative: {row['Counter_Narrative']}")
    print(f"Author: {row['Author']}")
    print(f"Country of asylum: {row['Country_Asylum']}")
    

# %% Step 5: Create Tables in Memory
# SELECT chooses the schema fields to display; WHERE keeps table entries.

# Save as SQL tables inside our SQLite connection
subset.to_sql("counter_narratives", conn, index=False, if_exists="replace")

# We'll simulate a smaller "questions" table derived from unique Question/Category pairs
questions = subset[["Category", "Question", "Answer"]].drop_duplicates().reset_index(drop=True)
questions["Question_ID"] = questions.index + 1
questions.to_sql("questions", conn, index=False, if_exists="replace")


#print the two tables we've just created
print(pd.read_sql("SELECT name FROM sqlite_master WHERE type='table';", conn))


# %% Step 6: Writing Your First Query
#Get the names of all the unique categories from the "counter_narratives" table
query_categories = """
SELECT DISTINCT Category
FROM counter_narratives
ORDER BY Category;
"""

categories = pd.read_sql(query_categories, conn)

print("Categories in the database:")
for i, category in enumerate(categories["Category"], 1):
    print(f"{i}. {category}")
print("\n")

# %% Step 7 Find all Durable Solutions records
# Get all records whose category is "Durable Solutions" 
# SELECT: choose Category, Question, Counter_Narrative and Author.
# WHERE: keep rows whose Category is Durable Solutions.

query1 = """
SELECT Category, Question, Counter_Narrative, Author
FROM counter_narratives
WHERE Category = 'Durable Solutions';
"""
print(pd.read_sql(query1, conn))

#reveal all its contents
results = pd.read_sql(query1, conn)
for i, row in results.iterrows():
    print(f"\n--- Record {i + 1} ---")
    print(f"Category: {row['Category']}")
    print(f"Question: {row['Question']}")
    print(f"Counter-narrative: {row['Counter_Narrative']}")
    print(f"Author: {row['Author']}")
    
# %% Step 8: Counting Categories
# SELECT: choose the category and calculate the count.
# COUNT(*): count rows in each group, including rows with no narrative text.
# GROUP BY: form one group for each Category value.
# ORDER BY ... DESC: show larger counts first.

query3 = """
SELECT Category, COUNT(*) AS total_narratives
FROM counter_narratives
GROUP BY Category
ORDER BY total_narratives DESC;
"""
print(pd.read_sql(query3, conn))


# %% Step 9: Joining Tables
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
print(pd.read_sql(query4, conn))

#reveal its full contents 
results = pd.read_sql(query4, conn)
for i, row in results.iterrows():
    print(f"\n{'=' * 70}")
    print(f"RECORD {i + 1}")
    print(f"{'=' * 70}")
    print(f"Category:          {row['Category']}")
    print("\n")
    print(f"Question:          {row['Question']}")
    print("\n")
    print(f"Answer:            {row['Answer']}")
    print("\n")
    print(f"Counter-narrative: {row['Counter_Narrative']}")
    print("\n")
    print(f"Author:            {row['Author']}")
    print("\n")
    print(f"Country of asylum: {row['Country_Asylum']}")
    print("\n")

# %% Step 10 Experimentation time | Recreating the Inconsistency Gapminder
# How can we show the relationship between UNCHR narratives and counter-narrative testimonies? 

#Example code. REPLACE with your own for the Task 
#First creating a new table with a new subset from the original dataFrame
my_subset = db[[
    "Rights/Specifications",
    "UNHCR Narrative",
    "Counter Narrative-Testimony",
    "Counter-narrative Tag",
    "UNHCR Narrative Tag",
    "Question",
    "Answer",
    " Inconsistency Gapminder"
    ]].rename(columns={
    "Rights/Specifications": "Rights_Specifications",
    "UNHCR Narrative": "UNHCR_Narrative",
    "Counter Narrative-Testimony": "Counter_Narrative",
    "Counter-narrative Tag": "Counter_Narrative_Tag",
    "UNHCR Narrative Tag": "UNHCR_Narrative_Tag",
    " Inconsistency Gapminder" : "Inconsistency_Gapminder"
})

my_subset.to_sql(
    "my_subset",
    conn,
    index=False,
    if_exists="replace"
)

print(pd.read_sql(
    "SELECT * FROM my_subset LIMIT 5;",
    conn
))

#See how counter-narratives address/give context to/omit information on Rights and Specifications
query = """
SELECT
    Question,
    Rights_Specifications,
    Counter_Narrative
FROM my_subset;
"""

results = pd.read_sql(query, conn)

for i, row in results.iterrows():
    print(f"\n--- Record {i + 1} ---")
    print(f"\nQUESTION:\n")
    print(row["Question"])
    print(f"\nRIGHTS / SPECIFICATIONS:\n")
    print(row["Rights_Specifications"])
    print(f"\nCOUNTER-NARRATIVE:\n")
    print(row["Counter_Narrative"])
    
#Do the same for UNHCR narratives 
query = """
SELECT
    Question,
    Rights_Specifications,
    UNHCR_Narrative
FROM my_subset;
"""

results = pd.read_sql(query, conn)

for i, row in results.iterrows():
    print(f"\n--- Record {i + 1} ---")
    print(f"\nQUESTION:\n")
    print(row["Question"])
    print(f"\nRIGHTS / SPECIFICATIONS:\n")
    print(row["Rights_Specifications"])
    print(f"\nUNHCR-NARRATIVE:\n")
    print(row["UNHCR_Narrative"])
    
# Compare different tags
query = """
SELECT
<<<<<<< HEAD
UNHCR_Narrative_Tag,
Counter_Narrative_Tag
FROM my_subset;

=======
    UNHCR_Narrative_Tag,
    Counter_Narrative_Tag
FROM refugee_narratives;
>>>>>>> b45b5b5e4b6bc6c82588fd1cad7f3e78b3273168
"""

results = pd.read_sql(query, conn)

print(results.to_string(index=False))

query = """
SELECT
<<<<<<< HEAD
UNHCR_Narrative_Tag,
Counter_Narrative_Tag,
COUNT(*) AS total
FROM my_subset
GROUP BY
UNHCR_Narrative_Tag,
Counter_Narrative_Tag
ORDER BY total DESC;

=======
    UNHCR_Narrative_Tag,
    Counter_Narrative_Tag,
    COUNT(*) AS total
FROM refugee_narratives
GROUP BY
    UNHCR_Narrative_Tag,
    Counter_Narrative_Tag
ORDER BY total DESC;
>>>>>>> b45b5b5e4b6bc6c82588fd1cad7f3e78b3273168
"""

counts = pd.read_sql(query, conn)

for i, row in counts.iterrows():
    unhcr_tag = str(row["UNHCR_Narrative_Tag"]).replace("\\n", " / ")
    counter_tag = str(row["Counter_Narrative_Tag"]).replace("\\n", " / ")
    
    print(f"\n--- Record {i + 1} ---")
    print(f"COUNT - {row['total']} Records")
    print(f"UNHCR narrative tag:       {unhcr_tag}")
    print(f"Counter-narrative tag:     {counter_tag}")
    
# Your turn to adapt and add your own code!!!
#  Experiment with counting/grouping and adding/deleting new fields. 
#Hint: try  COUNT() and GROUP BY(). 
#Try looking into UNHCR Narrative Tag and Counter Narrative



# %% Bonus technical check: 
# Convert one record to a JSON-style format (as the interface might show it)
example = pd.read_sql(query4, conn).to_dict(orient="records")[0]
print(example)

