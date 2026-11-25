"""Data Walks on Google Maps. Run the cells in order in Spyder.
No live API requests have been run during preparation.
"""

# %% 2.1 Prepare coordinates
points = [
<<<<<<< HEAD
    (51.5204, -0.0726)
    ]

=======
    # Paste your coordinates below:
    # (latitude, longitude),
    # (latitude, longitude),
    # (latitude, longitude),
]
>>>>>>> b45b5b5e4b6bc6c82588fd1cad7f3e78b3273168

if not points:
    raise ValueError("Add three street coordinates to the points list.")

# %% 2.2 Import tools and enter the API key
import requests
import getpass
from io import BytesIO
import matplotlib.pyplot as plt

api_key = getpass.getpass("Enter your Google Maps API key: ")

metadata_url = (
    "https://maps.googleapis.com/maps/api/streetview/metadata"
)

image_url = (
    "https://maps.googleapis.com/maps/api/streetview"
)

# %% 2.3 Inspect the first metadata response
latitude, longitude = points[0]

response = requests.get(
    metadata_url,
    params={
        "location": f"{latitude},{longitude}",
        "key": api_key,
    },
    timeout=30,
)

if response.status_code != 200:
    raise RuntimeError(
        f"HTTP request failed: {response.status_code}"
    )

metadata = response.json()

print("Street View status:", metadata.get("status"))
print("Capture date:", metadata.get("date", "Unknown"))
print("Panorama location:", metadata.get("location"))
print("Panorama ID:", metadata.get("pano_id"))
print("Copyright:", metadata.get("copyright"))
print("Error message:", metadata.get("error_message", "None"))

# %% 2.4 Query all route positions
records = []

for index, (latitude, longitude) in enumerate(points, start=1):
    response = requests.get(
        metadata_url,
        params={
            "location": f"{latitude},{longitude}",
            "key": api_key,
        },
        timeout=30,
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"HTTP request failed for point {index}: "
            f"{response.status_code}"
        )

    metadata = response.json()
    status = metadata.get("status", "UNKNOWN")

    if status not in ("OK", "ZERO_RESULTS"):
        raise RuntimeError(
            f"Query failed for point {index}: {status}. "
            f"{metadata.get('error_message', '')}"
        )

    record = {
        "index": index,
        "query_lat": latitude,
        "query_lon": longitude,
        "status": status,
        "date": metadata.get("date", "Unknown"),
        "pano_id": metadata.get("pano_id"),
        "location": metadata.get("location"),
        "copyright": metadata.get("copyright", ""),
    }

    records.append(record)

    print(
        f"Point {index} | "
        f"Status: {status} | "
        f"Capture date: {record['date']} | "
        f"Panorama location: {record['location']}"
    )

# %% 2.5 Request and display dated images
fig, axes = plt.subplots(
    len(records),
    1,
    figsize=(10, 6 * len(records)),
    squeeze=False,
)

for record, ax in zip(records, axes[:, 0]):
    ax.axis("off")

    if record["status"] != "OK":
        ax.set_title(
            f"Point {record['index']} | No panorama found"
        )
        continue

    image_response = requests.get(
        image_url,
        params={
            "pano": record["pano_id"],
            "size": "640x400",
            "heading": 90,
            "pitch": 0,
            "fov": 90,
            "return_error_code": "true",
            "key": api_key,
        },
        timeout=30,
    )

    if image_response.status_code != 200:
        ax.set_title(
            f"Point {record['index']} | "
            f"Image request failed: "
            f"{image_response.status_code}"
        )
        continue

    image = plt.imread(
        BytesIO(image_response.content),
        format="jpg",
    )

    ax.imshow(image)
    ax.set_title(
        f"Point {record['index']} | "
        f"Capture date: {record['date']}"
    )
    ax.text(
        0,
        -0.04,
        record["copyright"],
        transform=ax.transAxes,
        fontsize=8,
    )

plt.tight_layout()
plt.show()

