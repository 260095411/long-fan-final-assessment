# =============================================================
# 学习版 / Annotated study copy (do NOT submit)
# 纯净提交版见 parsing.py。本文件每一块都有中文白话解释。
# =============================================================

import json   # 内置模块：读 JSON 文件 / built-in module for reading JSON
import csv    # 内置模块：读 CSV 文件 / built-in module for reading CSV


# ---------- 1. json.load()：JSON 文件 -> Python 的列表（list） ----------
# JSON 最外层的 [ ... ] 数组，读进来就是 Python 的 list；
# 里面每个 { ... } 对象，读进来就是 Python 的 dict（字典）。
# 而且 JSON 里的数字读进来就是 int，不用再转换。
with open("user_interactions.json", "r", encoding="utf-8") as file:
    records = json.load(file)

print("JSON: total records =", len(records))          # len() 数一共有几条
print("First record (Python dict):", records[0])       # records[0] = 第一条，是 dict


# ---------- 2. csv.reader()：CSV -> 纯列表的列表（每行都是一个 list） ----------
# 所有值都还是字符串（str），数字也带引号；只能靠位置取值 row[0]、row[1]。
with open("user_interactions.csv", "r", newline="", encoding="utf-8") as f:
    rows = list(csv.reader(f))

print("\ncsv.reader() header row:", rows[0])          # 第 0 行是表头（列名）
print("csv.reader() first data row (plain list):", rows[1])  # 第 1 行才是第一条数据


# ---------- 3. csv.DictReader()：CSV -> 字典的列表（每条是一个 dict） ----------
# 表头变成字典的 key，可以用 rec["action"] 按名字取值，比数位置好读。
# 但 CSV 里一切都是字符串，所以 click_count 必须手动 int() 转成数字。
with open("user_interactions.csv", "r", newline="", encoding="utf-8") as f:
    csv_records = list(csv.DictReader(f))

for rec in csv_records:
    rec["click_count"] = int(rec["click_count"])

print("\ncsv.DictReader() first record (dict):", csv_records[0])


# ---------- 4. 原始筛选条件 Original filter：click_count >= 3 ----------
# 用 for 循环逐条看，满足条件就 append（追加）进新列表。
filtered = []
for r in records:
    if r["click_count"] >= 3:
        filtered.append(r)

print("\nOriginal condition click_count >= 3 ->", len(filtered), "records")


# ---------- 5. 改动后的筛选条件 Modified filter：click_count >= 6 ----------
# 把门槛从 3 提高到 6，剩下的记录变少，这就是“观察结果变化”。
filtered_new = []
for r in records:
    if r["click_count"] >= 6:
        filtered_new.append(r)

print("Modified condition click_count >= 6 ->", len(filtered_new), "records")
for r in filtered_new:
    print("   -", r["action"], r["click_count"], r["review_status"])

# 第二个“换一种条件”的例子：不看数字，只挑 action 类型为 comment 的记录
comments = []
for r in records:
    if r["action"] == "comment":
        comments.append(r)

print("Alternative condition action == 'comment' ->", len(comments), "records")


# ---------- 6. 审核状态 Moderation：approved（通过）vs flagged（被标记） ----------
# 6a. 对全部 25 条记录分组
approved_all = []
flagged_all = []
for r in records:
    if r["review_status"] == "approved":
        approved_all.append(r)
    else:
        flagged_all.append(r)

print("\nAll records -> approved:", len(approved_all), "| flagged:", len(flagged_all))

# 6b. 按动作类型分别统计
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

# 6c. 只看原始 >=3 筛出来的那 19 条
approved_data = []
flagged_data = []
for r in filtered:
    if r["review_status"] == "approved":
        approved_data.append(r)
    else:
        flagged_data.append(r)

print("Inside click_count >= 3 -> approved:", len(approved_data), "| flagged:", len(flagged_data))


# ---------- 7. 排序对比 Sorting：sorted() vs .sort() ----------
count_list = [1, 5, 2, 4, 3]
original = count_list.copy()   # 先复制一份，方便前后对比

# sorted()：生成并返回一个【新】列表，原列表不动
sorted_new = sorted(count_list)
print("\nBefore sorting:", original)
print("sorted() result (new list):", sorted_new)
print("Original after sorted():", count_list, "<- unchanged")

# .sort()：直接在【原列表】上原地排序，返回 None
count_list.sort()
print("Original after .sort():", count_list, "<- changed in place")
