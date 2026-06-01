(function attachLuxApiContract(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.LuxApiContract = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function createLuxApiContract() {
  function padDatePart(value) {
    return String(value).padStart(2, "0");
  }

  function formatDateForApi(value) {
    if (!value) return "";
    const raw = String(value).trim();
    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      return raw;
    }

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return `${padDatePart(date.getDate())}-${padDatePart(date.getMonth() + 1)}-${date.getFullYear()}`;
  }

  function readItems(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.Items)) return data.Items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  function buildAvailabilityPayload({ arrivalDate, departureDate, adultCount, childCount }) {
    return {
      arrivalDate: formatDateForApi(arrivalDate),
      departureDate: formatDateForApi(departureDate),
      adult: Number(adultCount),
      children: Number(childCount),
    };
  }

  function buildBookingPayload({ roomId, arrivalDate, departureDate, adultCount, childCount }) {
    return {
      roomId: Number(roomId),
      arrivalDate: formatDateForApi(arrivalDate),
      departureDate: formatDateForApi(departureDate),
      adult: Number(adultCount),
      children: Number(childCount),
    };
  }

  function buildLegacyAvailabilityPayload({ roomId, arrivalDate, departureDate, adultCount, childCount }) {
    return {
      roomId: Number(roomId),
      arrivalDate,
      departureDate,
      adults: Number(adultCount),
      adult: Number(adultCount),
      adultCount: Number(adultCount),
      children: Number(childCount),
      childCount: Number(childCount),
    };
  }

  return {
    buildAvailabilityPayload,
    buildBookingPayload,
    buildLegacyAvailabilityPayload,
    formatDateForApi,
    readItems,
  };
});
