const markets = {
  hot: [
    ["BTC", "$64,182.90", "+2.41%", "$2.48B", "positive"],
    ["ETH", "$3,184.12", "+1.88%", "$1.06B", "positive"],
    ["SOL", "$142.64", "+4.76%", "$748M", "positive"],
    ["TON", "$5.42", "-0.62%", "$128M", "negative"],
  ],
  gainers: [
    ["DOGE", "$0.162", "+7.13%", "$642M", "positive"],
    ["WIF", "$2.86", "+6.58%", "$221M", "positive"],
    ["JUP", "$1.04", "+5.92%", "$178M", "positive"],
    ["SUI", "$1.28", "+5.41%", "$318M", "positive"],
  ],
  new: [
    ["NOVA", "$0.084", "+12.30%", "$42M", "positive"],
    ["ZKX", "$0.418", "+8.24%", "$36M", "positive"],
    ["MODE", "$0.061", "-1.04%", "$21M", "negative"],
    ["PIXEL", "$0.39", "+3.18%", "$84M", "positive"],
  ],
};

const marketButtons = document.querySelectorAll("[data-market]");
const marketTable = document.querySelector(".market-table");
const heroSection = document.querySelector(".hero-section");
const heroVideos = document.querySelectorAll(".hero-video");
const heroDots = document.querySelectorAll(".carousel-dots button");
let heroSlideIndex = 0;
let heroCarouselTimer;

function showHeroSlide(index) {
  heroSlideIndex = index % heroVideos.length;
  heroVideos.forEach((video, videoIndex) => {
    const isActive = videoIndex === heroSlideIndex;
    video.classList.toggle("is-active", isActive);

    if (isActive) {
      video.play().catch(() => {});
    }
  });

  heroDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === heroSlideIndex);
  });

  heroSection.classList.toggle("is-third-slide", heroSlideIndex === 2);
}

if (heroVideos.length > 1) {
  const startHeroCarousel = () => {
    window.clearInterval(heroCarouselTimer);
    heroCarouselTimer = window.setInterval(() => {
      showHeroSlide(heroSlideIndex + 1);
    }, 5000);
  };

  showHeroSlide(0);
  startHeroCarousel();

  heroDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showHeroSlide(index);
      startHeroCarousel();
    });
  });
}

function renderMarketRows(type) {
  const rows = markets[type]
    .map(
      ([pair, price, change, volume, status]) => `
        <div class="market-row">
          <span><b>${pair}</b>/USDT</span>
          <span>${price}</span>
          <span class="${status}">${change}</span>
          <span>${volume}</span>
          <button>Trade</button>
        </div>
      `,
    )
    .join("");

  marketTable.innerHTML = `
    <div class="table-head">
      <span>Pair</span>
      <span>Last Price</span>
      <span>24h Change</span>
      <span>Volume</span>
      <span></span>
    </div>
    ${rows}
  `;
}

marketButtons.forEach((button) => {
  button.addEventListener("click", () => {
    marketButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderMarketRows(button.dataset.market);
  });
});

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("click", () => {
    item.classList.toggle("is-open");
  });
});

document.querySelector(".signup-card").addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  button.textContent = "Invite sent";
  setTimeout(() => {
    button.textContent = "Sign Up Now";
  }, 1600);
});
