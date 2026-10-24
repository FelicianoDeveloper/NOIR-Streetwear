document.addEventListener("DOMContentLoaded", () => {
const cartButton =
  document.getElementById("cart-button") ||
  document.getElementById("product-cart-button");  const header = document.querySelector("header");

  if (!cartButton || !header) return;

  const placeholder = document.createElement("div");
  let isFloating = false;

  function updateCartPosition() {
    if (window.scrollY > 100 && !isFloating) {
      const rect = cartButton.getBoundingClientRect();

      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      cartButton.parentElement.insertBefore(placeholder, cartButton);

      cartButton.style.position = "fixed";
      cartButton.style.top = "24px";
      cartButton.style.right = "24px";
      cartButton.style.zIndex = "50";
      cartButton.style.backgroundColor = "#0B0B0B";

      isFloating = true;
    } else if (window.scrollY <= 100 && isFloating) {
      cartButton.style.position = "";
      cartButton.style.top = "";
      cartButton.style.right = "";
      cartButton.style.zIndex = "";
      cartButton.style.backgroundColor = "";

      placeholder.remove();
      isFloating = false;
    }
  }

  window.addEventListener("scroll", updateCartPosition, { passive: true });
  updateCartPosition();
});