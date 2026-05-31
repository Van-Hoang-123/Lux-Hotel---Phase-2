const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "Lux Hotel 1", "style.css"), "utf8");
const dom = fs.readFileSync(path.join(root, "Lux Hotel 1", "dom.js"), "utf8");
const html = fs.readFileSync(path.join(root, "Lux Hotel 1", "index.html"), "utf8");

test("booking form has a wide tablet breakpoint before the iPad layout squeezes", () => {
  assert.match(css, /@media \(max-width: 1240px\)[\s\S]*?\.booking-form[\s\S]*?repeat\(3, minmax\(0, 1fr\)\)/);
});

test("journal article images are not delayed by lazy loading or content visibility", () => {
  assert.match(dom, /<img[\s\S]*?loading="eager"[\s\S]*?>/);

  const contentVisibilityBlock = css.match(/\.intro-section,[\s\S]*?content-visibility: auto;/)?.[0] || "";
  assert.equal(contentVisibilityBlock.includes(".journal-section"), false);
});

test("date inputs use a stable display layer instead of native date text", () => {
  assert.match(html, /class="date-control"[\s\S]*id="arrivalDate"[\s\S]*data-date-display-for="arrivalDate"/);
  assert.match(html, /class="date-control"[\s\S]*id="departureDate"[\s\S]*data-date-display-for="departureDate"/);
  assert.match(css, /\.date-control input\[type="date"\][\s\S]*opacity: 0;/);
  assert.match(dom, /function updateDateDisplay\(input\)/);
});
