const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const backendPorts = ["7200", "7201", "7202", "5255"];
const localHosts = ["localhost", "127.0.0.1", ""];
const isLocalHost = localHosts.includes(window.location.hostname);

function normalizeApiBase(value) {
  return value ? value.replace(/\/+$/, "") : "";
}

function buildApiCandidates() {
  const configured = normalizeApiBase(window.LUX_API_BASE_URL || localStorage.getItem("luxApiBaseUrl") || "");
  const candidates = [];

  if (configured) candidates.push(configured);

  if (window.location.protocol.startsWith("http") && (!isLocalHost || backendPorts.includes(window.location.port))) {
    candidates.push(`${window.location.origin}/api`);
  }

  if (isLocalHost) {
    backendPorts.forEach((port) => candidates.push(`http://127.0.0.1:${port}/api`));
  }

  return [...new Set(candidates.map(normalizeApiBase).filter(Boolean))];
}

const apiCandidates = buildApiCandidates();
let apiBaseUrl = apiCandidates[0] || "/api";
const authStorageKey = "luxHotelAuth";
const languageStorageKey = "luxHotelLanguage";
const themeStorageKey = "luxHotelTheme";
const toastTimeoutMs = 4400;
const maxGuestCount = 20;
const authEndpointPaths = {
  login: ["/auth/login", "/Auth/login"],
  register: ["/auth/register", "/Auth/register"],
  profile: ["/auth/profile", "/auth/me", "/users/profile", "/users/me", "/profile"],
};
const supportedLanguages = ["en", "vi"];
let currentLanguage = supportedLanguages.includes(localStorage.getItem(languageStorageKey))
  ? localStorage.getItem(languageStorageKey)
  : "en";
let currentTheme = localStorage.getItem(themeStorageKey) === "night" ? "night" : "day";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isLowPowerDevice =
  prefersReducedMotion ||
  navigator.connection?.saveData ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 4);
document.documentElement.classList.toggle("low-power", Boolean(isLowPowerDevice));
const apiContract = window.LuxApiContract || {
  buildAvailabilityPayload: ({ arrivalDate, departureDate, adultCount, childCount }) => ({
    arrivalDate,
    departureDate,
    adult: Number(adultCount),
    children: Number(childCount),
  }),
  buildLegacyAvailabilityPayload: ({ roomId, arrivalDate, departureDate, adultCount, childCount }) => ({
    roomId: Number(roomId),
    arrivalDate,
    departureDate,
    adults: Number(adultCount),
    adult: Number(adultCount),
    adultCount: Number(adultCount),
    children: Number(childCount),
    childCount: Number(childCount),
  }),
  readItems: (data) => (Array.isArray(data) ? data : data?.items || data?.Items || []),
};

