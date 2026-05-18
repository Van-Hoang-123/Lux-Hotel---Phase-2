// menu
document.querySelector(".menu-bar").addEventListener("click", function () {
    let activeMenu = document.querySelector(".primary-menu");
    if (activeMenu.style.display === "block")
        activeMenu.style.display = "none";
    else
        activeMenu.style.display = "block";
});
function dropdown(dropEl) {
    document.querySelector(".sub-menu").style.display = "block";
    document.querySelector(".up").style.display = "block";
    dropEl.style.display = "none";
}
function up(upEl) {
    document.querySelector(".sub-menu").style.display = "none";
    document.querySelector(".drop-down").style.display = "block";
    upEl.style.display = "none";
}
// slider
let sliderEl = document.querySelector('#slider');
let titleSliderEl = document.querySelector('#titleSlider')
let i = 0;
let sliderArr = ['./Images/Slider 1.jpg', './Images/Slider 2.jpg'];
let titleArr = ['Luxury Times.', 'Comfort & More.'];
// setInterval(function () {
//     if (i < 1) {
//         i++;
//     }
//     else {
//         i = 0;
//     }
//     sliderEl.src = sliderArr[i];
//     titleSliderEl.innerHTML = titleArr[i];
// }, 3000);
function next() {
    i = (i + 1) % 2;
    sliderEl.src = sliderArr[i];
    titleSliderEl.innerHTML = titleArr[i];
}
function prev() {
    i = (i - 1) % 2;
    if (i < 0)
        i = 1;
    sliderEl.src = sliderArr[i];
    titleSliderEl.innerHTML = titleArr[i];
}

//accommodation
let accommodationEl = document.querySelector('#accommodationFirst');
let lodgingArr = [
    {
        title: "Standard Room",
        imgUrl: "./Images/Room - Standard.jpg",
        content: "Starting from $60.0/night"
    },
    {
        title: "Beach Villa",
        imgUrl: "./Images/Room - Beach Villa.jpg",
        content: "Starting from $90.0/night"
    },
    {
        title: "Exclusive Suite",
        imgUrl: "./Images/Room - Exclusive Suite.jpg",
        content: "Starting from $120.0/night"
    },
    {
        title: "Luxury Suite",
        imgUrl: "./Images/Room - Luxury Suite.jpg",
        content: "Starting from $160.0/night"
    }
]


let currentIndex = 0;
let currentIndexMobile = 0;
function showLodgin() {
    accommodationEl.innerHTML = '';
    for (let i = currentIndex; i < currentIndex + 3; i++) {
        let item = lodgingArr[i];
        accommodationEl.innerHTML += `
        <div class="col-md-4">
            <article class="accommodation-item">
                <a href=""><img src="${item.imgUrl}" alt=""></a>
                <div class="content">
                    <a href=""><h3>${item.title}</h3></a>
                    <p>${item.content}</p>
                </div>
            </article>
        </div>
        `;
    }
}
showLodgin();
//  button
function getPrevious() {
    //desktop
    currentIndex = (currentIndex - 1) % 2;
    if (currentIndex < 0)
        currentIndex = 1;
    showLodgin();
    // mobile
    currentIndexMobile = (currentIndexMobile - 1) % 4;
    let mobileEl = document.querySelector(".mobile");
    if (currentIndexMobile < 0)
        currentIndexMobile = 3;
    let item = lodgingArr[currentIndexMobile];
    mobileEl.innerHTML = `
        <article class="accommodation-item">
            <a href=""><img src="${item.imgUrl}" alt=""></a>
            <div class="content">
                <a href="">
                    <h3>${item.title}</h3>
                </a>
                <p>${item.content}</p>
            </div>
        </article>
    `;
}
function getNext() {
    // desktop
    currentIndex = (currentIndex + 1) % 2;
    showLodgin();
    // mobile
    currentIndexMobile = (currentIndexMobile + 1) % 4;
    let mobileEl = document.querySelector(".mobile");
    let item = lodgingArr[currentIndexMobile];
    mobileEl.innerHTML = `
            <article class="accommodation-item">
                <a href=""><img src="${item.imgUrl}" alt=""></a>
                <div class="content">
                    <a href="">
                        <h3>${item.title}</h3>
                    </a>
                    <p>${item.content}</p>
                </div>
            </article>
        `;
}

