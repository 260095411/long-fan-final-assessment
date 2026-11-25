# 1. BASIC SETUP | Function: import dependencies and load the API key.
import os
from datetime import datetime, timezone
from operator import itemgetter

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


    # 4. NEWS LANGUAGE | Function: use a fixed English language setting.
    language = "en"


    # 5. RESULTS | Function: read and validate the requested article count.
    try:
        pageSize = int(settings.get("pageSize", 50))
    except (TypeError, ValueError):
        return jsonify(error="Invalid result count."), 400
    if pageSize not in (20, 50, 100):
        return jsonify(error="Result count must be 20, 50 or 100."), 400


    # 6. SORT BY | Function: validate the sorting options taught in this lesson.
    sortBy = settings.get("sortBy", "")
    if sortBy not in ("", "date", "alphabet"):
        return jsonify(error="Unsupported sort field."), 400


    # 8. NEWS SERVICE | Function: request articles through Python and check the response.
    if not apiKey:
        return jsonify(error="Set newsApiKey in config.py first."), 500
    params = {"q": query, "pageSize": pageSize, "sortBy": "publishedAt"}
    if language != "all":
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


    # 9. SCORING TERMS | Function: prepare the search terms used for relevance scoring.
    queryTerms = query.lower().split()


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


        # 10.1 ARTICLE DATE | Function: parse the publication time for display.
        published = None
        try:
            published = datetime.fromisoformat((article.get("publishedAt") or "").replace("Z", "+00:00"))
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
            published = published.astimezone(timezone.utc)
        except (ValueError, TypeError):
            pass


        # 10.2 DATE SORTING VALUES | Function: prepare the date label and numeric sorting key.
        cleaned["publishedLabel"] = "Unknown date"
        cleaned["dateOrder"] = 0
        if published:
            cleaned["publishedLabel"] = published.strftime("%d/%m/%Y %H:%M UTC")
            cleaned["dateOrder"] = published.timestamp()


        # 10.3 ALPHABET SORTING VALUE | Function: prepare the title sorting key.
        cleaned["alphabetOrder"] = cleaned["title"].casefold()


        # 10.5 RELEVANCE SCORE | Function: award title 5, description 3, and content 1 point per matching term.
        score = 0
        for term in queryTerms:
            if term in cleaned["title"].lower():
                score += 5
            if term in cleaned["description"].lower():
                score += 3
            if term in cleaned["content"].lower():
                score += 1
        cleaned["matchScore"] = score


        # 10.7 ARTICLE COLLECTION | Function: append the retained article to results.
        cleaned["sourceName"] = sourceName
        results.append(cleaned)


    # 11. STAGE 2 - COLLECTION COMPLETE | All retained articles are now in results.


    # 12. STAGE 3 - SORT THE COMPLETE LIST | Function: apply the selected sorting method.
    # 12.1 Date: newest first.
    if sortBy == "date":
        results.sort(key=itemgetter("dateOrder"), reverse=True)

    # 12.2 Alphabet: ascending title order.
    elif sortBy == "alphabet":
        results.sort(key=itemgetter("alphabetOrder"))

    # 12.3 Default: highest relevance score first.
    else:
        results.sort(key=itemgetter("matchScore"), reverse=True)


    # 13. RESPONSE | Function: return articles and counts to the webpage.
    return jsonify(articles=results, fetchedCount=len(data.get("articles", [])), count=len(results))


# 14. APP STARTUP | Function: run the local Flask server.
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)