const translations = {
  en: {
    "brand.home": "Lux Hotel home",
    "nav.rooms": "Rooms",
    "nav.dining": "Dining",
    "nav.amenities": "Amenities",
    "nav.gallery": "Gallery",
    "nav.journal": "Journal",
    "nav.account": "Account",
    "nav.reserve": "Reserve",
    "nav.preferences": "Display preferences",
    "nav.language": "Language",
    "nav.openMenu": "Open menu",
    "theme.day": "Day",
    "theme.night": "Night",
    "theme.switchToDay": "Switch to day mode",
    "theme.switchToNight": "Switch to night mode",
    "common.prev": "Prev",
    "common.next": "Next",
    "common.close": "Close",
    "common.verifiedGuest": "Verified guest",
    "hero.eyebrow": "Amelia Island, Panama",
    "hero.title": "A quieter kind of luxury.",
    "hero.copy": "Coastal suites, thoughtful dining, and island calm within minutes of the bay.",
    "hero.check": "Check availability",
    "hero.explore": "Explore rooms",
    "hero.chipVillas": "Ocean-facing villas",
    "hero.chipDining": "Private dining",
    "hero.chipConcierge": "Island concierge",
    "hero.prevAria": "Previous hero image",
    "hero.nextAria": "Next hero image",
    "booking.eyebrow": "Reservations",
    "booking.title": "Plan your stay.",
    "booking.room": "Room",
    "booking.arrival": "Arrival",
    "booking.departure": "Departure",
    "booking.adults": "Adults",
    "booking.children": "Children",
    "booking.search": "Search rooms",
    "booking.chooseRoom": "Choose room",
    "booking.checking": "Checking...",
    "booking.availableFallback": "Room is available.",
    "booking.unavailableFallback": "Room is not available.",
    "booking.availableRooms": "{{count}} room is available for your stay.",
    "booking.availableRooms_plural": "{{count}} rooms are available for your stay.",
    "booking.noAvailableRooms": "No rooms are available for those dates and guests.",
    "booking.emptyResponse": "Availability checked, but the backend did not return details.",
    "booking.estimatedTotal": " Estimated total: {{total}}.",
    "booking.checkFailed": "Could not check availability.",
    "booking.connectError": "Cannot connect to the backend API. Start the backend and try again.",
    "intro.eyebrow": "Panama's finest hotel",
    "intro.title": "Golden-hour rooms, bay air, and a slower rhythm.",
    "intro.copyOne": "Make memories at Lux Hotel, Amelia Island, where southern charm, quiet scenery, and casually elegant surroundings shape a calmer beachfront stay.",
    "intro.copyTwo": "Recently renewed rooms, organic dining, spa rituals, and personal concierge service make the resort feel polished without becoming loud.",
    "intro.imageAlt": "Lux Hotel lounge and island view",
    "rooms.eyebrow": "Accommodation",
    "rooms.title": "Suites and villas with room to breathe.",
    "rooms.defaultTitle": "Lux Hotel Room",
    "rooms.defaultCopy": "A refined room for a quieter coastal stay.",
    "rooms.defaultView": "Garden view",
    "rooms.priceFrom": "From {{price}} / night",
    "rooms.viewDetails": "View details",
    "rooms.viewDetailsAria": "View {{room}} details",
    "rooms.empty": "No rooms match this search yet. Try another date or guest count.",
    "experience.eyebrow": "Dining & Spa",
    "experience.book": "Book now",
    "amenities.eyebrow": "Vacation at ease",
    "amenities.title": "Every detail handled before you ask.",
    "gallery.eyebrow": "Gallery",
    "gallery.title": "Small scenes from a quieter stay.",
    "gallery.openAria": "Open {{title}}",
    "reviews.eyebrow": "Guest notes",
    "reviews.title": "Quiet service. Clear memories.",
    "journal.eyebrow": "Journal",
    "journal.title": "Stories from the island.",
    "journal.defaultTitle": "Lux Hotel Journal",
    "journal.defaultTag": "Journal",
    "journal.defaultCopy": "Stories from the island.",
    "account.eyebrow": "Guest account",
    "account.title": "Manage your Lux Hotel stay.",
    "account.summarySignedOut": "Sign in to keep your booking profile ready before arrival.",
    "account.summarySignedIn": "Welcome back, {{name}}.",
    "account.formsAria": "Guest account forms",
    "account.login": "Login",
    "account.register": "Register",
    "account.email": "Email",
    "account.password": "Password",
    "account.fullName": "Full name",
    "account.confirmPassword": "Confirm password",
    "account.phone": "Phone number",
    "account.createAccount": "Create account",
    "account.signedInAs": "Signed in as",
    "account.guest": "Guest",
    "account.ready": "Guest account ready",
    "account.logout": "Logout",
    "account.loggingIn": "Logging in...",
    "account.creating": "Creating...",
    "account.required": "Fill in the required account fields.",
    "account.passwordMismatch": "Confirm password must match password.",
    "account.loginFailed": "Login failed.",
    "account.registerFailed": "Registration failed.",
    "account.missingToken": "Account response did not include an access token.",
    "account.loggedInAs": "Logged in as {{name}}.",
    "account.createdFor": "Account created for {{name}}.",
    "account.connectError": "Cannot connect to the backend auth API.",
    "account.loggedOut": "Logged out.",
    "footer.location": "Amelia Island, Panama",
    "footer.note": "Southern charm, quiet scenery, and casually elegant surroundings near the bay.",
    "footer.contact": "Contact",
    "footer.navigation": "Footer navigation",
    "footer.quickLinks": "Quick links",
    "footer.home": "Home",
    "footer.terms": "Terms & Conditions",
    "footer.faq": "FAQ",
    "footer.newsletter": "Don't miss any updates",
    "footer.emailPlaceholder": "Email address",
    "footer.signUp": "Sign up now",
    "footer.bottom": "© Built with pride and care by ThemeBubble. All rights reserved.",
    "footer.goTop": "Go to top",
    "modal.closeRoom": "Close room details",
    "modal.reserve": "Reserve this stay",
    "modal.closeGallery": "Close gallery image",
    "errors.arrivalRequired": "Choose an arrival date.",
    "errors.departureRequired": "Choose a departure date.",
    "errors.arrivalPast": "Arrival date cannot be in the past.",
    "errors.departureAfterArrival": "Departure must be after arrival.",
    "errors.adultRequired": "At least one adult is required.",
    "errors.adultsMax": "Adults must be {{max}} or fewer.",
    "errors.childrenNegative": "Children cannot be negative.",
    "errors.childrenMax": "Children must be {{max}} or fewer.",
    "errors.emailRequired": "Enter your email.",
  },
  vi: {
    "brand.home": "Trang chủ Lux Hotel",
    "nav.rooms": "Phòng",
    "nav.dining": "Ẩm thực",
    "nav.amenities": "Tiện ích",
    "nav.gallery": "Bộ sưu tập",
    "nav.journal": "Nhật ký",
    "nav.account": "Tài khoản",
    "nav.reserve": "Đặt phòng",
    "nav.preferences": "Tùy chọn hiển thị",
    "nav.language": "Ngôn ngữ",
    "nav.openMenu": "Mở menu",
    "theme.day": "Sáng",
    "theme.night": "Tối",
    "theme.switchToDay": "Chuyển sang chế độ sáng",
    "theme.switchToNight": "Chuyển sang chế độ tối",
    "common.prev": "Trước",
    "common.next": "Sau",
    "common.close": "Đóng",
    "common.verifiedGuest": "Khách đã xác thực",
    "hero.eyebrow": "Đảo Amelia, Panama",
    "hero.title": "Một kiểu sang trọng thật yên tĩnh.",
    "hero.copy": "Phòng suite ven biển, ẩm thực tinh tế và sự bình yên của đảo chỉ cách vịnh vài phút.",
    "hero.check": "Kiểm tra phòng",
    "hero.explore": "Xem phòng",
    "hero.chipVillas": "Biệt thự hướng biển",
    "hero.chipDining": "Bữa tối riêng",
    "hero.chipConcierge": "Dịch vụ đảo",
    "hero.prevAria": "Ảnh hero trước",
    "hero.nextAria": "Ảnh hero tiếp theo",
    "booking.eyebrow": "Đặt phòng",
    "booking.title": "Lên kế hoạch nghỉ dưỡng.",
    "booking.room": "Phòng",
    "booking.arrival": "Ngày đến",
    "booking.departure": "Ngày đi",
    "booking.adults": "Người lớn",
    "booking.children": "Trẻ em",
    "booking.search": "Tìm phòng",
    "booking.chooseRoom": "Chọn phòng",
    "booking.checking": "Đang kiểm tra...",
    "booking.availableFallback": "Phòng còn trống.",
    "booking.unavailableFallback": "Phòng không còn trống.",
    "booking.availableRooms": "Có {{count}} phòng phù hợp cho kỳ nghỉ của bạn.",
    "booking.availableRooms_plural": "Có {{count}} phòng phù hợp cho kỳ nghỉ của bạn.",
    "booking.noAvailableRooms": "Không có phòng phù hợp với ngày và số khách đã chọn.",
    "booking.emptyResponse": "Đã kiểm tra phòng, nhưng backend chưa trả về chi tiết.",
    "booking.estimatedTotal": " Tổng dự kiến: {{total}}.",
    "booking.checkFailed": "Không kiểm tra được tình trạng phòng.",
    "booking.connectError": "Không kết nối được backend. Hãy chạy backend rồi thử lại.",
    "intro.eyebrow": "Khách sạn tốt nhất Panama",
    "intro.title": "Phòng ngập nắng chiều, gió vịnh và nhịp sống chậm rãi.",
    "intro.copyOne": "Tạo kỷ niệm tại Lux Hotel, đảo Amelia, nơi nét duyên phương Nam, cảnh biển yên tĩnh và không gian thanh lịch tạo nên kỳ nghỉ dịu lại.",
    "intro.copyTwo": "Phòng mới được làm lại, ẩm thực organic, liệu trình spa và concierge riêng giúp resort chỉn chu mà vẫn nhẹ nhàng.",
    "intro.imageAlt": "Phòng lounge Lux Hotel và khung cảnh đảo",
    "rooms.eyebrow": "Lưu trú",
    "rooms.title": "Suite và villa rộng rãi để bạn thật sự thư giãn.",
    "rooms.defaultTitle": "Phòng Lux Hotel",
    "rooms.defaultCopy": "Một căn phòng tinh tế cho kỳ nghỉ ven biển yên tĩnh hơn.",
    "rooms.defaultView": "Hướng vườn",
    "rooms.priceFrom": "Từ {{price}} / đêm",
    "rooms.viewDetails": "Xem chi tiết",
    "rooms.viewDetailsAria": "Xem chi tiết {{room}}",
    "rooms.empty": "Chưa có phòng phù hợp. Hãy thử ngày hoặc số khách khác.",
    "experience.eyebrow": "Ẩm thực & Spa",
    "experience.book": "Đặt ngay",
    "amenities.eyebrow": "Nghỉ dưỡng nhẹ nhàng",
    "amenities.title": "Mọi chi tiết đã sẵn sàng trước khi bạn cần.",
    "gallery.eyebrow": "Bộ sưu tập",
    "gallery.title": "Những khoảnh khắc nhỏ của một kỳ nghỉ yên bình.",
    "gallery.openAria": "Mở {{title}}",
    "reviews.eyebrow": "Cảm nhận khách",
    "reviews.title": "Dịch vụ nhẹ nhàng. Kỷ niệm rõ nét.",
    "journal.eyebrow": "Nhật ký",
    "journal.title": "Câu chuyện từ hòn đảo.",
    "journal.defaultTitle": "Nhật ký Lux Hotel",
    "journal.defaultTag": "Nhật ký",
    "journal.defaultCopy": "Câu chuyện từ hòn đảo.",
    "account.eyebrow": "Tài khoản khách",
    "account.title": "Quản lý kỳ nghỉ Lux Hotel.",
    "account.summarySignedOut": "Đăng nhập để chuẩn bị hồ sơ đặt phòng trước ngày đến.",
    "account.summarySignedIn": "Chào mừng trở lại, {{name}}.",
    "account.formsAria": "Biểu mẫu tài khoản khách",
    "account.login": "Đăng nhập",
    "account.register": "Đăng ký",
    "account.email": "Email",
    "account.password": "Mật khẩu",
    "account.fullName": "Họ tên",
    "account.confirmPassword": "Xác nhận mật khẩu",
    "account.phone": "Số điện thoại",
    "account.createAccount": "Tạo tài khoản",
    "account.signedInAs": "Đang đăng nhập là",
    "account.guest": "Khách",
    "account.ready": "Tài khoản khách đã sẵn sàng",
    "account.logout": "Đăng xuất",
    "account.loggingIn": "Đang đăng nhập...",
    "account.creating": "Đang tạo...",
    "account.required": "Vui lòng nhập đủ thông tin tài khoản bắt buộc.",
    "account.passwordMismatch": "Xác nhận mật khẩu phải trùng với mật khẩu.",
    "account.loginFailed": "Đăng nhập thất bại.",
    "account.registerFailed": "Đăng ký thất bại.",
    "account.missingToken": "Phản hồi tài khoản không có access token.",
    "account.loggedInAs": "Đã đăng nhập với tên {{name}}.",
    "account.createdFor": "Đã tạo tài khoản cho {{name}}.",
    "account.connectError": "Không kết nối được API đăng nhập của backend.",
    "account.loggedOut": "Đã đăng xuất.",
    "footer.location": "Đảo Amelia, Panama",
    "footer.note": "Nét duyên phương Nam, khung cảnh yên tĩnh và không gian thanh lịch gần vịnh.",
    "footer.contact": "Liên hệ",
    "footer.navigation": "Điều hướng cuối trang",
    "footer.quickLinks": "Liên kết nhanh",
    "footer.home": "Trang chủ",
    "footer.terms": "Điều khoản",
    "footer.faq": "FAQ",
    "footer.newsletter": "Đừng bỏ lỡ cập nhật",
    "footer.emailPlaceholder": "Địa chỉ email",
    "footer.signUp": "Đăng ký nhận tin",
    "footer.bottom": "© Được xây dựng bằng sự chăm chút bởi ThemeBubble. Mọi quyền được bảo lưu.",
    "footer.goTop": "Lên đầu trang",
    "modal.closeRoom": "Đóng chi tiết phòng",
    "modal.reserve": "Đặt kỳ nghỉ này",
    "modal.closeGallery": "Đóng ảnh bộ sưu tập",
    "errors.arrivalRequired": "Chọn ngày đến.",
    "errors.departureRequired": "Chọn ngày đi.",
    "errors.arrivalPast": "Ngày đến không được ở quá khứ.",
    "errors.departureAfterArrival": "Ngày đi phải sau ngày đến.",
    "errors.adultRequired": "Cần ít nhất một người lớn.",
    "errors.adultsMax": "Người lớn phải từ {{max}} trở xuống.",
    "errors.childrenNegative": "Số trẻ em không được âm.",
    "errors.childrenMax": "Số trẻ em phải từ {{max}} trở xuống.",
    "errors.emailRequired": "Nhập email của bạn.",
  },
};

