# Data Walks on Google Maps: Protocols, Infrastructures and Narratives

Google Maps is an application platform that integrates maps, satellite and aerial imagery, Street View, and place information. By structuring and transforming this information, it enables us to search for places, plan routes, and navigate the world on screen. Through digital walks on Google Maps, this workshop explores **protocols, infrastructures, and narratives in data flows**: how data is transmitted, organised, and presented, and how these processes shape our understanding of places.

We will use Python to query locations and coordinates through APIs, organise data into CSV files, and request satellite or street-level imagery using latitude and longitude. The broader aim is to turn point data into image tiles, arranged as grids or, video sequences, to create alternative geospatial narratives. Participants will learn about **API requests and responses, JSON parsing, coordinate processing, and image retrieval**.

We will address two critical questions:

- **How do platforms shape narratives?** How do imagery coverage, access conditions, and framing parameters determine what we can see and how we understand and describe a place?
- **How are the material costs of computing distributed?** By observing data centres and their surroundings, we will trace computing's dependence on land, energy, and resources, asking who bears ecological costs and how infrastructure reproduces inequality.

## Setup Requirements

### 1. Install Requests in Terminal

We will use Python from Anaconda and Requests to send API requests. Open Terminal (Anaconda Prompt on Windows), then run:

**In — Terminal**

```bash
python -m pip install requests
```

After installation, check that Requests imports successfully in Spyder:

**In — Spyder**

```python
import requests
```

### 2. Google Maps API

Before starting, follow the Maps Static API setup guide to create a Google Cloud project, enable **billing**, and obtain a Google API key.

This workshop requires two services:

