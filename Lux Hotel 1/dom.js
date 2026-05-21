const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const rooms = [
  {
    title: "Standard Room",
    image: "./Images/Room - Standard.jpg",
    price: "From $60 / night",
    copy: "Warm textures, soft linens, and a private corner for slower mornings.",
  },
  {
    title: "Beach Villa",
    image: "./Images/Room - Beach Villa.jpg",
    price: "From $90 / night",
    copy: "Steps from the shore with open-air lounging and quiet ocean light.",
  },
  {
    title: "Exclusive Suite",
    image: "./Images/Room - Exclusive Suite.jpg",
    price: "From $120 / night",
    copy: "A refined suite for longer stays, private dining, and terrace evenings.",
  },
  {
    title: "Luxury Suite",
    image: "./Images/Room - Luxury Suite.jpg",
    price: "From $160 / night",
    copy: "The signature stay: generous space, bay views, and personal service.",
  },
];

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

const journal = [
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

function renderRooms() {
  $("#roomsGrid").innerHTML = rooms
    .map(
      (room) => `
        <article class="room-card">
          <img src="${room.image}" alt="${room.title}" loading="lazy" />
          <div class="content">
            <p class="price">${room.price}</p>
            <h3>${room.title}</h3>
            <p>${room.copy}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAmenities() {
  $("#amenitiesGrid").innerHTML = amenities
    .map(
      (item) => `
        <article class="amenity-card" style="background-image: url('${item.image}')">
          <h3>${item.title}</h3>
          <p>${item.copy}</p>
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
            <img src="${review.image}" alt="${review.name}" loading="lazy" />
            <div>
              <h3>${review.name}</h3>
              <p>Verified guest</p>
            </div>
          </header>
          <p>“${review.copy}”</p>
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
          <img src="${post.image}" alt="${post.title}" loading="lazy" />
          <div class="content">
            <p class="tag">${post.tag}</p>
            <h3>${post.title}</h3>
            <p>${post.copy}</p>
          </div>
        </article>
      `
    )
    .join("");
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

function showError(id, visible) {
  const element = $(id);
  if (element) element.classList.toggle("is-visible", visible);
}

function setupForms() {
  $("#check-form").addEventListener("submit", (event) => {
    const arrival = $("#arrivalDate").value;
    const departure = $("#departureDate").value;
    const missingArrival = !arrival;
    const missingDeparture = !departure;
    showError("#arrivalDateError", missingArrival);
    showError("#departureDateError", missingDeparture);
    if (missingArrival || missingDeparture) event.preventDefault();
  });

  $("#sign-in-form").addEventListener("submit", (event) => {
    const email = $("#email").value.trim();
    const invalid = !email || !email.includes("@");
    showError("#emailError", invalid);
    if (invalid) event.preventDefault();
  });
}

function setupBackToTop() {
  $("#go-to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

renderRooms();
renderAmenities();
renderReviews();
renderJournal();
setupMenu();
setupHeader();
setupHeroSlider();
setupExperience();
setupForms();
setupBackToTop();