async function apiFetch(path, options = {}) {
  const orderedCandidates = [...new Set([apiBaseUrl, ...apiCandidates])];
  let lastError;

  for (const baseUrl of orderedCandidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);

      if (response.ok) {
        apiBaseUrl = baseUrl;
        return response;
      }

      if (![404, 405].includes(response.status)) {
        apiBaseUrl = baseUrl;
        return response;
      }

      lastError = new Error(`API returned ${response.status} from ${baseUrl}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Cannot connect to API.");
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function apiFetchFirst(paths, options = {}) {
  let lastError;

  for (const path of paths) {
    try {
      return await apiFetch(path, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Cannot connect to API.");
}

function t(key, values = {}) {
  const fallback = translations.en[key] || key;
  const message = translations[currentLanguage]?.[key] || fallback;
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
    message
  );
}

function localized(item, key) {
  if (currentLanguage === "vi" && item?.[`${key}Vi`]) return item[`${key}Vi`];
  return item?.[key] || "";
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function localImagePath(path, fallback = "./Images/Room - Standard.jpg") {
  if (!path) return fallback;
  if (path.startsWith("/Images/")) return `.${path}`;
  return path;
}

function formatMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value || "$60";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number);
}

function plural(value, singular, pluralName = `${singular}s`) {
  return `${value} ${value === 1 ? singular : pluralName}`;
}

function formatGuests(adults, children) {
  if (currentLanguage === "vi") {
    const parts = [`${adults} người lớn`];
    if (children > 0) parts.push(`${children} trẻ em`);
    return parts.join(", ");
  }

  const parts = [plural(adults, "adult")];
  if (children > 0) parts.push(plural(children, "child", "children"));
  return parts.join(", ");
}

function authHeader() {
  const auth = getStoredAuth();
  return auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
}

function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(authStorageKey) || "null");
  } catch {
    return null;
  }
}

function readJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return {};
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(window.atob(padded));
  } catch {
    return {};
  }
}

function firstValue(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

function normalizeAuthUser(user = {}, token = "") {
  const claims = readJwtPayload(token);
  const nameClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
  const emailClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
  const idClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
  const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
  const roles = user.roles || user.Roles || claims.roles || claims.Roles || claims.role || claims[roleClaim] || [];

  return {
    id: firstValue(user.id, user.Id, claims.sub, claims.nameid, claims[idClaim]),
    email: firstValue(user.email, user.Email, claims.email, claims.Email, claims[emailClaim]),
    fullName: firstValue(
      user.fullName,
      user.FullName,
      user.name,
      user.Name,
      user.userName,
      user.UserName,
      claims.fullName,
      claims.FullName,
      claims.name,
      claims.unique_name,
      claims[nameClaim]
    ),
    roles: Array.isArray(roles) ? roles : [roles].filter(Boolean),
  };
}

function storeAuth(data) {
  const user = data?.user || data?.User || data?.profile || data?.Profile || data || {};
  const token = data?.token || data?.Token || data?.accessToken || data?.AccessToken || data?.access_token || "";
  const expiresAtUtc = data?.expiresAtUtc || data?.ExpiresAtUtc || "";

  if (!token) return null;

  const auth = {
    token,
    expiresAtUtc,
    user: normalizeAuthUser(user, token),
  };

  localStorage.setItem(authStorageKey, JSON.stringify(auth));
  return auth;
}

function saveAuth(auth) {
  localStorage.setItem(authStorageKey, JSON.stringify(auth));
  return auth;
}

function clearStoredAuth() {
  localStorage.removeItem(authStorageKey);
}

function getDisplayName(user = {}) {
  return user.fullName || user.email || t("account.guest");
}

async function refreshAuthProfile(auth) {
  if (!auth?.token) return auth;

  for (const path of authEndpointPaths.profile) {
    try {
      const response = await apiFetch(path, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) continue;

      const data = await readJson(response);
      const profile = data?.user || data?.User || data?.profile || data?.Profile || data || {};
      const normalized = normalizeAuthUser(profile, auth.token);
      const user = {
        id: normalized.id || auth.user?.id || "",
        email: normalized.email || auth.user?.email || "",
        fullName: normalized.fullName || auth.user?.fullName || "",
        roles: normalized.roles.length ? normalized.roles : auth.user?.roles || [],
      };
      return saveAuth({ ...auth, user });
    } catch {
      // Profile endpoints are optional; login/register responses may already include the database user.
    }
  }

  return auth;
}

function formatApiError(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  const errors = data.errors || data.Errors;

  if (Array.isArray(errors) && errors.length) {
    const message = data.message || data.Message;
    return [message, errors.join(" ")].filter(Boolean).join(" ");
  }

  if (errors && typeof errors === "object") {
    const details = Object.values(errors).flat().filter(Boolean).join(" ");
    if (details) return details;
  }

  if (data.message || data.Message) return data.message || data.Message;
  return data.title || data.Title || fallback;
}

function readBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return null;
}

function formatBookingResponse(data) {
  if (!data) {
    return {
      type: "warning",
      message: t("booking.emptyResponse"),
    };
  }

  if (Array.isArray(data)) {
    return {
      type: data.length ? "success" : "warning",
      message: availableRoomsMessage(data.length),
    };
  }

  const isAvailable = readBoolean(data?.isAvailable ?? data?.IsAvailable ?? data?.available ?? data?.Available);
  const success = readBoolean(data?.success ?? data?.Success ?? data?.succeeded ?? data?.Succeeded);
  const isNegative = isAvailable === false || success === false;
  const message = data?.message || data?.Message || (isNegative ? t("booking.unavailableFallback") : t("booking.availableFallback"));
  const estimatedTotal = data?.estimatedTotalPrice ?? data?.EstimatedTotalPrice ?? data?.totalPrice ?? data?.TotalPrice;
  const total =
    estimatedTotal !== null && estimatedTotal !== undefined && estimatedTotal !== ""
      ? t("booking.estimatedTotal", { total: formatMoney(estimatedTotal) })
      : "";

  return {
    type: isNegative ? "warning" : "success",
    message: `${message}${total}`,
  };
}

const fallbackRooms = [
  {
    id: 1,
    title: "Standard Room",
    titleVi: "Phòng Tiêu Chuẩn",
    image: "./Images/Room - Standard.jpg",
    price: "From $60 / night",
    priceVi: "Từ $60 / đêm",
    copy: "Warm textures, soft linens, and a private corner for slower mornings.",
    copyVi: "Chất liệu ấm, khăn giường mềm và góc riêng tư cho những buổi sáng chậm rãi.",
    size: "34 m2",
    view: "Garden view",
    viewVi: "Hướng vườn",
    guests: "2 adults",
    capacityAdults: 2,
    capacityChildren: 0,
    amenities: ["King bed", "Rain shower", "Reading lounge", "Evening turndown"],
    amenitiesVi: ["Giường king", "Sen tắm mưa", "Góc đọc sách", "Dọn phòng buổi tối"],
  },
  {
    id: 2,
    title: "Beach Villa",
    titleVi: "Biệt Thự Biển",
    image: "./Images/Room - Beach Villa.jpg",
    price: "From $90 / night",
    priceVi: "Từ $90 / đêm",
    copy: "Steps from the shore with open-air lounging and quiet ocean light.",
    copyVi: "Cách bờ biển vài bước chân, có không gian thư giãn mở và ánh biển dịu nhẹ.",
    size: "52 m2",
    view: "Ocean edge",
    viewVi: "Sát biển",
    guests: "2 adults, 1 child",
    capacityAdults: 2,
    capacityChildren: 1,
    amenities: ["Private deck", "Outdoor shower", "Beach breakfast", "Concierge pickup"],
    amenitiesVi: ["Hiên riêng", "Tắm ngoài trời", "Bữa sáng bên biển", "Đón riêng bởi concierge"],
  },
  {
    id: 3,
    title: "Exclusive Suite",
    titleVi: "Suite Độc Quyền",
    image: "./Images/Room - Exclusive Suite.jpg",
    price: "From $120 / night",
    priceVi: "Từ $120 / đêm",
    copy: "A refined suite for longer stays, private dining, and terrace evenings.",
    copyVi: "Suite tinh tế cho kỳ nghỉ dài, bữa tối riêng và những buổi tối ngoài hiên.",
    size: "68 m2",
    view: "Bay terrace",
    viewVi: "Hiên nhìn vịnh",
    guests: "3 adults, 1 child",
    capacityAdults: 3,
    capacityChildren: 1,
    amenities: ["Separate lounge", "Terrace dining", "Soaking tub", "Priority spa booking"],
    amenitiesVi: ["Phòng khách riêng", "Bữa tối ngoài hiên", "Bồn tắm ngâm", "Ưu tiên đặt spa"],
  },
  {
    id: 4,
    title: "Luxury Suite",
    titleVi: "Suite Cao Cấp",
    image: "./Images/Room - Luxury Suite.jpg",
    price: "From $160 / night",
    priceVi: "Từ $160 / đêm",
    copy: "The signature stay: generous space, bay views, and personal service.",
    copyVi: "Lựa chọn đặc trưng với không gian rộng, hướng vịnh và dịch vụ cá nhân.",
    size: "86 m2",
    view: "Panoramic bay",
    viewVi: "Toàn cảnh vịnh",
    guests: "4 adults, 2 children",
    capacityAdults: 4,
    capacityChildren: 2,
    amenities: ["Private host", "Sunset balcony", "Chef breakfast", "Late checkout"],
    amenitiesVi: ["Quản gia riêng", "Ban công hoàng hôn", "Bữa sáng đầu bếp", "Trả phòng muộn"],
  },
];

let rooms = [...fallbackRooms];
let allRooms = [...fallbackRooms];
let selectedRoomId = rooms[0]?.id || 1;

function findKnownRoom(room, title) {
  const id = Number(room.id || 0);
  return fallbackRooms.find((item) => item.id === id || item.title.toLowerCase() === String(title).toLowerCase());
}

function normalizeRoom(room) {
  const image = room.images?.[0]?.url || room.Images?.[0]?.Url || room.imageUrl || room.ImageUrl || room.image;
  const title = room.title || room.Title || room.name || room.Name || room.roomType || room.RoomType || t("rooms.defaultTitle");
  const nightlyPrice = room.nightlyPrice ?? room.NightlyPrice ?? room.pricePerNight ?? room.PricePerNight ?? room.price ?? room.Price;
  const priceValue = Number(nightlyPrice);
  const knownRoom = findKnownRoom(room, title);
  const capacityAdults = Number(room.capacityAdults ?? room.CapacityAdults ?? room.capacity ?? room.Capacity ?? knownRoom?.capacityAdults ?? 2);
  const capacityChildren = Number(room.capacityChildren ?? room.CapacityChildren ?? knownRoom?.capacityChildren ?? 0);
  const amenities = Array.isArray(room.amenities) && room.amenities.length
    ? room.amenities
    : Array.isArray(room.Amenities) && room.Amenities.length
    ? room.Amenities
    : ["King bed", "Rain shower", "Concierge care"];

  return {
    id: Number(room.id || 0),
    title,
    titleVi: knownRoom?.titleVi,
    image: localImagePath(image),
    price:
      Number.isFinite(priceValue) && nightlyPrice !== ""
        ? t("rooms.priceFrom", { price: formatMoney(priceValue) })
        : nightlyPrice || t("rooms.priceFrom", { price: "$60" }),
    priceValue: Number.isFinite(priceValue) ? priceValue : null,
    copy: room.description || room.Description || room.copy || t("rooms.defaultCopy"),
    copyVi: knownRoom?.copyVi,
    size: room.sizeSquareMeters || room.SizeSquareMeters ? `${room.sizeSquareMeters || room.SizeSquareMeters} m2` : room.size || room.Size || "34 m2",
    view: room.viewName || room.ViewName || room.view || room.View || t("rooms.defaultView"),
    viewVi: knownRoom?.viewVi,
    guests: formatGuests(capacityAdults, capacityChildren),
    capacityAdults,
    capacityChildren,
    amenities,
    amenitiesVi: knownRoom?.amenitiesVi,
  };
}

function roomTitle(room) {
  return localized(room, "title") || t("rooms.defaultTitle");
}

function roomPrice(room) {
  if (currentLanguage === "vi" && room.priceVi) return room.priceVi;
  if (room.priceValue !== null && room.priceValue !== undefined) {
    return t("rooms.priceFrom", { price: formatMoney(room.priceValue) });
  }
  return localized(room, "price") || t("rooms.priceFrom", { price: "$60" });
}

function roomCopy(room) {
  return localized(room, "copy") || t("rooms.defaultCopy");
}

function roomView(room) {
  return localized(room, "view") || t("rooms.defaultView");
}

function roomGuests(room) {
  if (Number.isFinite(room.capacityAdults) && Number.isFinite(room.capacityChildren)) {
    return formatGuests(room.capacityAdults, room.capacityChildren);
  }
  return localized(room, "guests") || room.guests || formatGuests(2, 0);
}

function roomAmenities(room) {
  if (currentLanguage === "vi" && Array.isArray(room.amenitiesVi) && room.amenitiesVi.length) {
    return room.amenitiesVi;
  }
  return Array.isArray(room.amenities) ? room.amenities : [];
}

const experiences = [
  {
    image: "./Images/Culinary Experience.jpg",
    title: "Culinary Experience",
    titleVi: "Trải Nghiệm Ẩm Thực",
    copy: "Organic garden ingredients, quiet table service, and menus built around the island.",
    copyVi: "Nguyên liệu organic từ vườn, phục vụ nhẹ nhàng và thực đơn lấy cảm hứng từ hòn đảo.",
    alt: "Dining at Lux Hotel",
    altVi: "Ẩm thực tại Lux Hotel",
  },
  {
    image: "./Images/Spa like no other.jpg",
    title: "Spa Like No Other",
    titleVi: "Spa Thư Giãn Khác Biệt",
    copy: "A calm ritual of native botanicals, warm stones, and coastal stillness.",
    copyVi: "Một nghi thức thư giãn với thảo mộc bản địa, đá ấm và sự tĩnh lặng ven biển.",
    alt: "Spa at Lux Hotel",
    altVi: "Spa tại Lux Hotel",
  },
];
let experienceIndex = 0;

const amenities = [
  {
    title: "Airport Pickup",
    titleVi: "Đón Sân Bay",
    image: "./Images/plane 2.jpg",
    copy: "Arrive with a private transfer already waiting.",
    copyVi: "Đến nơi với xe đưa đón riêng đã sẵn sàng chờ bạn.",
  },
  {
    title: "Breakfast",
    titleVi: "Bữa Sáng",
    image: "./Images/breakfast 2.jpg",
    copy: "Seasonal breakfast served slowly, indoors or by the terrace.",
    copyVi: "Bữa sáng theo mùa được phục vụ thong thả trong nhà hoặc bên hiên.",
  },
  {
    title: "City Guide",
    titleVi: "Hướng Dẫn Thành Phố",
    image: "./Images/tour-guide 2.jpg",
    copy: "Local routes, hidden restaurants, and curated island hours.",
    copyVi: "Lộ trình địa phương, nhà hàng ẩn mình và lịch trình đảo được chọn lọc.",
  },
  {
    title: "Beach BBQ",
    titleVi: "BBQ Bên Biển",
    image: "./Images/bbq 2.jpg",
    copy: "A low-lit beach dinner arranged by the culinary team.",
    copyVi: "Bữa tối bên biển trong ánh đèn dịu do đội ẩm thực chuẩn bị.",
  },
];

const reviews = [
  {
    name: "Mike Fleetwood",
    image: "./Images/mike-fleetwood.jpg",
    copy: "Perfect location, quiet rooms, and a staff that somehow knew what we needed before we asked.",
    copyVi: "Vị trí hoàn hảo, phòng yên tĩnh và đội ngũ dường như biết chúng tôi cần gì trước khi hỏi.",
  },
  {
    name: "Joanna Roberts",
    image: "./Images/joanna-roberts.jpg",
    copy: "The arrival felt personal, the room was beautiful, and every detail was handled with real care.",
    copyVi: "Khoảnh khắc đến nơi rất riêng tư, phòng đẹp và mọi chi tiết đều được chăm chút thật sự.",
  },
  {
    name: "Alex Johnson",
    image: "./Images/alex-johnson.jpg",
    copy: "A polished hotel without the noise. We came for two nights and immediately wanted another week.",
    copyVi: "Một khách sạn chỉn chu nhưng không ồn ào. Chúng tôi ở hai đêm và lập tức muốn thêm một tuần.",
  },
];

const fallbackJournal = [
  {
    title: "Staying in Style Forever",
    titleVi: "Nghỉ Dưỡng Thanh Lịch",
    slug: "staying-in-style-forever",
    image: "./Images/va0ymkiftpa-368x268.jpg",
    tag: "Lifestyle",
    tagVi: "Phong cách sống",
    copy: "A guide to slower mornings and resort rituals.",
    copyVi: "Gợi ý cho những buổi sáng chậm rãi và các nghi thức nghỉ dưỡng.",
  },
  {
    title: "Electric Feel And Other Things",
    titleVi: "Cảm Hứng Từ Đảo",
    slug: "electric-feel-and-other-things",
    image: "./Images/iStock_000002993908_Medium-1-1-368x268.jpg",
    tag: "Island",
    tagVi: "Hòn đảo",
    copy: "How Panama evenings shape the resort mood.",
    copyVi: "Cách những buổi tối Panama tạo nên nhịp điệu của resort.",
  },
  {
    title: "Why Hotel Comfort Matters",
    titleVi: "Vì Sao Sự Thoải Mái Quan Trọng",
    slug: "why-hotel-comfort-matters",
    image: "./Images/ihwo0unctps-368x268.jpg",
    tag: "Design",
    tagVi: "Thiết kế",
    copy: "The small choices behind a calmer stay.",
    copyVi: "Những lựa chọn nhỏ phía sau một kỳ nghỉ bình yên hơn.",
  },
];

let journal = [...fallbackJournal];

function journalKey(post) {
  return String(post?.slug || post?.title || "").trim().toLowerCase();
}

function findKnownJournalPost(article, title) {
  const slug = String(article.slug || article.Slug || "").trim().toLowerCase();
  const normalizedTitle = String(title || "").trim().toLowerCase();
  return fallbackJournal.find((post) => post.slug === slug || post.title.toLowerCase() === normalizedTitle);
}

function completeJournalPosts(posts) {
  const seen = new Set(posts.map(journalKey).filter(Boolean));
  const missingPosts = fallbackJournal.filter((post) => !seen.has(journalKey(post)));
  return [...posts, ...missingPosts].slice(0, 3);
}

function normalizeArticle(article) {
  const title = article.title || article.Title || t("journal.defaultTitle");
  const knownPost = findKnownJournalPost(article, title);
  const slug = article.slug || article.Slug || knownPost?.slug || "";
  const category = article.category || article.Category || "";

  return {
    title,
    titleVi: knownPost?.titleVi,
    slug,
    image: localImagePath(article.coverImageUrl || article.CoverImageUrl, knownPost?.image || "./Images/va0ymkiftpa-368x268.jpg"),
    tag: knownPost?.tag || category || (slug ? slug.replaceAll("-", " ") : t("journal.defaultTag")),
    tagVi: knownPost?.tagVi,
    copy: article.summary || article.Summary || article.content || article.Content || t("journal.defaultCopy"),
    copyVi: knownPost?.copyVi,
  };
}

const gallery = [
  {
    title: "Golden hour lounge",
    titleVi: "Lounge trong nắng chiều",
    kicker: "Arrival",
    kickerVi: "Đón khách",
    image: "./Images/Panama's Finist Hotel.jpg",
  },
  {
    title: "Barefoot beach light",
    titleVi: "Ánh biển chân trần",
    kicker: "Coast",
    kickerVi: "Bờ biển",
    image: "./Images/Slider 1.jpg",
  },
  {
    title: "Dinner by the island",
    titleVi: "Bữa tối bên đảo",
    kicker: "Dining",
    kickerVi: "Ẩm thực",
    image: "./Images/Culinary Experience.jpg",
  },
  {
    title: "Quiet spa ritual",
    titleVi: "Nghi thức spa yên tĩnh",
    kicker: "Spa",
    kickerVi: "Spa",
    image: "./Images/Spa like no other.jpg",
  },
  {
    title: "Villa mornings",
    titleVi: "Buổi sáng ở villa",
    kicker: "Rooms",
    kickerVi: "Phòng",
    image: "./Images/Room - Beach Villa.jpg",
  },
];

function renderRoomOptions() {
  const select = $("#roomSelect");
  if (!select) return;

  if (!rooms.length) {
    selectedRoomId = 0;
    select.innerHTML = `<option value="">${escapeHtml(t("rooms.empty"))}</option>`;
    return;
  }

  const hasSelected = rooms.some((room) => room.id === selectedRoomId);
  if (!hasSelected) selectedRoomId = rooms[0]?.id || 1;

  select.innerHTML = rooms
    .map((room) => {
      const title = roomTitle(room);
      return `
        <option value="${room.id}" ${room.id === selectedRoomId ? "selected" : ""}>
          ${escapeHtml(title)}
        </option>
      `;
    })
    .join("");
}

function renderRooms() {
  if (!rooms.length) {
    $("#roomsGrid").innerHTML = `<p class="empty-state">${escapeHtml(t("rooms.empty"))}</p>`;
    return;
  }

  $("#roomsGrid").innerHTML = rooms
    .map((room, index) => {
      const title = roomTitle(room);
      return `
        <article class="room-card">
          <button class="room-card-button" type="button" data-room-index="${index}" aria-label="${escapeHtml(t("rooms.viewDetailsAria", { room: title }))}">
            <div class="room-media">
              <img src="${escapeHtml(room.image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" fetchpriority="low" />
            </div>
            <div class="content">
              <p class="price">${escapeHtml(roomPrice(room))}</p>
              <h3>${escapeHtml(title)}</h3>
              <p>${escapeHtml(roomCopy(room))}</p>
              <div class="room-meta">
                <span>${escapeHtml(roomGuests(room))}</span>
                <span>${escapeHtml(roomView(room))}</span>
              </div>
              <strong>${escapeHtml(t("rooms.viewDetails"))}</strong>
            </div>
          </button>
        </article>
      `;
    })
    .join("");
}

function renderAmenities() {
  $("#amenitiesGrid").innerHTML = amenities
    .map(
      (item) => `
        <article class="amenity-card" data-bg="${escapeHtml(item.image)}">
          <h3>${escapeHtml(localized(item, "title"))}</h3>
          <p>${escapeHtml(localized(item, "copy"))}</p>
        </article>
      `
    )
    .join("");
}

function resetRoomResults() {
  if (rooms.length === allRooms.length && rooms.every((room, index) => room.id === allRooms[index]?.id)) return;
  rooms = [...allRooms];
  renderRoomOptions();
  renderRooms();
  window.ScrollTrigger?.refresh();
}

function availableRoomsMessage(count) {
  if (count < 1) return t("booking.noAvailableRooms");
  return t(count === 1 ? "booking.availableRooms" : "booking.availableRooms_plural", { count });
}

function applyAvailableRooms(apiRooms) {
  const availableRooms = apiRooms.map(normalizeRoom).filter((room) => room.id > 0);
  rooms = availableRooms;
  selectedRoomId = availableRooms[0]?.id || 0;
  renderRoomOptions();
  renderRooms();
  window.ScrollTrigger?.refresh();

  return {
    type: availableRooms.length ? "success" : "warning",
    message: availableRoomsMessage(availableRooms.length),
  };
}

function renderReviews() {
  $("#reviewsGrid").innerHTML = reviews
    .map(
      (review) => `
        <article class="review-card">
          <header>
            <img src="${escapeHtml(review.image)}" alt="${escapeHtml(review.name)}" loading="lazy" decoding="async" fetchpriority="low" />
            <div>
              <h3>${escapeHtml(review.name)}</h3>
              <p>${escapeHtml(t("common.verifiedGuest"))}</p>
            </div>
          </header>
          <p>“${escapeHtml(localized(review, "copy"))}”</p>
        </article>
      `
    )
    .join("");
}

function renderJournal() {
  $("#journalGrid").innerHTML = journal
    .map(
      (post) => `
        <article class="journal-card">
          <img src="${escapeHtml(post.image)}" alt="${escapeHtml(localized(post, "title"))}" loading="eager" decoding="async" fetchpriority="low" />
          <div class="content">
            <p class="tag">${escapeHtml(localized(post, "tag"))}</p>
            <h3>${escapeHtml(localized(post, "title"))}</h3>
            <p>${escapeHtml(localized(post, "copy"))}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderGallery() {
  $("#galleryGrid").innerHTML = gallery
    .map((item, index) => {
      const title = localized(item, "title");
      return `
        <button class="gallery-item" type="button" data-gallery-index="${index}" aria-label="${escapeHtml(t("gallery.openAria", { title }))}">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" fetchpriority="low" />
          <span>
            <small>${escapeHtml(localized(item, "kicker"))}</small>
            <strong>${escapeHtml(title)}</strong>
          </span>
        </button>
      `;
    })
    .join("");
}

function setupLazyBackgrounds(root = document) {
  const cards = $$("[data-bg]", root);
  if (!cards.length) return;

  const runWhenIdle = (callback) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 900 });
      return;
    }

    window.setTimeout(callback, 80);
  };

  const loadBackground = (card) => {
    const image = card.dataset.bg;
    if (!image || card.classList.contains("is-bg-loading")) return;

    card.classList.add("is-bg-loading");
    const loader = new Image();
    loader.decoding = "async";
    loader.onload = () => {
      runWhenIdle(() => {
        card.style.backgroundImage = `url("${image.replaceAll('"', '\\"')}")`;
        card.classList.add("is-bg-loaded");
        card.removeAttribute("data-bg");
      });
    };
    loader.onerror = () => {
      card.classList.remove("is-bg-loading");
      card.removeAttribute("data-bg");
    };
    loader.src = image;
  };

  if (!("IntersectionObserver" in window)) {
    cards.forEach(loadBackground);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadBackground(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: isLowPowerDevice ? "900px 0px" : "640px 0px" }
  );

  cards.forEach((card) => observer.observe(card));
}

