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
  assert.match(css, /\.date-control input\[type="date"\][\s\S]*opacity: 1;/);
  assert.match(css, /::-webkit-calendar-picker-indicator[\s\S]*opacity: 0;/);
  assert.match(dom, /function updateDateDisplay\(input\)/);
  assert.match(dom, /showPicker/);
});

test("frontend exposes the user booking controller actions", () => {
  assert.match(html, /id="bookRoomButton"[\s\S]*data-i18n="booking\.bookSelected"/);
  assert.match(html, /id="bookingHistory"[\s\S]*id="bookingList"/);
  assert.match(dom, /apiFetch\("\/bookings"/);
  assert.match(dom, /apiFetch\("\/bookings\/my"/);
  assert.match(dom, /\/bookings\/\$\{encodeURIComponent\(bookingId\)\}\/cancel/);
  assert.match(dom, /method: "DELETE"[\s\S]*returnStatuses: \[400, 401, 403, 404, 405\]/);
  assert.match(dom, /function canCancelBooking\(booking\)[\s\S]*booking\.status === "Confirmed"/);
  assert.match(dom, /buildBookingPayload/);
  assert.match(dom, /getBookingGuest/);
  assert.match(dom, /guestFullName/);
  assert.match(dom, /guestEmail/);
});

test("frontend exposes the payment completion action from the booking controller", () => {
  assert.match(dom, /\/bookings\/\$\{encodeURIComponent\(bookingId\)\}\/complete-payment/);
  assert.match(dom, /data-complete-payment/);
  assert.match(dom, /account\.paymentUnavailable/);
  assert.match(dom, /let paymentApiAvailable = false/);
  assert.match(dom, /userHasRole\(getStoredAuth\(\), "Admin"\)/);
  assert.match(dom, /\["Confirmed", "Pending"\]\.includes\(booking\.status\)/);
  assert.match(dom, /const bookingPath = userHasRole\(auth, "Admin"\) \? "\/bookings" : "\/bookings\/my"/);
  assert.match(dom, /returnStatuses: \[400, 401, 403, 404, 405\]/);
  assert.match(css, /\.booking-item-actions \.payment-action/);
});

test("expired auth does not hide the login and register forms on first load", () => {
  assert.match(dom, /function isAuthExpired\(auth\)/);
  assert.match(dom, /clearStoredAuth\(\);[\s\S]*?return null;/);
  assert.match(dom, /response\.status === 401[\s\S]*?updateAccountSummary\(null\)/);
});

test("account login and register UI is not hidden by scroll reveal animations", () => {
  assert.doesNotMatch(dom, /gsap\.utils\.toArray\([^)]*account-copy/);
  assert.doesNotMatch(dom, /gsap\.utils\.toArray\([^)]*auth-shell/);
});
