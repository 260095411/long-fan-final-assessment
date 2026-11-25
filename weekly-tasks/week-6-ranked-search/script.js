// Week 6 — ranking a search result with adjustable weights.
// score = recency*w1 + engagement*w2 + sourceWeight*w3
// The same eight items produce a different reading order.

const weights = { recency: 2, engagement: 1, source: 1 };

const $ = (id) => document.getElementById(id);

["recency", "engagement", "source"].forEach((key) => {
  const input = $(`w-${key}`);
  const label = $(`v-${key}`);
  input.addEventListener("input", () => {
    weights[key] = Number(input.value);
    label.textContent = input.value;
    render();
  });
});

function scoreOf(item) {
  return item.recency * weights.recency
       + item.engagement * weights.engagement
       + item.sourceWeight * weights.source;
}

function render() {
  const ranked = [...window.NEWS_DATA]
    .map((item) => ({ ...item, score: scoreOf(item) }))
    .sort((a, b) => b.score - a.score);

  $("list").innerHTML = ranked.map((item, i) => `
    <div class="item">
      <div class="rank">${String(i + 1).padStart(2, "0")}</div>
      <div>
        <p class="title">${item.title}</p>
        <p class="meta">${item.source} · recency ${item.recency} · engagement ${item.engagement} · source weight ${item.sourceWeight}</p>
      </div>
      <div class="score">${item.score.toFixed(1)}</div>
    </div>`).join("");

  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  $("reflection").textContent =
    `With these weights the first result is “${top.title}” and the last is “${bottom.title}”. ` +
    `Nothing was added or removed — only the arithmetic changed. ` +
    `A ranking is therefore an argument about what matters, expressed as coefficients.`;
}

render();

// Reflection for the submission:
// This is the same mechanism an age gate uses when it compresses a person
// into one number: a weighted rule produces a decision, and the decision
// looks like a fact.
