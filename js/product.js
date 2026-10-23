
const products = [
  {
    id: 1,
    name: "VOID OVERSIZED TEE",
    category: "T-shirts",
    price: 149.90,
    image: "./assets/images/void-tee.jpg",
    label: "BEST SELLER",
    description: "A statement in silence. The VOID Oversized Tee combines a relaxed silhouette with a raw, minimal aesthetic. Designed to stand apart without saying a word.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 2,
    name: "AFTER DARK HOODIE",
    category: "Hoodies",
    price: 289.90,
    image: "./assets/images/after-dark-hoodie.jpg",
    label: "NEW DROP",
    description: "Built for the hours that define you. The AFTER DARK Hoodie delivers a bold oversized fit and understated attitude, bringing underground energy to everyday wear.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 3,
    name: "DISTRICT CARGO",
    category: "Pants",
    price: 259.90,
    image: "./assets/images/district-cargo.jpg",
    label: "LIMITED",
    description: "Function meets rebellion. The DISTRICT Cargo brings a utilitarian silhouette and urban character to a versatile everyday piece. No excess. No compromise.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 4,
    name: "NO SIGNAL TEE",
    category: "T-shirts",
    price: 129.90,
    image: "./assets/images/no-signal-tee.jpg",
    label: "ESSENTIAL",
    description: "Disconnect from the noise. The NO SIGNAL Tee keeps things clean with a minimalist design and an effortless oversized fit. Less distraction. More identity.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
];

const money = (value) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));
const product = products.find((item) => item.id === productId);
const detail = document.querySelector("#product-detail");
const cartCount = document.querySelector("#product-cart-count");
const cartButton = document.querySelector("#product-cart-button");

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("noir-cart") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function updateCartCount() {
  cartCount.textContent = readCart().reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );
}


const cartDrawer = document.querySelector("#cart-drawer");
const cartOverlay = document.querySelector("#cart-overlay");
const closeCartButton = document.querySelector("#close-cart");
const continueShoppingButton = document.querySelector("#continue-shopping");
const cartItems = document.querySelector("#cart-items");
const cartSubtotal = document.querySelector("#cart-subtotal");
const drawerCartCount = document.querySelector("#drawer-cart-count");
const checkoutButton = document.querySelector("#checkout-button");

function openProductCart() {
  renderProductCart();

  cartDrawer.classList.remove("translate-x-full");
  cartOverlay.classList.remove("hidden");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartDrawer.removeAttribute("inert");
  document.body.classList.add("overflow-hidden");

  closeCartButton.focus();
}

function closeProductCart() {
  cartDrawer.classList.add("translate-x-full");
  cartOverlay.classList.add("hidden");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.setAttribute("inert", "");
  document.body.classList.remove("overflow-hidden");

  cartButton.focus();
}

function renderProductCart() {
  const cart = readCart();

  const quantity = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce((total, item) => {
    const product = products.find((p) => p.id === item.id);

    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  drawerCartCount.textContent = `(${quantity})`;
  cartSubtotal.textContent = money(subtotal);
  checkoutButton.disabled = cart.length === 0;
  
checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) return;

  window.location.href = "./checkout.html";
});


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
    updateCartCount();
    return;
  }

  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((p) => p.id === item.id);

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

          <h3 class="mt-1 text-sm font-bold">${product.name}</h3>

          <p class="mt-2 text-xs uppercase tracking-widest text-white/50">
            Size: ${item.size || "M"}
          </p>

          <p class="mt-2 text-sm">${money(product.price)}</p>

          <div class="mt-auto flex items-center justify-between gap-3 pt-4">
            <div class="flex items-center border border-white/20">
              <button
                type="button"
                data-cart-action="decrease"
                data-id="${product.id}"
                data-size="${item.size || "M"}"
                class="px-3 py-2 hover:text-[#D92828]"
                aria-label="Decrease quantity"
              >−</button>

              <span class="min-w-8 text-center text-xs">
                ${item.quantity}
              </span>

              <button
                type="button"
                data-cart-action="increase"
                data-id="${product.id}"
                data-size="${item.size || "M"}"
                class="px-3 py-2 hover:text-[#D92828]"
                aria-label="Increase quantity"
              >+</button>
            </div>

            <button
              type="button"
              data-cart-action="remove"
              data-id="${product.id}"
              data-size="${item.size || "M"}"
              class="text-[10px] uppercase tracking-widest text-white/40 underline hover:text-[#D92828]"
            >Remove</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  updateCartCount();
}

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const size = button.dataset.size;
  const action = button.dataset.cartAction;
  const cart = readCart();

  const item = cart.find(
    (entry) => entry.id === id && (entry.size || "M") === size
  );

  if (!item) return;

  if (action === "increase") {
    item.quantity += 1;
  } else if (action === "decrease") {
    item.quantity -= 1;
  } else if (action === "remove") {
    item.quantity = 0;
  }

  const updatedCart = cart.filter((entry) => entry.quantity > 0);

  localStorage.setItem("noir-cart", JSON.stringify(updatedCart));

  renderProductCart();
});

