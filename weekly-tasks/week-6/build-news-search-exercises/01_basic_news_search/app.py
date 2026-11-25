# 1. BASIC SETUP | Function: import dependencies and load the API key.
import os
from datetime import datetime, timezone

import requests
from flask import Flask, jsonify, render_template, request

from config import newsApiKey

apiKey = os.environ.get("NEWS_API_KEY", newsApiKey)
app = Flask(__name__)


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/search")
def searchNews():
    # 2. REQUEST | Function: receive a JSON object from the webpage.
    settings = request.get_json(silent=True)
    if not isinstance(settings, dict):
        return jsonify(error="Please send a JSON object."), 400

    # 3. SEARCH | Function: read and validate the search box.
    query = settings.get("query", "")
    if not isinstance(query, str) or not query.strip():
        return jsonify(error="Enter a search term."), 400
    query = query.strip()

    # 4. NEWS LANGUAGE | read language from frontend
    language = settings.get("language", "en")
    allowed_languages = ["en", "es", "fr", ""]
    if language not in allowed_languages:
        return jsonify(error="Invalid language choice"), 400

    # 5. RESULTS | Function: read and validate the requested article count.
    try:
        pageSize = int(settings.get("pageSize", 50))
    except (TypeError, ValueError):
        return jsonify(error="Invalid result count."), 400
    if pageSize not in (20, 50, 100):
        return jsonify(error="Result count must be 20, 50 or 100."), 400

    # 8. NEWS SERVICE | request articles through Python and check the response.
    if not apiKey:
        return jsonify(error="Set newsApiKey in config.py first."), 500

    params = {"q": query, "pageSize": pageSize, "sortBy": "publishedAt"}
    if language:
        params["language"] = language

    try:
        response = requests.get(
            "https://newsapi.org/v2/everything",
            params=params,
            headers={"X-Api-Key": apiKey},
            timeout=20,
        )
        data = response.json()
    except (requests.RequestException, ValueError):
        return jsonify(error="Could not reach the news service. Please try again."), 502

    if not response.ok or data.get("status") != "ok":
        return jsonify(error=data.get("message") or "The news service returned an error."), 502

    # 10. STAGE 1 - PROCESS EACH ARTICLE AND COLLECT RESULTS
    results = []
    for article in data.get("articles", []):
        cleaned = {}
        for field in ("title", "description", "content", "author", "url", "urlToImage"):
            value = article.get(field)
            if not isinstance(value, str):
                value = ""
            cleaned[field] = " ".join(value.split())

        if not cleaned["title"] or cleaned["title"] == "[Removed]":
            continue

        source = article.get("source") or {}
        sourceName = source.get("name") or "Unknown source"

        # 10.1 ARTICLE DATE
        published = None
        try:
            published = datetime.fromisoformat((article.get("publishedAt") or "").replace("Z", "+00:00"))
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
            published = published.astimezone(timezone.utc)
        except (ValueError, TypeError):
            pass

        # 10.2 DATE LABEL
        cleaned["publishedLabel"] = "Unknown date"
        if published:
            cleaned["publishedLabel"] = published.strftime("%d/%m/%Y %H:%M UTC")

        cleaned["sourceName"] = sourceName
        results.append(cleaned)

    # 13. RESPONSE
    return jsonify(articles=results, fetchedCount=len(data.get("articles", [])), count=len(results))


# 14. APP STARTUP
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)


