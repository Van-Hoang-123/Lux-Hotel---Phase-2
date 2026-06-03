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

test("frontend images do not use lazy loading or delayed background observers", () => {
  assert.doesNotMatch(html, /loading="lazy"/);
  assert.doesNotMatch(dom, /loading="lazy"/);
  assert.doesNotMatch(dom, /IntersectionObserver/);
  assert.match(dom, /function setupBackgroundImages\(root = document\)/);

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
  assert.match(dom, /requestConfirmation\(t\("booking\.confirmCreate"\)\)/);
  assert.match(dom, /requestConfirmation\(t\("account\.confirmCancel"\)\)/);
});

test("frontend exposes the payment completion action from the booking controller", () => {
  assert.match(dom, /\/bookings\/\$\{encodeURIComponent\(bookingId\)\}\/complete-payment/);
  assert.match(dom, /data-complete-payment/);
  assert.match(dom, /account\.paymentUnavailable/);
  assert.match(dom, /let paymentApiAvailable = false/);
  assert.match(dom, /function canCompletePayment\(booking\)[\s\S]*paymentApiAvailable/);
  assert.match(dom, /userHasRole\(getStoredAuth\(\), "Admin"\)/);
  assert.match(dom, /\["Confirmed", "Pending"\]\.includes\(booking\.status\)/);
  assert.match(dom, /const bookingPath = userHasRole\(auth, "Admin"\) \? "\/bookings" : "\/bookings\/my"/);
  assert.match(dom, /returnStatuses: \[400, 401, 403, 404, 405\]/);
  assert.match(dom, /requestConfirmation\(t\("account\.confirmPayment"\)\)/);
  assert.match(css, /\.booking-item-actions \.payment-action/);
});

test("admin booking payments can be searched and filtered without scrolling through every booking", () => {
  assert.match(html, /id="bookingAdminTools"[\s\S]*id="bookingSearchInput"[\s\S]*id="bookingFilterRow"/);
  assert.match(html, /data-booking-filter="needs-payment"/);
  assert.match(html, /data-i18n-placeholder="account\.bookingSearchPlaceholder"/);
  assert.match(dom, /let bookingSearchQuery = ""/);
  assert.match(dom, /let bookingQuickFilter = "all"/);
  assert.match(dom, /function bookingSearchDocument\(booking\)/);
  assert.match(dom, /function filterBookingsForAccount\(bookings, auth\)/);
  assert.match(dom, /const matcher = createAhoCorasickMatcher\(keywords\)/);
  assert.match(dom, /matcher\.find\(bookingSearchDocument\(booking\)\)/);
  assert.match(dom, /function sortBookingsForAccount\(bookings, auth\)/);
  assert.match(dom, /Number\(canCompletePayment\(right\)\) - Number\(canCompletePayment\(left\)\)/);
  assert.match(dom, /function setupBookingSearchControls\(\)/);
  assert.match(dom, /queueBookingSearchRender\(input\.value\)/);
  assert.match(css, /\.booking-admin-tools/);
  assert.match(css, /\.booking-history\.is-admin \.booking-list[\s\S]*max-height: min\(680px, 72vh\)/);
});

test("admin booking list shows the guest identity returned by the booking API", () => {
  assert.match(dom, /guestFullName: firstValue\(/);
  assert.match(dom, /guestEmail: firstValue\(/);
  assert.match(dom, /function renderAdminBookingGuest\(booking, auth\)/);
  assert.match(dom, /userHasRole\(auth, "Admin"\)/);
  assert.match(dom, /booking-guest-info/);
  assert.match(css, /\.booking-guest-info/);
});

test("admin bookings refresh through SignalR without manual reload", () => {
  assert.match(html, /@microsoft\/signalr@9\.0\.6/);
  assert.match(dom, /function buildBookingHubUrl\(\)/);
  assert.match(dom, /\/hubs\/bookings/);
  assert.match(dom, /new window\.signalR\.HubConnectionBuilder\(\)/);
  assert.match(dom, /\.withAutomaticReconnect\(\)/);
  assert.match(dom, /connection\.on\("bookingChanged", refreshBookingsSilently\)/);
  assert.match(dom, /const bookingFallbackRefreshMs = \{[\s\S]*admin: 30000/);
  assert.match(dom, /function startBookingAutoRefresh\(auth = getStoredAuth\(\)\)/);
  assert.match(dom, /startBookingRealtime\(auth\)/);
  assert.match(dom, /userHasRole\(auth, "Admin"\) \? bookingFallbackRefreshMs\.admin : bookingFallbackRefreshMs\.user/);
  assert.match(dom, /fetchMyBookings\(\{ silent: true \}\)/);
  assert.match(dom, /document\.addEventListener\("visibilitychange"/);
  assert.match(dom, /function bookingListSignature\(bookings\)/);
});

test("admin account labels user bookings separately from personal bookings", () => {
  assert.match(html, /id="bookingHistoryTitle"[\s\S]*data-i18n="account\.myBookings"/);
  assert.match(dom, /"account\.userBookings": "User's bookings"/);
  assert.match(dom, /"account\.userBookings": "Booking của user"/);
  assert.match(dom, /function updateBookingHistoryTitle\(auth = getStoredAuth\(\)\)/);
  assert.match(dom, /userHasRole\(auth, "Admin"\) \? "account\.userBookings" : "account\.myBookings"/);
});

test("booking form shows a price preview before creating a booking", () => {
  assert.match(html, /id="bookingPricePreview"[\s\S]*id="bookingPriceValue"[\s\S]*id="bookingPriceHint"/);
  assert.match(dom, /function updateBookingPricePreview\(\)/);
  assert.match(dom, /function stayNightCount\(arrival, departure\)/);
  assert.match(dom, /roomNightlyPriceValue\(room\)/);
  assert.match(dom, /updateBookingPricePreview\(\);/);
  assert.match(css, /\.booking-price-preview/);
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

test("journal search calls the article search endpoint and can reset results", () => {
  assert.match(html, /id="journalSearchForm"[\s\S]*id="journalSearchInput"[\s\S]*id="journalSearchClear"/);
  assert.doesNotMatch(html, /data-i18n="journal\.searchButton"/);
  assert.match(html, /data-i18n-placeholder="journal\.searchPlaceholder"/);
  assert.match(css, /\.journal-search/);
  assert.match(dom, /function searchJournal\(query\)/);
  assert.match(dom, /const journalSearchDebounceMs = 320/);
  assert.match(dom, /function createAhoCorasickMatcher\(patterns\)/);
  assert.match(dom, /nodes\[target\]\.failure/);
  assert.match(dom, /function queueJournalSearch\(query\)/);
  assert.match(dom, /window\.setTimeout\(\(\) => \{[\s\S]*searchJournal\(trimmedQuery\)/);
  assert.match(dom, /input\.addEventListener\("input", \(\) => \{[\s\S]*queueJournalSearch\(input\.value\)/);
  assert.match(dom, /\/articles\/search\?q=\$\{encodeURIComponent\(trimmedQuery\)\}/);
  assert.match(dom, /function localJournalSearch\(query\)/);
  assert.match(dom, /journal = \[\.\.\.allJournalPosts\]/);
  assert.match(dom, /setupJournalSearch\(\);/);
});