cartButton.addEventListener("click", openProductCart);
closeCartButton.addEventListener("click", closeProductCart);
continueShoppingButton.addEventListener("click", closeProductCart);
cartOverlay.addEventListener("click", closeProductCart);

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    cartDrawer.getAttribute("aria-hidden") === "false"
  ) {
    closeProductCart();
  }
});


if (!product) {
  document.title = "Product not found — NOIR®";

  detail.innerHTML = `
    <div class="py-16">
      <h1 class="font-[Barlow_Condensed] text-5xl font-black uppercase">
        Product not found.
      </h1>
      <a href="./index.html#collection"
         class="mt-6 inline-block text-sm underline underline-offset-4">
        Return to collection
      </a>
    </div>
  `;
} else {
  document.title = `${product.name} — NOIR®`;
  document.querySelector("#breadcrumb-name").textContent = product.name;

  detail.innerHTML = `
    <div>
      <div class="relative overflow-hidden bg-[#171717]">
        <img
          src="${product.image}"
          alt="${product.name}"
          class="aspect-[4/5] w-full object-cover"
        />
        <span class="absolute left-4 top-4 bg-[#D92828] px-3 py-2 text-[10px] font-bold uppercase tracking-widest">
          ${product.label}
        </span>
      </div>
      <p class="mt-3 text-[10px] uppercase tracking-[0.25em] text-white/40">
        NOIR® CAMPAIGN / 001
      </p>
    </div>

    <div class="flex flex-col justify-center py-4 lg:py-10">
      <p class="text-xs uppercase tracking-[0.3em] text-[#D92828]">
        ${product.category} / DROP 001
      </p>

      <h1 class="mt-4 font-[Barlow_Condensed] text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-8xl">
        ${product.name}<span class="text-[#D92828]">.</span>
      </h1>

      <p class="mt-6 text-xl font-medium">${money(product.price)}</p>

      <p class="mt-6 max-w-lg text-sm leading-7 text-white/60">
        ${product.description}
      </p>

      <div class="mt-10">
        <p class="mb-4 text-xs font-bold uppercase tracking-widest">
          Select size <span class="text-[#D92828]">*</span>
        </p>

        <div id="size-options" class="flex flex-wrap gap-2">
          ${product.sizes.map((size) => `
            <button
              type="button"
              data-size="${size}"
              aria-pressed="false"
              class="size-button min-w-12 border border-white/20 px-4 py-3 text-xs font-bold transition hover:border-[#D92828]"
            >${size}</button>
          `).join("")}
        </div>

        <p id="size-error" class="mt-3 hidden text-xs text-[#D92828]" role="alert">
          Please select a size before adding to bag.
        </p>
      </div>

      <div class="mt-8">
        <label for="product-quantity" class="mb-3 block text-xs font-bold uppercase tracking-widest">
          Quantity
        </label>
        <input
          id="product-quantity"
          type="number"
          min="1"
          max="10"
          value="1"
          class="w-24 border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#D92828]"
        />
      </div>

      <button
        id="detail-add-to-cart"
        type="button"
        class="mt-6 w-full bg-[#D92828] px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] transition hover:bg-[#F2F0EB] hover:text-[#0B0B0B] sm:max-w-md"
      >
        Add to bag +
      </button>

      <p class="mt-5 text-[10px] uppercase tracking-widest text-white/40">
        Independent by nature. Different by design.
      </p>
    </div>
  `;

  let selectedSize = "";

  const sizeOptions = document.querySelector("#size-options");
  const sizeError = document.querySelector("#size-error");
  const quantityInput = document.querySelector("#product-quantity");
  const addButton = document.querySelector("#detail-add-to-cart");

  sizeOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-size]");
    if (!button) return;

    selectedSize = button.dataset.size;
    sizeError.classList.add("hidden");

    sizeOptions.querySelectorAll("[data-size]").forEach((option) => {
      const active = option === button;

      option.setAttribute("aria-pressed", String(active));
      option.classList.toggle("border-[#D92828]", active);
      option.classList.toggle("bg-[#D92828]", active);
      option.classList.toggle("text-white", active);
      option.classList.toggle("border-white/20", !active);
    });
  });

  addButton.addEventListener("click", () => {
    if (!selectedSize) {
      sizeError.classList.remove("hidden");
      return;
    }

    const quantity = Number(quantityInput.value);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      quantityInput.focus();
      quantityInput.reportValidity();
      return;
    }

    const cart = readCart();

    const existing = cart.find(
      (item) => item.id === product.id && item.size === selectedSize
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        quantity,
        size: selectedSize,
      });
    }

    localStorage.setItem("noir-cart", JSON.stringify(cart));
    updateCartCount();

    addButton.textContent = "Added to bag ✓";

    setTimeout(() => {
      addButton.textContent = "Add to bag +";
    }, 1500);
  });
}


updateCartCount();
