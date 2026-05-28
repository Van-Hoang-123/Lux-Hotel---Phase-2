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
  const parts = [plural(adults, "adult")];
  if (children > 0) parts.push(plural(children, "child", "children"));
  return parts.join(", ");
}

const fallbackRooms = [
  {
    id: 1,
    title: "Standard Room",
    image: "./Images/Room - Standard.jpg",
    price: "From $60 / night",
    copy: "Warm textures, soft linens, and a private corner for slower mornings.",
    size: "34 m2",
    view: "Garden view",
    guests: "2 adults",
    capacityAdults: 2,
    capacityChildren: 0,
    amenities: ["King bed", "Rain shower", "Reading lounge", "Evening turndown"],
  },
  {
    id: 2,
    title: "Beach Villa",
    image: "./Images/Room - Beach Villa.jpg",
    price: "From $90 / night",
    copy: "Steps from the shore with open-air lounging and quiet ocean light.",
    size: "52 m2",
    view: "Ocean edge",
    guests: "2 adults, 1 child",
    capacityAdults: 2,
    capacityChildren: 1,
    amenities: ["Private deck", "Outdoor shower", "Beach breakfast", "Concierge pickup"],
  },
  {
    id: 3,
    title: "Exclusive Suite",
    image: "./Images/Room - Exclusive Suite.jpg",
    price: "From $120 / night",
    copy: "A refined suite for longer stays, private dining, and terrace evenings.",
    size: "68 m2",
    view: "Bay terrace",
    guests: "3 adults, 1 child",
    capacityAdults: 3,
    capacityChildren: 1,
    amenities: ["Separate lounge", "Terrace dining", "Soaking tub", "Priority spa booking"],
  },
  {
    id: 4,
    title: "Luxury Suite",
    image: "./Images/Room - Luxury Suite.jpg",
    price: "From $160 / night",
    copy: "The signature stay: generous space, bay views, and personal service.",
    size: "86 m2",
    view: "Panoramic bay",
    guests: "4 adults, 2 children",
    capacityAdults: 4,
    capacityChildren: 2,
    amenities: ["Private host", "Sunset balcony", "Chef breakfast", "Late checkout"],
  },
];

let rooms = [...fallbackRooms];
let selectedRoomId = rooms[0]?.id || 1;

function normalizeRoom(room) {
  const image = room.images?.[0]?.url || room.imageUrl || room.image;
  const title = room.title || room.name || room.roomType || "Lux Hotel Room";
  const nightlyPrice = room.nightlyPrice ?? room.pricePerNight ?? room.price;
  const capacityAdults = Number(room.capacityAdults ?? room.capacity ?? 2);
  const capacityChildren = Number(room.capacityChildren ?? 0);

  return {
    id: Number(room.id || 0),
    title,
    image: localImagePath(image),
    price:
      typeof nightlyPrice === "number"
        ? `From ${formatMoney(nightlyPrice)} / night`
        : nightlyPrice || "From $60 / night",
    copy: room.description || room.copy || "A refined room for a quieter coastal stay.",
    size: room.sizeSquareMeters ? `${room.sizeSquareMeters} m2` : room.size || "34 m2",
    view: room.viewName || room.view || "Garden view",
    guests: formatGuests(capacityAdults, capacityChildren),
    capacityAdults,
    capacityChildren,
    amenities: Array.isArray(room.amenities) && room.amenities.length
      ? room.amenities
      : ["King bed", "Rain shower", "Concierge care"],
  };
}

const experiences = [
  {
    image: "./Images/Culinary Experience.jpg",
    title: "Culinary Experience",
    copy: "Organic garden ingredients, quiet table service, and menus built around the island.",
  },
  {
    image: "./Images/Spa like no other.jpg",
    title: "Spa Like No Other",
    copy: "A calm ritual of native botanicals, warm stones, and coastal stillness.",
  },
];

const amenities = [
  {
    title: "Airport Pickup",
    image: "./Images/plane 2.jpg",
    copy: "Arrive with a private transfer already waiting.",
  },
  {
    title: "Breakfast",
    image: "./Images/breakfast 2.jpg",
    copy: "Seasonal breakfast served slowly, indoors or by the terrace.",
  },
  {
    title: "City Guide",
    image: "./Images/tour-guide 2.jpg",
    copy: "Local routes, hidden restaurants, and curated island hours.",
  },
  {
    title: "Beach BBQ",
    image: "./Images/bbq 2.jpg",
    copy: "A low-lit beach dinner arranged by the culinary team.",
  },
];

const reviews = [
  {
    name: "Mike Fleetwood",
    image: "./Images/mike-fleetwood.jpg",
    copy: "Perfect location, quiet rooms, and a staff that somehow knew what we needed before we asked.",
  },
  {
    name: "Joanna Roberts",
    image: "./Images/joanna-roberts.jpg",
    copy: "The arrival felt personal, the room was beautiful, and every detail was handled with real care.",
  },
  {
    name: "Alex Johnson",
    image: "./Images/alex-johnson.jpg",
    copy: "A polished hotel without the noise. We came for two nights and immediately wanted another week.",
  },
];