- **Maps Static API:** request satellite basemap images using latitude and longitude. [Setup guide](https://developers.google.com/maps/documentation/maps-static/start?hl=zh-cn)
- **Street View Static API:** request Street View images and query capture dates and actual panorama positions. [Setup guide](https://developers.google.com/maps/documentation/streetview/overview?hl=zh-cn)
- It's crucial to activate **billing** for your API key to use the script, though you will not face any charges for the project scope described in this tutorial. Google generously offers $200 in monthly credits for each API account, which equates to downloading approximately 100,000 images from the Static Maps API each month at no cost. For detailed information on API pricing, refer to this page. It is IMPORTANT to keep your API key confidential. Do not upload it to GitHub, place it in shared files, or display it in screenshots. Exposure of your key could potentially lead to substantial unauthorized charges. LINK: [Setup guide](https://developers.google.com/maps/documentation/javascript/get-api-key)

## Part 1: Map Points to Tiles

### Step 1: Open the map and explore our street

On your phone, open Google Maps and search for **45–65 Peckham Road, London**. Enter Street View and move along the road, observing the interface and transitions between images.

**Question 1: Looking at the photographs and the continuity of the walk, how do you think Google Street View organises its images? What information is hidden here?**

### Step 2: Look beneath the images using the API

Choose several positions along the street. Use Python to request Street View images and metadata, including **capture dates, actual panorama locations, and panorama IDs**. Place capture dates beside the images to examine whether an apparently continuous street consists of images recorded at different times.

#### 2.1 Prepare coordinates

In desktop Google Maps, choose three adjacent road positions along Peckham Road. Right-click a position and click its coordinates to copy them. Create a Python file in Spyder and enter the coordinates below as `(latitude, longitude)`, in route order.

**In — Spyder**

```python
points = [
    # Paste your coordinates below:
    # (latitude, longitude),
    # (latitude, longitude),
    # (latitude, longitude),
]

if not points:
    raise ValueError("Add three street coordinates to the points list.")
```

#### 2.2 Import tools and enter the API key

**In — Spyder**

```python
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
```

The key is entered at **runtime** rather than written into shared code. Some Spyder consoles cannot hide input; do not record or share the key-entry process.

#### 2.3 Send the first request and read the metadata

Query the first position in the list.

**In — Spyder**

```python
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
```

`requests.get()` sends an HTTP request. `params` specifies the location and key, and `response.json()` reads the JSON response as a Python dictionary.

Returned fields include:

- `status`: the Street View query status.
- `date`: the available capture date, which may contain a year and month, a year only, or be absent.
- `location`: the actual panorama coordinates, which may differ from the requested position.
- `pano_id`: the panorama identifier used to request the matching image.
- `copyright`: attribution information.

#### 2.4 Query every route position

Use a loop to query each position and retain its status and metadata.

**In — Spyder**

```python
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
```

Different requested points may return the same panorama; compare `pano_id` values. Positions without matching imagery remain in the results.

#### 2.5 Request images and label their capture dates

Use each returned panorama ID so that the image corresponds to its metadata.

**In — Spyder**

```python
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
```

Images are read and displayed in memory, without saving local image files. Keep Google Maps attribution and copyright information visible. `heading` controls direction, `pitch` controls vertical viewing angle, and `fov` controls horizontal field of view.

#### 2.6 Compare images and dates

View the images in route order, compare neighbouring capture dates, and return to Google Maps to walk along the same street.

**Does an apparently continuous street consist of images from different years?**

If the sample has identical dates, record that result. A capture date describes the returned image; it does not establish a location's update cycle.

Spatial navigation can link photographs from different dates into an apparently continuous world.

**When we think we are viewing a place's “present”, which past moments make up that present?**

**Question: How do the platform's coverage, access conditions, and image parameters influence the narrative?**

### Step 3: Analyse the data and computation behind the image

This organisation of imagery draws attention to how computation is designed and adjusted as signals and data move through systems: the form in which information is transmitted is not neutral.

In *Atmospheric Correction*, Susan Schuppli writes:

> “a hybrid in which data gleaned from different temporalities is interlaced to create the semblance of a continuous image.”

After Landsat 7's Scan Line Corrector failed, imagery contained diagonal gaps. Some reconstruction methods filled those gaps with data acquired at other times, assembling distinct moments into an apparently continuous image. This asks us to reconsider how reconstructed imagery can serve as evidence of the history it appears to depict.

This differs technically from Street View navigation. The Landsat example concerns gap-filling within an image; our activity compares capture times across neighbouring panoramas. Both shift attention from a coherent visual output to the **acquisition, processing, and assembly** of underlying data.

Reference: [Susan Schuppli, *Atmospheric Correction*, in *On the Verge of Photography*](https://researchonline.rca.ac.uk/3015/1/Golding_On_the_Verge_of_Photography_2013.pdf).

## Part 2: Where Does the Cloud Land?

### Data centres, ecological costs, and local distribution

### Understanding the material basis of the cloud

Data centres house servers, storage, and networking equipment, while depending on power, cooling, network connections, and maintenance labour. Cables and servers provide material conditions for data exchange; protocols and code organise communication and computation.

The cloud refers to computing, storage, software, and other services delivered over networks. These services rely on equipment and infrastructure in specific places. Sorting, ranking, and recommendation may execute on remote servers, with results returned to users' devices; some computation also takes place on the devices themselves.

This part uses digital walks around data centres to examine the internet's material basis, ecological costs, and the distribution of benefits and burdens.

### Step 1: Find facilities through API requests

#### 1.1 OpenStreetMap and its tagging vocabulary

OpenStreetMap (OSM) is a geographic database maintained by contributors. Alongside names and coordinates, tags record building uses, facility types, roads, land use, and operators.

OSM uses **key–value tags**, including:

- `amenity=school`: a school.
- `amenity=hospital`: a hospital.
- `leisure=park`: a park.
- `landuse=industrial`: industrial land.
- `telecom=data_center`: a data centre.

Consult [OSM Wiki: Map features](https://wiki.openstreetmap.org/wiki/Map_features) for common tags and definitions. We will test queries in Overpass Turbo, then send them from Python and extract coordinates.

#### 1.2 Query schools in Overpass Turbo

Open [Overpass Turbo](https://overpass-turbo.eu/), move and zoom the map to your study area, paste the query, and click **Run**.

**In — [Overpass Turbo](https://overpass-turbo.eu/)**

```text
[out:json][timeout:25];
(
  node["amenity"="school"]({{bbox}});
  way["amenity"="school"]({{bbox}});
  relation["amenity"="school"]({{bbox}});
);
out body;
>;
out skel qt;
```

The webpage sends the request and displays the response on the map or in the data view. `{{bbox}}` represents the current map-window bounds. 

To query a different feature, change the tag filter. For example, use `amenity=prison` or `amenity=hospital`.

- **Node:** a point, such as a well or bus stop.
- **Way:** a sequence of nodes representing a line or area outline, such as a road or building.
- **Relation:** a grouping of objects, such as a bus route or multipolygon with separate parts.

#### 1.3 Change the tags to find data centres

Replace the school filter with `telecom=data_center`, and include `building=data_center` to find additional building records. Move the map to Slough before running the query.

**In — [Overpass Turbo](https://overpass-turbo.eu/)**

```text
[out:json][timeout:60];
(
  node["telecom"="data_center"]({{bbox}});
  way["telecom"="data_center"]({{bbox}});
  relation["telecom"="data_center"]({{bbox}});
  node["building"="data_center"]({{bbox}});
  way["building"="data_center"]({{bbox}});
  relation["building"="data_center"]({{bbox}});
);
out center;
```

`out center;` includes **bounding-box centre coordinates** for ways and relations. These are **representative positions**, not necessarily entrances or points inside the geometry. A building tag does not establish current operation, and a facility may have multiple site, building, or point records.

#### 1.4 Put the query into Python

Overpass QL is the query content. [Overpass Turbo](https://overpass-turbo.eu/) can send it from the browser, or `requests` can send it from Python. In Python, replace Turbo's `{{bbox}}` shortcut with explicit bounds in this order:

```text
south, west, north, east
```

Create a new Python file in Spyder and build the query for the Slough area.

**In — Spyder**

```python
import csv
import requests

overpass_url = "https://overpass-api.de/api/interpreter"

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
```

Triple quotes store a multiline string. The query has been written but not yet sent.

#### 1.5 Send the API request

**In — Spyder**

```python
response = requests.post(
    overpass_url,
    data={"data": query},
    timeout=90,
)

if response.status_code != 200:
    raise RuntimeError(
        f"Overpass HTTP request failed: {response.status_code}"
    )

print("HTTP status:", response.status_code)
```

`requests.post()` sends the query to `overpass_url`. `data={"data": query}` places it in the API's expected form field, and `timeout=90` sets Python's request timeout. This is **fetching data via APIs** using Python Requests rather than JavaScript's `fetch()`.

#### 1.6 Read the JSON response

**In — Spyder**

```python
data = response.json()

if data.get("remark"):
    raise RuntimeError(data["remark"])

elements = data.get("elements", [])

print("Number of OSM objects:", len(elements))

for element in elements[:3]:
    print(element)
    print()
```

`response.json()` reads the response into Python data structures. `elements` contains the returned map objects; `elements[:3]` previews the first three. An HTTP success status does not guarantee a complete query, so the script also checks for an Overpass remark.

#### 1.7 Extract coordinates and facility attributes

**In — Spyder**

```python
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
```

Nodes provide `lat` and `lon`; ways and relations provide representative coordinates in `center`. Retain names, operators, and OSM identifiers for source checking. `Unknown` means the operator tag is missing, not that the facility has no operator.

#### 1.8 Export the coordinate CSV

**In — Spyder**

```python
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
```

The file is written to Spyder's working directory. Next, select a research site from these candidate facilities and establish a walking route around it.

### Step 2: From coordinates to images — observe data centres and their surroundings

#### 2.1 Request Google Street View images

Read the CSV → request nearby Street View imagery → save successful images.

Create a new Python file in Spyder and set its working directory to the folder containing the CSV. This step requests street-level images only, without satellite imagery or video. Storage and reuse must comply with the applicable service terms.

**In — Spyder**

```python
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
```

First query metadata to confirm availability, then request an image using the returned panorama ID. Unmatched positions are skipped with a console message.

**In — Spyder**

```python
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
```

The filename corresponds to the CSV's `Index`. A facility's coordinates may lie inside a building, so a nearby panorama may not show the facility directly. Change `heading` if needed: `0` is north, `90` east, `180` south, and `270` west. `pitch` controls vertical angle; a smaller `fov` produces a tighter view. Retain attribution. A failed match does not mean the facility is absent.

#### 2.2 Observe the data centre and its surroundings

Compare each retrieved image with its coordinates and locate the selected facility in Google Maps.

<u><strong>Exercise 1: The exterior of a data centre</strong></u>

Observe how the building's scale, façade, signage, and fences express its identity. Is it conspicuous infrastructure, or does it blend into ordinary industrial or commercial buildings?

Location: **630 Ajax Avenue, Slough SL1 4DG** — [Google Maps](https://www.google.com/maps/search/?api=1&query=630+Ajax+Avenue+Slough).

<u><strong>Exercise 2: Surroundings and development history</strong></u>

Enter Street View and explore nearby roads. Locate housing, public roads, green space, and other industrial facilities in relation to the data centre.

**Question: Which everyday living spaces are adjacent to the facility?**

Observation location: **649–650 Ajax Avenue, Slough SL1 4BG** — [Google Maps](https://www.google.com/maps/search/?api=1&query=650+Ajax+Avenue+Slough).

Historical Street View is available at this location. Switch between capture dates to compare changes in buildings, roads, vegetation, and land use, and explore the area's development history. Former industrial land has shifted to data-centre use; the town's business model may have changed.

<u><strong>Exercise 3: Landscape and infrastructure changes at Spring Park</strong></u>

Observe cooling equipment, building footprints, hard surfaces, vegetation, and nearby energy infrastructure.

Location: **Spring Park, Westwells Road, Corsham SN13 9GB** — [Google Maps](https://www.google.com/maps/search/?api=1&query=Ark+Spring+Park+Westwells+Road+Corsham+SN13+9GB).

Observe changes in surrounding infrastructure, land use, and residential areas.

### Step 3: Observe and construct a narrative — Spring Park Case Study

Visual evidence has limits. Images cannot directly measure electricity or water consumption or carbon emissions. Organise images, coordinates, and observation notes, distinguishing visible features from facility functions that need documentary confirmation.

**Question: How does the cloud we use every day translate into demands for land, electricity, water, and materials in a specific place?**

**Question: Which costs of computing enter the frame, and which cannot be known through looking?**

#### How are benefits and costs distributed?

Users may be far away, while operating revenues accrue to the relevant companies and landscape change, construction, and potential noise and lighting effects are experienced locally. Local communities may also receive jobs, investment, or infrastructure improvements. Trace who receives benefits, whether commitments are delivered, and how residents' and ecological needs enter decision-making.

<u>Electricity: expansion increases the infrastructure that keeps computation running</u>

A 2023 environmental permit variation application describes an existing permission for **54 standby generators** with approximately **237.6 MW** of aggregate thermal input, and a proposal for up to **70 generators** with approximately **328 MW(th)**. That is 16 additional generators and an approximately **38%** increase in thermal-input capacity.

**MW(th) is fuel thermal-input power, not server electrical load or annual electricity consumption.** The application describes emergency backup during grid-supply failure. These figures cannot establish the change in routine electricity use or continuous emissions. Visible changes in buildings and equipment provide spatial evidence; operating hours, electricity consumption, and emissions require operational records.

[Environmental permit variation application](https://consult.environment-agency.gov.uk/psc/sn13-9gb-ark-data-centres-limited-v003/supporting_documents/Application%20Variation%20%20Ark%20Spring%20Park%20Variation%202023%20Main%20Application%20Document%20%20PP3003PW%20V003%2009102023.pdf).

<u>Noise and lighting: effects beyond the building</u>

Street View shows spatial relationships between homes, trees, and facilities, but does not let us hear operating equipment or adequately examine night-time lighting and ecological effects.

In 2024, Corsham Town Council recorded concerns about potential noise at nearby homes and lighting effects on rare local bat species from the southern extension. These records document issues of local concern. Compare them with the locations of homes, vegetation, and campus boundaries. Actual effects require **noise monitoring, lighting assessment, and ecological investigation**.

[Town Council meeting minutes](https://www.corsham.gov.uk/wp-content/uploads/planning-minutes-30-october-2024.pdf).

**Mini task**

**1. Discuss:** Cross-check planning or environmental documents for electricity, water, noise, and carbon issues that imagery cannot directly establish, and discuss how benefits and costs are distributed.

**2. Present:** Assemble an annotated case with locations, capture dates, and document sources, distinguishing observations, documentary explanations, and unresolved questions.