// slider-2 Culinary
let sliderCulinaryEl = document.querySelector('#slider-2');
let culinarySpaEl = document.querySelector('#culinary-spa')
let index = 0;
let culSpaArr = [
    {
        thumbnailUrl: "./Images/Culinary Experience.jpg",
        title: "Culinary Experience",
        content: "Whether you choose an intimate, inspired dinner at Junction or traditional pub fare at The Tavern, your taste buds will rejoice at how inventive and fresh our food is—many of our ingredients are grown on-site in our organic garden."
    },
    {
        thumbnailUrl: "./Images/Spa like no other.jpg",
        title: "Spa Like No Other",
        content: "Seven pillars of well-being and indigenous ingredients are the foundation of the spa experience at this resort. Tropical papaya, aloe vera, volcanic stones and other locally developed ingredients are combined."
    }
];

function getPreviousSlider() {
    index = (index - 1) % 2;
    if (index < 0)
        index = 1;
    showSlider();
}
function getNextSLider() {
    index = (index + 1) % 2;
    showSlider();
}
function showSlider() {
    sliderCulinaryEl.src = culSpaArr[index].thumbnailUrl;
    culinarySpaEl.innerHTML = `
        <h1>${culSpaArr[index].title}</h1>
		<p>${culSpaArr[index].content}</p>
    `;
}

//incentives
let incentivesEl = document.querySelector('#incentives');
let inc = '';
let incentivesArr = [
    {
        title: "Airport Pickup",
        imgUrl: "./Images/plane.png",
        bgUrl: "./Images/plane\ 2.jpg",
        content: "We’ll pick up from airport while you comfy on your ride."
    },
    {
        title: "Complementary Breakfast",
        imgUrl: "./Images/breakfast.png",
        bgUrl: "./Images/breakfast\ 2.jpg",
        content: "Don’t spend a dime on breakfast. It’s on us, totally."
    },
    {
        title: "City Tour Guide",
        imgUrl: "./Images/tour-guide.png",
        bgUrl: "./Images/tour-guide\ 2.jpg",
        content: "Explore city with our in-house tour guide. We got your back."
    },
    {
        title: "Beach BBQ Party",
        imgUrl: "./Images/bbq.png",
        bgUrl: "./Images/bbq\ 2.jpg",
        content: "Kick back on the beach & cook up recipes from our master-chef."
    }
]
let order = 0;
for (let item of incentivesArr) {
    inc += `
    <div class="col-md-3">
        <div class="overlay" data-order="${order}" onmouseover="backHover(this)" onmouseout="backUnhover(this)">
			<div class="item">
                <img src="${item.imgUrl}" alt="">
                <h5>${item.title}</h5>
                <p>${item.content}</p>
            </div>
		</div>
    </div>`;
    order++;
}
incentivesEl.innerHTML = inc;
function backHover(overlayEl) {
    overlayEl.classList.add('active');
    let bgUrl = incentivesArr[overlayEl.dataset.order].bgUrl;
    console.log(`${bgUrl}`);
    overlayEl.style.backgroundImage = `url('${bgUrl}')`;
}

