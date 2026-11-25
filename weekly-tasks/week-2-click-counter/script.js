// Week 2 — click counter.
// What this does: each click calls the handler, adds 1 to count,
// and writes the new value into the page.

const button = document.querySelector(".my-button");
const output = document.querySelector("#output");

let count = 0;

button.addEventListener("click", handleClick);

function handleClick() {
  count = count + 1;               // reassignment: = means "becomes"
  output.textContent = "Click count: " + count;
  console.log("Click count: " + count);
}
