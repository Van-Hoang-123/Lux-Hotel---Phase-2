const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildAvailabilityPayload,
  buildBookingPayload,
  buildLegacyAvailabilityPayload,
  formatDateForApi,
  readItems,
} = require("../Lux Hotel 1/api-contract.js");

test("formatDateForApi sends dates in the backend dd-MM-yyyy format", () => {
  assert.equal(formatDateForApi("2026-06-03"), "03-06-2026");
  assert.equal(formatDateForApi("03-06-2026"), "03-06-2026");
});

test("buildAvailabilityPayload matches the booking availability API", () => {
  const payload = buildAvailabilityPayload({
    arrivalDate: "2026-06-03",
    departureDate: "2026-06-05",
    adultCount: "2",
    childCount: "1",
  });

  assert.deepEqual(payload, {
    arrivalDate: "03-06-2026",
    departureDate: "05-06-2026",
    adult: 2,
    children: 1,
  });
  assert.equal(Object.hasOwn(payload, "roomId"), false);
  assert.equal(Object.hasOwn(payload, "adults"), false);
  assert.equal(Object.hasOwn(payload, "adultCount"), false);
  assert.equal(Object.hasOwn(payload, "childCount"), false);
});

test("buildBookingPayload matches the authenticated booking API", () => {
  assert.deepEqual(
    buildBookingPayload({
      roomId: "3",
      arrivalDate: "2026-06-03",
      departureDate: "2026-06-05",
      adultCount: "2",
      childCount: "1",
    }),
    {
      roomId: 3,
      arrivalDate: "03-06-2026",
      departureDate: "05-06-2026",
      adult: 2,
      children: 1,
    }
  );
});

test("buildLegacyAvailabilityPayload keeps the current deployed API working during rollout", () => {
  assert.deepEqual(
    buildLegacyAvailabilityPayload({
      roomId: "2",
      arrivalDate: "2026-06-03",
      departureDate: "2026-06-05",
      adultCount: "2",
      childCount: "1",
    }),
    {
      roomId: 2,
      arrivalDate: "2026-06-03",
      departureDate: "2026-06-05",
      adults: 2,
      adult: 2,
      adultCount: 2,
      children: 1,
      childCount: 1,
    }
  );
});

test("readItems supports direct arrays and paged backend responses", () => {
  const rooms = [{ id: 1 }, { id: 2 }];
  assert.deepEqual(readItems(rooms), rooms);
  assert.deepEqual(readItems({ items: rooms, totalItems: 2 }), rooms);
  assert.deepEqual(readItems({ Items: rooms, TotalItems: 2 }), rooms);
  assert.deepEqual(readItems({ data: rooms }), rooms);
  assert.deepEqual(readItems({ message: "empty" }), []);
});
