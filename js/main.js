

const products = [
  {
  id: 1,
  name: "VOID OVERSIZED TEE",
  category: "T-shirts",
  price: 149.90,
  image: "./assets/images/void-tee.jpg",
  label: "BEST SELLER",
  description:
    "A statement in silence. The VOID Oversized Tee combines a relaxed silhouette with a raw, minimal aesthetic. Designed to stand apart without saying a word.",
  sizes: ["XS", "S", "M", "L", "XL"],
},
  {
    id: 2,
    name: "AFTER DARK HOODIE",
    category: "Hoodies",
    price: 289.90,
    image: "./assets/images/after-dark-hoodie.jpg",
    label: "NEW DROP",
    description:
      "Built for the hours that define you. The AFTER DARK Hoodie delivers a bold oversized fit and understated attitude, bringing underground energy to everyday wear.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 3,
    name: "DISTRICT CARGO",
    category: "Pants",
    price: 259.90,
    image: "./assets/images/district-cargo.jpg",
    label: "LIMITED",
    description:
      "Function meets rebellion. The DISTRICT Cargo brings a utilitarian silhouette and urban character to a versatile everyday piece. No excess. No compromise.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 4,
    name: "NO SIGNAL TEE",
    category: "T-shirts",
    price: 129.90,
    image: "./assets/images/no-signal-tee.jpg",
    label: "ESSENTIAL",
    description:
      "Disconnect from the noise. The NO SIGNAL Tee keeps things clean with a minimalist design and an effortless oversized fit. Less distraction. More identity.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
];

const productGrid = document.querySelector("#product-grid");
const productCount = document.querySelector("#product-count");
const categoryFilters = document.querySelector("#category-filters");
const sortProducts = document.querySelector("#sort-products");

if (!productGrid || !productCount || !categoryFilters || !sortProducts) {
  console.error(
    "NOIR: elementos do catálogo não encontrados. Confira os IDs no index.html."
  );
} else {
  let activeCategory = "all";

  const money = (value) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  function renderProducts() {
    let visibleProducts = [...products];

    if (activeCategory !== "all") {
      visibleProducts = visibleProducts.filter(
        (product) => product.category === activeCategory
      );
    }

    if (sortProducts.value === "price-asc") {
      visibleProducts.sort((a, b) => a.price - b.price);
    } else if (sortProducts.value === "price-desc") {
      visibleProducts.sort((a, b) => b.price - a.price);
    }

    productGrid.innerHTML = visibleProducts
      .map(
        (product) => `
          <article
  class="product-card group cursor-pointer"
  data-open-product="${product.id}"
  tabindex="0"
  role="link"
  aria-label="View ${product.name}"
>
            <div class="relative overflow-hidden bg-[#171717]">
              <img
                src="${product.image}"
                alt="${product.name}"
                loading="lazy"
                class="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <span class="absolute left-3 top-3 bg-[#D92828] px-3 py-2 text-[9px] font-bold uppercase tracking-widest">
                ${product.label}
              </span>

              <button
                type="button"
                data-add-to-cart="${product.id}"
                class="absolute bottom-3 left-3 right-3 bg-[#F2F0EB] px-4 py-4 text-xs font-bold uppercase tracking-widest text-[#0B0B0B] transition hover:bg-[#D92828] hover:text-white"
              >
                Add to bag +
              </button>
            </div>

            <div class="flex items-start justify-between gap-3 pt-4">
              <div>
                <p class="text-[10px] uppercase tracking-widest text-white/40">
                  ${product.category}
                </p>
                <h3 class="mt-2 text-sm font-bold tracking-wide">
                  ${product.name}
                </h3>
              </div>
              <p class="whitespace-nowrap text-sm">${money(product.price)}</p>
            </div>
          </article>
        `
      )
      .join("");

    productCount.textContent =
      `${visibleProducts.length} products / Drop 001`;
  }

  categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    activeCategory = button.dataset.category;

    categoryFilters.querySelectorAll("[data-category]").forEach((item) => {
      const active = item === button;

      item.classList.toggle("bg-[#D92828]", active);
      item.classList.toggle("border-[#D92828]", active);
      item.classList.toggle("text-white", active);
      item.classList.toggle("border-white/20", !active);
    });

    renderProducts();
  });

  
productGrid.addEventListener("click", (event) => {
  if (event.target.closest("[data-add-to-cart]")) return;

  const card = event.target.closest("[data-open-product]");

  if (!card) return;

  window.location.href =
    `./product.html?id=${card.dataset.openProduct}`;
});

productGrid.addEventListener("keydown", (event) => {
  const card = event.target.closest("[data-open-product]");

  if (!card || (event.key !== "Enter" && event.key !== " ")) return;
  if (event.target.closest("button")) return;

  event.preventDefault();

  window.location.href =
    `./product.html?id=${card.dataset.openProduct}`;
});


 
sortProducts.addEventListener("change", renderProducts);

// ========================================
// NOIR® — SHOPPING BAG
// ========================================

const cartButton = document.querySelector("#cart-button");
const cartCount = document.querySelector("#cart-count");
const drawerCartCount = document.querySelector("#drawer-cart-count");
const cartDrawer = document.querySelector("#cart-drawer");
const cartOverlay = document.querySelector("#cart-overlay");
const closeCartButton = document.querySelector("#close-cart");
const continueShoppingButton = document.querySelector("#continue-shopping");
const cartItems = document.querySelector("#cart-items");
const cartSubtotal = document.querySelector("#cart-subtotal");
const checkoutButton = document.querySelector("#checkout-button");

let cart = [];

