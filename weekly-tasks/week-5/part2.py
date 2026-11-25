"""Data Walks on Google Maps. Run the cells in order in Spyder.
No live API requests have been run during preparation.
"""

# %% 1.3 Build the Overpass query
import csv
import requests

<<<<<<< HEAD
overpass_url = "https://overpass.openstreetmap.ru/api/interpreter"


=======
overpass_url = "https://overpass-api.de/api/interpreter"
>>>>>>> b45b5b5e4b6bc6c82588fd1cad7f3e78b3273168

query = """
[out:json][timeout:60];
(
  node["telecom"="data_center"](51.46,-0.68,51.56,-0.48);
  way["telecom"="data_center"](51.46,-0.68,51.56,-0.48);
  relation["telecom"="data_center"](51.46,-0.68,51.56,-0.48);

  node["building"="data_center"](51.46,-0.68,51.56,-0.48);
  way["building"="data_center"](51.46,-0.68,51.56,-0.48);
  relation["building"="data_center"](51.46,-0.68,51.56,-0.48);
);
out center;
"""

# %% 1.4 Send the API request
response = requests.post(
    overpass_url,
    data={"data": query},
    headers={
        "User-Agent": "CreativeCoding-DataWalks/1.0",
    },
    timeout=90,
)

if response.status_code != 200:
    raise RuntimeError(
        f"Overpass HTTP request failed: {response.status_code}"
    )

print("HTTP status:", response.status_code)

# %% 1.5 Read the JSON response
data = response.json()

if data.get("remark"):
    raise RuntimeError(data["remark"])

elements = data.get("elements", [])

print("Number of OSM objects:", len(elements))

for element in elements[:3]:
    print(element)
    print()

# %% 1.6 Extract facility coordinates and attributes
facilities = []

for element in elements:
    tags = element.get("tags", {})

    if element["type"] == "node":
        location = element
    else:
        location = element.get("center", {})

    latitude = location.get("lat")
    longitude = location.get("lon")

    if latitude is None or longitude is None:
        continue

    facilities.append({
        "Index": len(facilities) + 1,
        "Latitude": latitude,
        "Longitude": longitude,
        "Name": tags.get("name", "Unnamed"),
        "Operator": tags.get("operator", "Unknown"),
        "OSM_Type": element["type"],
        "OSM_ID": element["id"],
    })

for facility in facilities:
    print(
        f"{facility['Index']}: {facility['Name']} | "
        f"Operator: {facility['Operator']} | "
        f"Coordinates: {facility['Latitude']}, "
        f"{facility['Longitude']} | "
        f"OSM: {facility['OSM_Type']}/{facility['OSM_ID']}"
    )

if not facilities:
    raise ValueError(
        "No facilities found. Check or expand the query area."
    )

# %% 1.7 Export the coordinate CSV
fieldnames = [
    "Index",
    "Latitude",
    "Longitude",
    "Name",
    "Operator",
    "OSM_Type",
    "OSM_ID",
]

with open(
    "data_centres.csv",
    "w",
    newline="",
    encoding="utf-8",
) as file:
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(facilities)

print("Saved data_centres.csv")

# %% 2.1 Prepare Street View requests
import csv
import getpass
from pathlib import Path

import requests

api_key = getpass.getpass("Enter your Google Maps API key: ")

csv_file = Path("data_centres.csv")
output_folder = Path("street_view_images")
output_folder.mkdir(exist_ok=True)

metadata_url = (
    "https://maps.googleapis.com/maps/api/streetview/metadata"
)

image_url = (
    "https://maps.googleapis.com/maps/api/streetview"
)

# %% 2.1 Request and save Street View images
with csv_file.open(
    newline="",
    encoding="utf-8",
) as file:
    reader = csv.DictReader(file)

    for row in reader:
        index = row["Index"]
        latitude = float(row["Latitude"])
        longitude = float(row["Longitude"])
        name = row.get("Name", "Unnamed")

        metadata_response = requests.get(
            metadata_url,
            params={
                "location": f"{latitude},{longitude}",
                "key": api_key,
            },
            timeout=30,
        )

        if metadata_response.status_code != 200:
            print(
                f"Point {index}: metadata HTTP error "
                f"{metadata_response.status_code}"
            )
            continue

        metadata = metadata_response.json()
        status = metadata.get("status", "UNKNOWN")

        if status != "OK":
            print(
                f"Point {index}: {status} | "
                f"{metadata.get('error_message', '')}"
            )
            continue

        image_response = requests.get(
            image_url,
            params={
                "pano": metadata["pano_id"],
                "size": "640x640",
                "heading": 160,
                "pitch": 0,
                "fov": 90,
                "return_error_code": "true",
                "key": api_key,
            },
            timeout=30,
        )

        content_type = image_response.headers.get(
            "Content-Type", ""
        )

        if (
            image_response.status_code != 200
            or not content_type.startswith("image/")
        ):
            print(
                f"Point {index}: image request failed | "
                f"HTTP {image_response.status_code}"
            )
            continue

        filename = output_folder / f"{index}.jpg"
        filename.write_bytes(image_response.content)

        print(
            f"Saved: {filename} | "
            f"Name: {name} | "
            f"Capture date: {metadata.get('date', 'Unknown')} | "
            f"Panorama location: {metadata.get('location')}"
        )

print("Street View requests complete.")

