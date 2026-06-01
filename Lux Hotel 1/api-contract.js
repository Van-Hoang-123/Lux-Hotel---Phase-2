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

  const shortMonths = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  };

  function formatDateForApi(value) {
    if (!value) return "";
    const raw = String(value).trim();
    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return raw;
    }
    const backendMatch = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (backendMatch) {
      return `${backendMatch[3]}-${backendMatch[2]}-${backendMatch[1]}`;
    }
    const displayMatch = raw.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
    if (displayMatch && shortMonths[displayMatch[2].toLowerCase()]) {
      return `${displayMatch[3]}-${shortMonths[displayMatch[2].toLowerCase()]}-${displayMatch[1]}`;
    }

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
  }

  function formatDateForLegacyApi(value) {
    const isoValue = formatDateForApi(value);
    const isoMatch = isoValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!isoMatch) return isoValue;
    return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
  }

  function readItems(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.Items)) return data.Items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  function buildAvailabilityPayload({ roomId, arrivalDate, departureDate, adultCount, childCount }) {
    return {
      roomId: Number(roomId),
      arrivalDate: formatDateForApi(arrivalDate),
      departureDate: formatDateForApi(departureDate),
      adultCount: Number(adultCount),
      childCount: Number(childCount),
    };
  }

  function buildBookingPayload({ roomId, guestFullName, guestEmail, arrivalDate, departureDate, adultCount, childCount }) {
    return {
      roomId: Number(roomId),
      guestFullName: String(guestFullName || "").trim(),
      guestEmail: String(guestEmail || "").trim(),
      arrivalDate: formatDateForApi(arrivalDate),
      departureDate: formatDateForApi(departureDate),
      adultCount: Number(adultCount),
      childCount: Number(childCount),
    };
  }

  function buildLegacyAvailabilityPayload({ roomId, arrivalDate, departureDate, adultCount, childCount }) {
    return {
      roomId: Number(roomId),
      arrivalDate: formatDateForLegacyApi(arrivalDate),
      departureDate: formatDateForLegacyApi(departureDate),
      adults: Number(adultCount),
      adult: Number(adultCount),
      adultCount: Number(adultCount),
      children: Number(childCount),
      childCount: Number(childCount),
    };
  }

  function buildLegacyBookingPayload({ roomId, guestFullName, guestEmail, arrivalDate, departureDate, adultCount, childCount }) {
    return {
      ...buildLegacyAvailabilityPayload({ roomId, arrivalDate, departureDate, adultCount, childCount }),
      guestFullName: String(guestFullName || "").trim(),
      guestEmail: String(guestEmail || "").trim(),
    };
  }

  return {
    buildAvailabilityPayload,
    buildBookingPayload,
    buildLegacyBookingPayload,
    buildLegacyAvailabilityPayload,
    formatDateForApi,
    formatDateForLegacyApi,
    readItems,
  };
});
