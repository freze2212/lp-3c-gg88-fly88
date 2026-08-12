/**
 * portal-country-selector-redirect.js
 *
 * Chỉ chuyển trang khi người dùng click quả cầu quốc gia hoặc banner.
 * Không auto-redirect.
 */

function redirectToSite() {
  window.location.href = window.REDIRECT_URL || "#";
}

// ============================================================
// SLIDESHOW BACKGROUND (dự phòng khi dùng ảnh thay video)
// Chỉ chạy nếu có phần tử .background-image trên trang
// ============================================================
(function initBackgroundSlideshow() {
  function startSlideshow(selector) {
    const images = document.querySelectorAll(selector);
    if (images.length === 0) return;

    let currentIndex = 0;
    images[currentIndex].classList.add("active");

    setInterval(function () {
      images[currentIndex].classList.remove("active");
      currentIndex = (currentIndex + 1) % images.length;
      images[currentIndex].classList.add("active");
    }, 3000);
  }

  startSlideshow(".bg-desktop .background-image");
  startSlideshow(".bg-mobile .background-image");
})();

// ============================================================
// RESPONSIVE BANNER IMAGE (nếu muốn đổi ảnh theo màn hình)
// ============================================================
function updateBannerForScreenSize() {
  const bannerImg = document.querySelector(".banner-img");
  if (!bannerImg) return;

  if (window.innerWidth <= 768) {
    bannerImg.src = "assets/img/banner-mobile.gif";
  } else {
    bannerImg.src = "assets/img/banner.gif";
  }
}

window.addEventListener("load", updateBannerForScreenSize);
window.addEventListener("resize", updateBannerForScreenSize);
