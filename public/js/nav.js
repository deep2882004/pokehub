console.log("js is working");

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const ximage = document.querySelector(".ximage");

menuBtn.addEventListener("click", () => {
  navLinks.classList.add("show");
});
ximage.addEventListener("click", () => {
  navLinks.classList.remove("show");
});


