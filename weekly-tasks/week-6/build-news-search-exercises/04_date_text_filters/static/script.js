"use strict";

const filters = {
  dateFrom: "",
  dateTo: "",
  includeTopics: [],
  excludeTopics: [],
  includePlaces: [],
  excludePlaces: [],
  includeSources: [],
  excludeSources: []
};

const form = document.querySelector("#search-form");
const statusText = document.querySelector("#status");
const results = document.querySelector("#results");
const resultCount = document.querySelector("#result-count");
const searchButton = form.querySelector("button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusText.textContent = "Loading...";
  searchButton.disabled = true;
  // DATE RANGE: convert the date input values from YYYY-MM-DD to DD/MM/YYYY for Python.
  for (const field of ["dateFrom", "dateTo"]) {
    const value = document.getElementById(field).value;
    filters[field] = value ? value.split("-").reverse().join("/") : "";
  }
  // TEXT FILTERS: split comma-separated input into arrays for Python.
  for (const field of ["includeTopics", "excludeTopics", "includePlaces", "excludePlaces", "includeSources", "excludeSources"]) {
    filters[field] = document.getElementById(field).value
      .split(/[,;\n]+/)
      .map((term) => term.trim())
      .filter((term) => term);
  }
  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: document.querySelector("#search-query").value,
        pageSize: document.querySelector("#page-size").value,
        sortBy: document.querySelector("#sort-by").value,
        filters: filters
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Search failed.");
    }
    results.replaceChildren();
    resultCount.textContent = `${data.count} articles`;
    for (const article of data.articles) {
      const card = document.createElement("article");
      card.className = "article-card";
      const body = document.createElement("div");
      body.className = "article-body";
      const heading = document.createElement("h3");
      heading.className = "article-title";
      const link = document.createElement("a");
      link.href = article.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = article.title;
      heading.append(link);
      const meta = document.createElement("p");
      meta.className = "article-meta";
      meta.textContent = `${article.sourceName} · ${article.publishedLabel} · ${article.author}`;
      const description = document.createElement("p");
      description.className = "article-description";
      description.textContent = article.description;
      body.append(heading, meta, description);
      card.append(body);
      results.append(card);
    }
    if (data.count === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No articles match the current filters.";
      results.append(empty);
    }
    statusText.textContent = `Loaded ${data.fetchedCount} articles; ${data.count} match the filters.`;
  } catch (error) {
    results.replaceChildren();
    resultCount.textContent = "0 articles";
    statusText.textContent = `We couldn't load the articles: ${error.message}`;
  } finally {
    searchButton.disabled = false;
  }
});