function backUnhover(overlayEl) {
    overlayEl.classList.remove('active');
    overlayEl.style.backgroundImage = '';
    overlayEl.style.backgroundSize = '';
    overlayEl.style.backgroundPosition = '';
}
// people
let peopleEl = document.querySelector('#people');
let ppl = '';
let peopleArr = [
    {
        title: "Mike Fleetwood",
        imgUrl: "./Images/mike-fleetwood.jpg",
        tag: "./Images/tripadvisor.png",
        content: "“TThis was the perfect hotel with the perfect location, perfect room; I couldn’t think of a more perfect trip!This was a great location as I was going to a conference at the Javitz center and it’s nearly a couple blocks walk.”"
    },
    {
        title: "Joanna Roberts",
        imgUrl: "./Images/joanna-roberts.jpg",
        tag: "./Images/booking.png",
        content: "“We had an AMAZING experience at this hotel! Upon arrival, we each received a complimentary flute of champagne. Each member of the staff was incredibly friendly, welcoming, and acted as if we were the only guests at the hotel.”"
    },
    {
        title: "Alex Johnson",
        imgUrl: "./Images/alex-johnson.jpg",
        tag: "./Images/tripadvisor.png",
        content: "“This is truly a great hotel. The staff is very friendly, helpful and experienced. I had a beautiful room with ‘city view’. That meant that I could view the Empire State Building and One World Trade Center at the same time.”"
    }
];
for (let item of peopleArr) {
    ppl += `
    <div class="col-md-4 ">
        <div class="item">
            <img src=${item.imgUrl} alt="" class="avt">
            <h3>${item.title}</h3>
            <p>${item.content}</p>
            <img src=${item.tag} alt="">
        </div>
    </div>`;
}
peopleEl.innerHTML = ppl;
// news
let newsEl = document.querySelector('#news');
let n = '';
let newsArr = [
    {
        title: "Staying in Style Forever",
        imgUrl: "./Images/va0ymkiftpa-368x268.jpg",
        content: "While there’s nothing better than relaxing in a lounge chair on the beach, some days …"
    },
    {
        title: "Electric Feel And Of Other Things",
        imgUrl: "./Images/iStock_000002993908_Medium-1-1-368x268.jpg",
        content: "While there’s nothing better than relaxing in a lounge chair on the beach, some days …"
    },
    {
        title: "Why Hotel Comfort is Important",
        imgUrl: "./Images/ihwo0unctps-368x268.jpg",
        content: "While there’s nothing better than relaxing in a lounge chair on the beach, some days …"
    }
];
for (let item of newsArr) {
    n += `
    <div class="col-md-4">
        <article>
            <a href=""> <img src="${item.imgUrl}" alt=""></a>
            <div class="content">
                <a href=""><h4>${item.title}</h4></a>
                <a href=""><p class="tag">Bob Willams on <b>Lifestyle</b></p></a>
                <a href=""><p>${item.content}</p></a>
                <a href=""><p class="read-more">READ MORE</p></a>
            </div>
        </article>
    </div>`;
}
newsEl.innerHTML = n;

// go-to-top
document.querySelector("#go-to-top").addEventListener("click", function () {
    document.querySelector("body").scrollTop = 0;
    document.querySelector("html").scrollTop = 0;
})

// validate form
let formEl = document.querySelector('#check-form');
formEl.addEventListener("submit", function (event) {
    
    let arrivalDateEl = document.querySelector('#arrivalDate').value;
    let departureDateEl = document.querySelector('#departureDate').value;
    let arrivalDateErrorEl = document.querySelector('#arrivalDateError');
    // arrivalDateErrorEl.classList.add("hidden-message");
    let departureDateErrorEl = document.querySelector('#departureDateError');
    //departureDateErrorEl.classList.add("hidden-message");

    if (arrivalDateEl === '') {
        arrivalDateErrorEl.classList.remove("hidden-message");
        event.preventDefault();
    }
    if (departureDateEl === '') {
        departureDateErrorEl.classList.remove("hidden-message");
        event.preventDefault();
    }
});
let signInEl = document.querySelector("#sign-in-form");
signInEl.addEventListener("submit", function (event) {
    let emailEl = document.querySelector('#email').value;
    if (emailEl == '') {
        document.querySelector("#emailError").classList.remove("hidden-message");
        event.preventDefault();
    }
})