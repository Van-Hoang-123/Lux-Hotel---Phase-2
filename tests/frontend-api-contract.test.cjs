const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildAvailabilityPayload,
  buildBookingPayload,
  buildLegacyAvailabilityPayload,
  formatDateForApi,
  formatDateForLegacyApi,
  readItems,
} = require("../Lux Hotel 1/api-contract.js");

test("formatDateForApi sends dates in the deployed backend yyyy-MM-dd format", () => {
  assert.equal(formatDateForApi("2026-06-03"), "2026-06-03");
  assert.equal(formatDateForApi("03-06-2026"), "2026-06-03");
  assert.equal(formatDateForApi("03-Jun-2026"), "2026-06-03");
  assert.equal(formatDateForLegacyApi("2026-06-03"), "03-06-2026");
});

test("buildAvailabilityPayload matches the booking availability API", () => {
  const payload = buildAvailabilityPayload({
    roomId: "3",
    arrivalDate: "2026-06-03",
    departureDate: "2026-06-05",
    adultCount: "2",
    childCount: "1",
  });

  assert.deepEqual(payload, {
    roomId: 3,
    arrivalDate: "2026-06-03",
    departureDate: "2026-06-05",
    adultCount: 2,
    childCount: 1,
  });
  assert.equal(Object.hasOwn(payload, "adult"), false);
  assert.equal(Object.hasOwn(payload, "adults"), false);
  assert.equal(Object.hasOwn(payload, "children"), false);
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
      arrivalDate: "2026-06-03",
      departureDate: "2026-06-05",
      adultCount: 2,
      childCount: 1,
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
      arrivalDate: "03-06-2026",
      departureDate: "05-06-2026",
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
