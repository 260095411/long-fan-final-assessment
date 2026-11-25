import json
import pandas as pd


# Read observations and the saved ownership labels
observations = pd.read_csv("data/2026-09/global/sites_trackers.csv")
owners = pd.read_csv("data/metadata/tracker_owners.csv")
websites = ["bbc.co.uk", "etsy.com", "claude.ai"]

# Keep the three websites and attach each service owner
selected = observations.loc[observations["site"].isin(websites)].copy()
selected = selected.merge(owners, on="tracker", how="left", validate="many_to_one")
selected["category"] = selected["category"].fillna("unknown")
selected["owner"] = selected["owner"].fillna("Unknown")
selected["service_name"] = selected["service_name"].fillna(selected["tracker"])

print(selected)

# Summarise each website for the three journey steps
site_data = pd.read_csv("data/2026-09/global/sites.csv")
reports = []

for website in websites:
    rows = selected.loc[selected["site"] == website].sort_values("site_proportion", ascending=False)
    stats = site_data.loc[site_data["site"] == website].iloc[0]
   

    for _, row in rows.iterrows():
        #ljsonfile-line9-13
        service_rows = []
        service_rows.append({
            "name": row["service_name"], "tracker": row["tracker"],
            "category": row["category"].replace("_", " ").title(),
            "owner": row["owner"],
            "percent": round(float(row["site_proportion"]) * 100, 2)
        })
    #jsonfile-line65-69
    categories = []
    for category, group in rows.groupby("category"):
        categories.append({"name": category.replace("_", " ").title(), "count": int(group["tracker"].nunique())})
    
    #jsonfile-line79-84
   
    companies = []
    for owner, group in rows.groupby("owner"):
        names = []
        for name in group["service_name"].unique():
            names.append(name)
        companies.append({"name": owner, "count": len(names), "services": ", ".join(names)})
    
    # Count services for each category and owner pair jsonfile-line85-89
    flows = []
    for pair, group in rows.groupby(["category", "owner"]):
        flows.append({
            "category": pair[0].replace("_", " ").title(),
            "owner": pair[1],
            "count": int(group["tracker"].nunique())
        })
    # save as dictionary
    reports.append({
        "domain": website, "count": int(rows["tracker"].nunique()),
        "average_trackers": round(float(stats["trackers"]), 2),
        "average_companies": round(float(stats["companies"]), 2),
        "services": service_rows, "categories": categories, "companies": companies,
        "flows": flows
    })

# Save results for the static website
# Create the directory if it doesn't exist
os.makedirs("../web/result", exist_ok=True)

# Create or overwrite the JSON file
with open("../web/result/journey.json", "w", encoding="utf-8") as file:
    json.dump(reports, file, indent=2, ensure_ascii=False, allow_nan=False)