const fallbackJournal = [
  {
    title: "Staying in Style Forever",
    image: "./Images/va0ymkiftpa-368x268.jpg",
    tag: "Lifestyle",
    copy: "A guide to slower mornings and resort rituals.",
  },
  {
    title: "Electric Feel And Other Things",
    image: "./Images/iStock_000002993908_Medium-1-1-368x268.jpg",
    tag: "Island",
    copy: "How Panama evenings shape the resort mood.",
  },
  {
    title: "Why Hotel Comfort Matters",
    image: "./Images/ihwo0unctps-368x268.jpg",
    tag: "Design",
    copy: "The small choices behind a calmer stay.",
  },
];

let journal = [...fallbackJournal];

function normalizeArticle(article) {
  return {
    title: article.title || "Lux Hotel Journal",
    image: localImagePath(article.coverImageUrl, "./Images/va0ymkiftpa-368x268.jpg"),
    tag: article.slug ? article.slug.replaceAll("-", " ") : "Journal",
    copy: article.summary || article.content || "Stories from the island.",
  };
}

const gallery = [
  {
    title: "Golden hour lounge",
    kicker: "Arrival",
    image: "./Images/Panama's Finist Hotel.jpg",
  },
  {
    title: "Barefoot beach light",
    kicker: "Coast",
    image: "./Images/Slider 1.jpg",
  },
  {
    title: "Dinner by the island",
    kicker: "Dining",
    image: "./Images/Culinary Experience.jpg",
  },
  {
    title: "Quiet spa ritual",
    kicker: "Spa",
    image: "./Images/Spa like no other.jpg",
  },
  {
    title: "Villa mornings",
    kicker: "Rooms",
    image: "./Images/Room - Beach Villa.jpg",
  },
];

function renderRoomOptions() {
  const select = $("#roomSelect");
  if (!select) return;

  const hasSelected = rooms.some((room) => room.id === selectedRoomId);
  if (!hasSelected) selectedRoomId = rooms[0]?.id || 1;

  select.innerHTML = rooms
    .map(
      (room) => `
        <option value="${room.id}" ${room.id === selectedRoomId ? "selected" : ""}>
          ${escapeHtml(room.title)}
        </option>
      `
    )
    .join("");
}

function renderRooms() {
  $("#roomsGrid").innerHTML = rooms
    .map(
      (room, index) => `
        <article class="room-card">
          <button class="room-card-button" type="button" data-room-index="${index}" aria-label="View ${escapeHtml(room.title)} details">
            <div class="room-media">
              <img src="${escapeHtml(room.image)}" alt="${escapeHtml(room.title)}" loading="lazy" />
            </div>
            <div class="content">
              <p class="price">${escapeHtml(room.price)}</p>
              <h3>${escapeHtml(room.title)}</h3>
              <p>${escapeHtml(room.copy)}</p>
              <div class="room-meta">
                <span>${escapeHtml(room.guests)}</span>
                <span>${escapeHtml(room.view)}</span>
              </div>
              <strong>View details</strong>
            </div>
          </button>
        </article>
      `
    )
    .join("");
}

function renderAmenities() {
  $("#amenitiesGrid").innerHTML = amenities
    .map(
      (item) => `
        <article class="amenity-card" style="background-image: url('${escapeHtml(item.image)}')">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.copy)}</p>
        </article>
      `
    )
    .join("");
}