try {
  const savedCart = JSON.parse(localStorage.getItem("noir-cart") || "[]");

  if (Array.isArray(savedCart)) {
    cart = savedCart.filter(
      (item) =>
        products.some((product) => product.id === item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    )
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      return {
        ...item,
        size: product.sizes.includes(item.size) ? item.size : "M"
      };
    });
  }
} catch {
  cart = [];
}

function saveCart() {
  localStorage.setItem("noir-cart", JSON.stringify(cart));
}

function getCartQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartSubtotal() {
  return cart.reduce((total, item) => {
    const product = products.find((product) => product.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function renderCart() {
  const quantity = getCartQuantity();

  cartCount.textContent = quantity;
  drawerCartCount.textContent = `(${quantity})`;
  cartSubtotal.textContent = money(getCartSubtotal());
  checkoutButton.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="flex h-full min-h-48 flex-col items-center justify-center text-center">
        <p class="font-[Barlow_Condensed] text-4xl font-black uppercase">
          Nothing here<span class="text-[#D92828]">.</span>
        </p>
        <p class="mt-3 text-sm text-white/45">
          Your next favorite piece is waiting.
        </p>
      </div>
    `;

    saveCart();
    return;
  }

  cartItems.innerHTML = cart
    .map((item) => {
      const product = products.find((product) => product.id === item.id);

      if (!product) return "";

      return `
        <article class="flex gap-4 border-b border-white/10 pb-5">
          <img
            src="${product.image}"
            alt="${product.name}"
            class="h-32 w-24 bg-[#171717] object-cover"
          />

          <div class="flex min-w-0 flex-1 flex-col">
            <p class="text-[10px] uppercase tracking-widest text-white/40">
              ${product.category}
            </p>

            <h3 class="mt-1 text-sm font-bold">
              ${product.name}
            </h3>

            <p class="mt-2 text-sm">${money(product.price)}</p>
            <p class="mt-1 text-xs uppercase tracking-widest text-white/50">
              Size: ${item.size}
            </p>

            <div class="mt-auto flex items-center justify-between gap-3 pt-4">
              <div class="flex items-center border border-white/20">
                <button
                  type="button"
                  data-cart-action="decrease"
                  data-id="${product.id}"
                  data-size="${item.size}"
                  class="px-3 py-2 hover:text-[#D92828]"
                  aria-label="Diminuir quantidade de ${product.name}"
                >−</button>

                <span class="min-w-8 text-center text-xs">
                  ${item.quantity}
                </span>

                <button
                  type="button"
                  data-cart-action="increase"
                  data-id="${product.id}"
                  data-size="${item.size}"
                  class="px-3 py-2 hover:text-[#D92828]"
                  aria-label="Aumentar quantidade de ${product.name}"
                >+</button>
              </div>

              <button
                type="button"
                data-cart-action="remove"
                data-id="${product.id}"
                data-size="${item.size}"
                class="text-[10px] uppercase tracking-widest text-white/40 underline hover:text-[#D92828]"
              >
                Remove
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  saveCart();
}

function openCart() {
  cartDrawer.classList.remove("translate-x-full");
  cartOverlay.classList.remove("hidden");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartDrawer.removeAttribute("inert");
  document.body.classList.add("overflow-hidden");
  closeCartButton.focus();
}

function closeCart() {
  cartDrawer.classList.add("translate-x-full");
  cartOverlay.classList.add("hidden");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.setAttribute("inert", "");
  document.body.classList.remove("overflow-hidden");
  cartButton.focus();
}

function addToCart(id, size = "M") {
  const product = products.find((product) => product.id === id);

   if (!product || !product.sizes.includes(size)) return;

  const existingItem = cart.find(
    (item) => item.id === id && item.size === size
  );
   if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, quantity: 1, size });
  }

  renderCart();
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-to-cart]");

  if (!button) return;

  const id = Number(button.dataset.addToCart);

  addToCart(id);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const size = button.dataset.size;
  const action = button.dataset.cartAction;
  
  const item = cart.find(
  (item) => item.id === id && item.size === size
);

  if (!item) return;

  if (action === "increase") {
    item.quantity += 1;
  }

  if (action === "decrease") {
    item.quantity -= 1;

    if (item.quantity <= 0) {
      cart = cart.filter(
  (item) => !(item.id === id && item.size === size)
);
    }
  }

  if (action === "remove") {
    cart = cart.filter(
  (item) => !(item.id === id && item.size === size)
);
  }

  renderCart();
});

cartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
continueShoppingButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    cartDrawer.getAttribute("aria-hidden") === "false"
  ) {
    closeCart();
  }
});

// Renderiza catálogo e sacola ao carregar.
renderProducts();
renderCart();
checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) return;

  window.location.href = "./checkout.html";
});


const header = document.querySelector("header");

if (cartButton && header) {
  const placeholder = document.createElement("div");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      const rect = cartButton.getBoundingClientRect();

      if (!cartButton.classList.contains("cart-floating")) {
        placeholder.style.width = `${rect.width}px`;
        placeholder.style.height = `${rect.height}px`;
        cartButton.parentElement.insertBefore(placeholder, cartButton);
        cartButton.classList.add("cart-floating");
      }

      cartButton.style.position = "fixed";
      cartButton.style.top = "24px";
      cartButton.style.right = "24px";
      cartButton.style.zIndex = "50";
      cartButton.style.backgroundColor = "#0B0B0B";
    } else {
      cartButton.classList.remove("cart-floating");
      cartButton.style.position = "";
      cartButton.style.top = "";
      cartButton.style.right = "";
      cartButton.style.zIndex = "";
      cartButton.style.backgroundColor = "";

      if (placeholder.parentElement) {
        placeholder.remove();
      }
    }
  });
}
  
}