async function fetchRooms() {
  try {
    const response = await apiFetch("/rooms?sortBy=PricePerNight&order=Asc");
    if (!response.ok) throw new Error("Failed to fetch rooms");

    const data = await readJson(response);
    const apiRooms = apiContract.readItems(data);
    if (!apiRooms.length) return;

    allRooms = apiRooms.map(normalizeRoom).filter((room) => room.id > 0);
    rooms = [...allRooms];
    renderRoomOptions();
    renderRooms();
    window.ScrollTrigger?.refresh();
  } catch (error) {
    console.warn("Using local room data because the API is unavailable.", error);
    renderRoomOptions();
  }
}

async function fetchArticles() {
  try {
    const response = await apiFetchFirst([
      "/articles/pagination?pageNumber=1&pageSize=3",
      "/articles/getAll",
      "/articles",
    ]);
    if (!response.ok) throw new Error("Failed to fetch articles");

    const data = await readJson(response);
    const articles = apiContract.readItems(data);
    if (!articles.length) return;

    journal = completeJournalPosts(articles.map(normalizeArticle));
    renderJournal();
    window.ScrollTrigger?.refresh();
  } catch (error) {
    console.warn("Using local journal data because the API is unavailable.", error);
  }
}

function updateLanguageButtons() {
  $$("[data-language-option]").forEach((button) => {
    const isActive = button.dataset.languageOption === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateThemeButton() {
  const button = $("#themeToggle");
  if (!button) return;
  const nextTheme = currentTheme === "night" ? "day" : "night";
  const label = $("[data-theme-label]", button);
  if (label) label.textContent = t(nextTheme === "night" ? "theme.night" : "theme.day");
  button.setAttribute("aria-label", t(nextTheme === "night" ? "theme.switchToNight" : "theme.switchToDay"));
}

function applyTheme(theme = currentTheme) {
  currentTheme = theme === "night" ? "night" : "day";
  document.documentElement.dataset.theme = currentTheme;
  localStorage.setItem(themeStorageKey, currentTheme);
  updateThemeButton();
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage;

  $$("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  $$("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });

  $$("[data-i18n-alt]").forEach((element) => {
    element.setAttribute("alt", t(element.dataset.i18nAlt));
  });

  $$("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });

  updateLanguageButtons();
  updateThemeButton();
  updateAccountSummary();
}

function renderLocalizedContent() {
  renderRoomOptions();
  renderRooms();
  renderAmenities();
  setupLazyBackgrounds($("#amenitiesGrid"));
  renderReviews();
  renderJournal();
  renderGallery();
  renderExperience();
  updateAccountSummary();
  window.ScrollTrigger?.refresh();
}

function setLanguage(language) {
  if (!supportedLanguages.includes(language) || language === currentLanguage) return;
  currentLanguage = language;
  localStorage.setItem(languageStorageKey, currentLanguage);
  applyStaticTranslations();
  renderLocalizedContent();
}

function setupPreferences() {
  applyTheme(currentTheme);
  applyStaticTranslations();

  $$("[data-language-option]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.languageOption));
  });

  $("#themeToggle")?.addEventListener("click", () => {
    applyTheme(currentTheme === "night" ? "day" : "night");
  });
}

function setupMenu() {
  const button = $(".menu-toggle");
  button.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    button.setAttribute("aria-expanded", String(open));
  });
  $$(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

function setupHeader() {
  const header = $(".site-header");
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupHeroSlider() {
  const slides = $$(".hero-slide");
  let index = 0;
  const show = (nextIndex) => {
    slides[index].classList.remove("is-active");
    index = (nextIndex + slides.length) % slides.length;
    slides[index].classList.add("is-active");
  };
  $("[data-hero-next]").addEventListener("click", () => show(index + 1));
  $("[data-hero-prev]").addEventListener("click", () => show(index - 1));
  window.setInterval(() => show(index + 1), 7000);
}

function renderExperience(nextIndex = experienceIndex, animate = false) {
  const image = $("#experienceImage");
  const title = $("#experienceTitle");
  const copy = $("#experienceCopy");
  if (!image || !title || !copy || !experiences.length) return;

  experienceIndex = (nextIndex + experiences.length) % experiences.length;
  const item = experiences[experienceIndex];
  const update = () => {
    image.src = item.image;
    image.alt = localized(item, "alt");
    title.textContent = localized(item, "title");
    copy.textContent = localized(item, "copy");
    image.style.opacity = "1";
  };

  if (!animate) {
    update();
    return;
  }

  image.style.opacity = "0";
  window.setTimeout(update, 180);
}

function setupExperience() {
  renderExperience();
  $("[data-exp-next]").addEventListener("click", () => renderExperience(experienceIndex + 1, true));
  $("[data-exp-prev]").addEventListener("click", () => renderExperience(experienceIndex - 1, true));
}

function showError(id, visible, message) {
  updateFieldError(id, visible, message);
  if (visible && message) showToast("error", message);
}

function updateFieldError(id, visible, message) {
  const element = $(id);
  if (!element) return;
  if (message) element.textContent = message;
  element.classList.toggle("is-visible", visible);
}

function showToast(type, message) {
  const stack = $("#toastStack");
  if (!stack || !message) return;

  const toast = document.createElement("div");
  toast.className = `site-toast ${type || "warning"}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button type="button" aria-label="Close notification">x</button>
  `;

  const close = () => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 220);
  };

  toast.querySelector("button").addEventListener("click", close);
  stack.append(toast);
  window.requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.setTimeout(close, toastTimeoutMs);
}

function setBookingStatus(type, message) {
  const status = $("#bookingStatus");
  status.className = `form-status booking-status ${type ? type : ""}`;
  status.textContent = message || "";
  if (type && message) showToast(type, message);
}

function setAuthStatus(type, message) {
  const status = $("#authStatus");
  if (!status) return;
  status.className = `form-status ${type ? `is-visible ${type}` : ""}`;
  status.textContent = message || "";
}

function updateAccountSummary(auth = getStoredAuth()) {
  const summary = $("#accountSummary");
  const logoutButton = $("#logoutButton");
  const profile = $("#authProfile");
  const profileName = $("#authProfileName");
  const profileEmail = $("#authProfileEmail");
  const tabs = $(".auth-tabs");
  const panels = $$("[data-auth-panel]");
  if (!summary || !logoutButton) return;

  const user = auth?.user;
  if (auth?.token) {
    const name = getDisplayName(user);
    summary.textContent = t("account.summarySignedIn", { name });
    if (profile) profile.hidden = false;
    if (profileName) profileName.textContent = name;
    if (profileEmail) profileEmail.textContent = user?.email || t("account.ready");
    if (tabs) tabs.hidden = true;
    panels.forEach((panel) => {
      panel.hidden = true;
    });
    logoutButton.hidden = false;
    return;
  }

  summary.textContent = t("account.summarySignedOut");
  if (profile) profile.hidden = true;
  if (profileName) profileName.textContent = t("account.guest");
  if (profileEmail) profileEmail.textContent = "";
  if (tabs) tabs.hidden = false;
  const activePanel = $("[data-auth-panel].is-active") || $("#loginForm");
  panels.forEach((panel) => {
    panel.hidden = panel !== activePanel;
  });
  logoutButton.hidden = true;
}

function validateBookingDates(arrival, departure) {
  const missingArrival = !arrival;
  const missingDeparture = !departure;
  const arrivalRequired = t("errors.arrivalRequired");
  const departureRequired = t("errors.departureRequired");
  updateFieldError("#arrivalDateError", missingArrival, arrivalRequired);
  updateFieldError("#departureDateError", missingDeparture, departureRequired);

  if (missingArrival || missingDeparture) {
    showToast("error", missingArrival ? arrivalRequired : departureRequired);
    return false;
  }

  const arrivalDate = new Date(`${arrival}T00:00:00`);
  const departureDate = new Date(`${departure}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (arrivalDate < today) {
    const message = t("errors.arrivalPast");
    updateFieldError("#arrivalDateError", true, message);
    showToast("error", message);
    return false;
  }

  if (departureDate <= arrivalDate) {
    const message = t("errors.departureAfterArrival");
    updateFieldError("#departureDateError", true, message);
    showToast("error", message);
    return false;
  }

  return true;
}

function readGuestCount(selector) {
  const rawValue = $(selector).value.trim();
  if (!rawValue) return Number.NaN;
  const value = Number(rawValue);
  return Number.isInteger(value) ? value : Number.NaN;
}

function validateGuestCounts(adults, children) {
  if (!Number.isInteger(adults) || adults < 1) {
    showToast("error", t("errors.adultRequired"));
    return false;
  }

  if (adults > maxGuestCount) {
    showToast("error", t("errors.adultsMax", { max: maxGuestCount }));
    return false;
  }

  if (!Number.isInteger(children) || children < 0) {
    showToast("error", t("errors.childrenNegative"));
    return false;
  }

  if (children > maxGuestCount) {
    showToast("error", t("errors.childrenMax", { max: maxGuestCount }));
    return false;
  }

  return true;
}

function normalizeGuestCountInput(input, min, max) {
  if (!input.value.trim()) return;
  const value = Number(input.value);
  if (!Number.isInteger(value)) return;
  input.value = String(Math.min(max, Math.max(min, value)));
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function setupDateBounds() {
  const arrival = $("#arrivalDate");
  const departure = $("#departureDate");
  const todayValue = toDateInputValue(new Date());
  arrival.min = todayValue;
  departure.min = todayValue;

  arrival.addEventListener("change", () => {
    if (!arrival.value) {
      departure.min = todayValue;
      return;
    }

    const nextDay = addDays(new Date(`${arrival.value}T00:00:00`), 1);
    departure.min = toDateInputValue(nextDay);
    if (departure.value && departure.value <= arrival.value) {
      departure.value = "";
    }
  });
}

function switchAuthPanel(mode) {
  $$("[data-auth-tab]").forEach((button) => {
    const isActive = button.dataset.authTab === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  $$("[data-auth-panel]").forEach((panel) => {
    const isActive = panel.dataset.authPanel === mode;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  setAuthStatus("", "");
}

async function submitAuthForm(form, mode) {
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const phoneNumber = String(formData.get("phoneNumber") || "").trim();

  if (!email || !email.includes("@") || !password || (mode === "register" && !fullName)) {
    setAuthStatus("error", t("account.required"));
    return;
  }

  if (mode === "register" && password !== confirmPassword) {
    setAuthStatus("error", t("account.passwordMismatch"));
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = mode === "login" ? t("account.loggingIn") : t("account.creating");

  try {
    const payload =
      mode === "login"
        ? { email, password }
        : { email, password, confirmPassword, fullName, phoneNumber: phoneNumber || null };
    const response = await apiFetchFirst(authEndpointPaths[mode], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await readJson(response);

    if (!response.ok) {
      setAuthStatus("error", formatApiError(data, mode === "login" ? t("account.loginFailed") : t("account.registerFailed")));
      return;
    }

    const auth = storeAuth(data);
    if (!auth) {
      setAuthStatus("warning", t("account.missingToken"));
      return;
    }

    const enrichedAuth = await refreshAuthProfile(auth);
    const name = getDisplayName(enrichedAuth.user);
    updateAccountSummary(enrichedAuth);
    form.reset();
    setAuthStatus("success", mode === "login" ? t("account.loggedInAs", { name }) : t("account.createdFor", { name }));
  } catch (error) {
    console.error("Auth API error:", error);
    setAuthStatus("error", t("account.connectError"));
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = mode === "login" ? t("account.login") : t("account.createAccount");
  }
}

function setupAuthForms() {
  if (!$("#loginForm") || !$("#registerForm")) return;

  updateAccountSummary();
  refreshAuthProfile(getStoredAuth()).then(updateAccountSummary);

  $$("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => switchAuthPanel(button.dataset.authTab));
  });

  $("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    submitAuthForm(event.currentTarget, "login");
  });

  $("#registerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    submitAuthForm(event.currentTarget, "register");
  });

  $("#logoutButton").addEventListener("click", () => {
    clearStoredAuth();
    switchAuthPanel("login");
    updateAccountSummary(null);
    setAuthStatus("success", t("account.loggedOut"));
  });
}

function setupForms() {
  const roomSelect = $("#roomSelect");
  setupDateBounds();

  roomSelect.addEventListener("change", () => {
    selectedRoomId = Number(roomSelect.value || rooms[0]?.id || 1);
    setBookingStatus("", "");
  });

  $("#arrivalDate").addEventListener("change", resetRoomResults);
  $("#departureDate").addEventListener("change", resetRoomResults);
  $("#adult").addEventListener("change", (event) => {
    normalizeGuestCountInput(event.currentTarget, 1, maxGuestCount);
    resetRoomResults();
  });
  $("#children").addEventListener("change", (event) => {
    normalizeGuestCountInput(event.currentTarget, 0, maxGuestCount);
    resetRoomResults();
  });

  $("#check-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const arrival = $("#arrivalDate").value;
    const departure = $("#departureDate").value;
    const adultCount = readGuestCount("#adult");
    const childCount = readGuestCount("#children");
    const roomId = Number.parseInt($("#roomSelect").value || selectedRoomId || allRooms[0]?.id || 0, 10);

    setBookingStatus("", "");
    if (!validateBookingDates(arrival, departure)) return;
    if (!validateGuestCounts(adultCount, childCount)) return;

    submitButton.disabled = true;
    submitButton.textContent = t("booking.checking");

    try {
      let response = await apiFetch("/bookings/check-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify(apiContract.buildAvailabilityPayload({
          arrivalDate: arrival,
          departureDate: departure,
          adultCount,
          childCount,
        })),
      });

      let data = await readJson(response);
      if (!response.ok && roomId > 0) {
        response = await apiFetch("/bookings/check-availability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
          body: JSON.stringify(apiContract.buildLegacyAvailabilityPayload({
            roomId,
            arrivalDate: arrival,
            departureDate: departure,
            adultCount,
            childCount,
          })),
        });
        data = await readJson(response);
      }

      if (!response.ok) {
        setBookingStatus("error", formatApiError(data, t("booking.checkFailed")));
        return;
      }

      const availableRooms = apiContract.readItems(data);
      const result = Array.isArray(data) || availableRooms.length ? applyAvailableRooms(availableRooms) : formatBookingResponse(data);
      setBookingStatus(result.type, result.message);
    } catch (error) {
      console.error("Booking API error:", error);
      setBookingStatus("error", t("booking.connectError"));
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = t("booking.search");
    }
  });

  $("#sign-in-form").addEventListener("submit", (event) => {
    const email = $("#email").value.trim();
    const invalid = !email || !email.includes("@");
    showError("#emailError", invalid, t("errors.emailRequired"));
    if (invalid) event.preventDefault();
  });
}

function setupBackToTop() {
  $("#go-to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function setupRoomModal() {
  const modal = $("#roomModal");
  const image = $("#roomModalImage");
  const title = $("#roomModalTitle");
  const price = $("#roomModalPrice");
  const description = $("#roomModalDescription");
  const stats = $("#roomModalStats");
  const amenitiesList = $("#roomModalAmenities");

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const open = (room) => {
    selectedRoomId = room.id || selectedRoomId;
    renderRoomOptions();
    const titleText = roomTitle(room);
    image.src = room.image;
    image.alt = titleText;
    title.textContent = titleText;
    price.textContent = roomPrice(room);
    description.textContent = roomCopy(room);
    stats.innerHTML = [room.size, roomView(room), roomGuests(room)].map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    amenitiesList.innerHTML = roomAmenities(room).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  $("#roomsGrid").addEventListener("click", (event) => {
    const button = event.target.closest(".room-card-button");
    if (!button) return;
    open(rooms[Number(button.dataset.roomIndex)]);
  });

  $$("[data-close-room]").forEach((button) => button.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) close();
  });
}

function setupGalleryLightbox() {
  const lightbox = $("#galleryLightbox");
  const image = $("#lightboxImage");
  const title = $("#lightboxTitle");
  const kicker = $("#lightboxKicker");

  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const open = (item) => {
    const titleText = localized(item, "title");
    image.src = item.image;
    image.alt = titleText;
    title.textContent = titleText;
    kicker.textContent = localized(item, "kicker");
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  $("#galleryGrid").addEventListener("click", (event) => {
    const button = event.target.closest(".gallery-item");
    if (!button) return;
    open(gallery[Number(button.dataset.galleryIndex)]);
  });

  $$("[data-close-gallery]").forEach((button) => button.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) close();
  });
}

function setupMagneticButtons() {
  const gsap = window.gsap;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  if (!gsap || isLowPowerDevice || coarsePointer) return;

  const buttons = $$(
    ".primary-btn, .ghost-btn, .nav-cta, .language-switch button, .theme-toggle, .booking-form button, .newsletter-row button, .auth-tabs button, .auth-form button, .auth-logout, .experience-actions button, .hero-controls button"
  );

  buttons.forEach((button) => {
    button.classList.add("magnetic");
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      gsap.to(button, { x: x * 0.18, y: y * 0.22, duration: 0.35, overwrite: true });
    });
    button.addEventListener("mouseleave", () => {
      gsap.to(button, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.45)", overwrite: true });
    });
  });
}

function setupAnimations() {
  const gsap = window.gsap;
  if (!gsap || prefersReducedMotion) return;

  const scrollTrigger = window.ScrollTrigger;
  if (scrollTrigger) gsap.registerPlugin(scrollTrigger);

  gsap.defaults({ ease: "power3.out" });

  gsap
    .timeline({ delay: 0.08 })
    .from(".site-header", { y: -22, opacity: 0, duration: 0.72 })
    .from(".hero .eyebrow, #hero-title, .hero-copy, .hero-actions", {
      y: 36,
      opacity: 0,
      duration: 0.88,
      stagger: 0.1,
      clearProps: "transform,opacity",
    }, "-=0.35")
    .from(".booking-form", {
      y: 30,
      opacity: 0,
      duration: 0.78,
      clearProps: "transform,opacity",
    }, "-=0.45")
    .from(".hero-controls", { opacity: 0, duration: 0.45 }, "-=0.35");

  if (!scrollTrigger) return;
  if (isLowPowerDevice) return;

  gsap.to(".hero-slide", {
    yPercent: 8,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.utils.toArray(".intro-grid > *, .section-heading, .experience-content, .account-copy, .auth-shell").forEach((item) => {
    gsap.from(item, {
      y: 34,
      opacity: 0,
      duration: 0.82,
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: item,
        start: "top 84%",
        once: true,
      },
    });
  });

  [".room-card", ".amenity-card", ".gallery-item", ".review-card", ".journal-card"].forEach((selector) => {
    scrollTrigger.batch(selector, {
      start: "top 86%",
      once: true,
      onEnter: (batch) => {
        gsap.from(batch, {
          y: 34,
          opacity: 0,
          duration: 0.74,
          stagger: 0.08,
          overwrite: true,
          clearProps: "transform,opacity",
        });
      },
    });
  });
}

setupPreferences();
renderRooms();
renderRoomOptions();
renderAmenities();
setupLazyBackgrounds();
renderReviews();
renderJournal();
renderGallery();
setupMenu();
setupHeader();
setupHeroSlider();
setupExperience();
setupAuthForms();
setupForms();
setupBackToTop();
setupRoomModal();
setupGalleryLightbox();
setupAnimations();
setupMagneticButtons();
fetchRooms();
fetchArticles();