function renderReviews() {
  $("#reviewsGrid").innerHTML = reviews
    .map(
      (review) => `
        <article class="review-card">
          <header>
            <img src="${escapeHtml(review.image)}" alt="${escapeHtml(review.name)}" loading="lazy" />
            <div>
              <h3>${escapeHtml(review.name)}</h3>
              <p>Verified guest</p>
            </div>
          </header>
          <p>“${escapeHtml(review.copy)}”</p>
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
          <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy" />
          <div class="content">
            <p class="tag">${escapeHtml(post.tag)}</p>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.copy)}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderGallery() {
  $("#galleryGrid").innerHTML = gallery
    .map(
      (item, index) => `
        <button class="gallery-item" type="button" data-gallery-index="${index}" aria-label="Open ${escapeHtml(item.title)}">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" />
          <span>
            <small>${escapeHtml(item.kicker)}</small>
            <strong>${escapeHtml(item.title)}</strong>
          </span>
        </button>
      `
    )
    .join("");
}

async function fetchRooms() {
  try {
    const response = await apiFetch("/rooms");
    if (!response.ok) throw new Error("Failed to fetch rooms");

    const data = await readJson(response);
    const apiRooms = Array.isArray(data) ? data : data?.items || [];
    if (!apiRooms.length) return;

    rooms = apiRooms.map(normalizeRoom).filter((room) => room.id > 0);
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
    const response = await apiFetch("/articles");
    if (!response.ok) throw new Error("Failed to fetch articles");

    const data = await readJson(response);
    const articles = Array.isArray(data) ? data : data?.items || [];
    if (!articles.length) return;

    journal = articles.map(normalizeArticle);
    renderJournal();
    window.ScrollTrigger?.refresh();
  } catch (error) {
    console.warn("Using local journal data because the API is unavailable.", error);
  }
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

function setupExperience() {
  let index = 0;
  const image = $("#experienceImage");
  const title = $("#experienceTitle");
  const copy = $("#experienceCopy");
  const show = (nextIndex) => {
    index = (nextIndex + experiences.length) % experiences.length;
    const item = experiences[index];
    image.style.opacity = "0";
    window.setTimeout(() => {
      image.src = item.image;
      title.textContent = item.title;
      copy.textContent = item.copy;
      image.style.opacity = "1";
    }, 180);
  };
  $("[data-exp-next]").addEventListener("click", () => show(index + 1));
  $("[data-exp-prev]").addEventListener("click", () => show(index - 1));
}

function showError(id, visible, message) {
  const element = $(id);
  if (!element) return;
  if (message) element.textContent = message;
  element.classList.toggle("is-visible", visible);
}

function setBookingStatus(type, message) {
  const status = $("#bookingStatus");
  status.className = `form-status ${type ? `is-visible ${type}` : ""}`;
  status.textContent = message || "";
}

function validateBookingDates(arrival, departure) {
  const missingArrival = !arrival;
  const missingDeparture = !departure;
  showError("#arrivalDateError", missingArrival, "Choose an arrival date.");
  showError("#departureDateError", missingDeparture, "Choose a departure date.");

  if (missingArrival || missingDeparture) return false;

  const arrivalDate = new Date(`${arrival}T00:00:00`);
  const departureDate = new Date(`${departure}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (arrivalDate < today) {
    showError("#arrivalDateError", true, "Arrival date cannot be in the past.");
    return false;
  }

  if (departureDate <= arrivalDate) {
    showError("#departureDateError", true, "Departure must be after arrival.");
    return false;
  }

  return true;
}

function setupForms() {
  const roomSelect = $("#roomSelect");
  roomSelect.addEventListener("change", () => {
    selectedRoomId = Number(roomSelect.value || rooms[0]?.id || 1);
    setBookingStatus("", "");
  });

  $("#check-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const arrival = $("#arrivalDate").value;
    const departure = $("#departureDate").value;
    const adultCount = Number.parseInt($("#adult").value, 10);
    const childCount = Number.parseInt($("#children").value, 10);
    const roomId = Number.parseInt($("#roomSelect").value || selectedRoomId, 10);

    setBookingStatus("", "");
    if (!validateBookingDates(arrival, departure)) return;

    submitButton.disabled = true;
    submitButton.textContent = "Checking...";

    try {
      const response = await apiFetch("/bookings/check-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          arrivalDate: arrival,
          departureDate: departure,
          adultCount,
          childCount,
        }),
      });

      const data = await readJson(response);
      if (!response.ok) {
        setBookingStatus("error", data?.message || "Could not check availability.");
        return;
      }

      const total = data?.estimatedTotalPrice ? ` Estimated total: ${formatMoney(data.estimatedTotalPrice)}.` : "";
      setBookingStatus(data?.isAvailable ? "success" : "warning", `${data?.message || "Availability checked."}${total}`);
    } catch (error) {
      console.error("Booking API error:", error);
      setBookingStatus("error", "Cannot connect to the backend API. Start the backend and try again.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Search rooms";
    }
  });

  $("#sign-in-form").addEventListener("submit", (event) => {
    const email = $("#email").value.trim();
    const invalid = !email || !email.includes("@");
    showError("#emailError", invalid, "Enter your email.");
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
    image.src = room.image;
    image.alt = room.title;
    title.textContent = room.title;
    price.textContent = room.price;
    description.textContent = room.copy;
    stats.innerHTML = [room.size, room.view, room.guests].map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    amenitiesList.innerHTML = room.amenities.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
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
    image.src = item.image;
    image.alt = item.title;
    title.textContent = item.title;
    kicker.textContent = item.kicker;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  $$(".gallery-item").forEach((button) => {
    button.addEventListener("click", () => open(gallery[Number(button.dataset.galleryIndex)]));
  });

  $$("[data-close-gallery]").forEach((button) => button.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) close();
  });
}

function setupMagneticButtons() {
  const gsap = window.gsap;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  if (!gsap || reducedMotion || coarsePointer) return;

  const buttons = $$(
    ".primary-btn, .ghost-btn, .nav-cta, .booking-form button, .newsletter-row button, .experience-actions button, .hero-controls button"
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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!gsap || reducedMotion) return;

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

  gsap.utils.toArray(".intro-grid > *, .section-heading, .experience-content").forEach((item) => {
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

renderRooms();
renderRoomOptions();
renderAmenities();
renderReviews();
renderJournal();
renderGallery();
setupMenu();
setupHeader();
setupHeroSlider();
setupExperience();
setupForms();
setupBackToTop();
setupRoomModal();
setupGalleryLightbox();
setupAnimations();
setupMagneticButtons();
fetchRooms();
fetchArticles();
