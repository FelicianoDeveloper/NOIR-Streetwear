
const products = [
  {
    id: 1,
    name: "VOID OVERSIZED TEE",
    price: 149.90,
    image: "./assets/images/void-tee.jpg"
  },
  {
    id: 2,
    name: "AFTER DARK HOODIE",
    price: 289.90,
    image: "./assets/images/after-dark-hoodie.jpg"
  },
  {
    id: 3,
    name: "DISTRICT CARGO",
    price: 259.90,
    image: "./assets/images/district-cargo.jpg"
  },
  {
    id: 4,
    name: "NO SIGNAL TEE",
    price: 129.90,
    image: "./assets/images/no-signal-tee.jpg"
  }
];

const cartContainer = document.querySelector("#checkout-items");
const subtotalElement = document.querySelector("#checkout-subtotal");
const totalElement = document.querySelector("#checkout-total");
const checkoutForm = document.querySelector("#checkout-form");
const errorElement = document.querySelector("#checkout-error");

const formatPrice = (price) =>
  price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("noir-cart")) || [];
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function getValidItems() {
  return getCart()
    .map((item) => {
      const product = products.find(
        (product) => product.id === Number(item.id)
      );

      if (!product) return null;

      const quantity = Math.floor(Number(item.quantity));

      if (!Number.isFinite(quantity) || quantity < 1) {
        return null;
      }

           const size = String(item.size || "M").toUpperCase();

      const allowedSizes = Array.isArray(product.sizes)
        ? product.sizes
        : ["XS", "S", "M", "L", "XL"];

      if (!allowedSizes.includes(size)) {
        return null;
      }
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        size
      };
    })
    .filter(Boolean);
}

function renderCheckout() {
  const validItems = getValidItems();
  const submitButton = checkoutForm.querySelector(
    'button[type="submit"]'
  );

  if (validItems.length === 0) {
    cartContainer.innerHTML = `
      <p class="text-sm text-white/50">
        Your bag is empty.
      </p>
      <a href="./index.html#collection"
         class="inline-block text-xs uppercase tracking-widest text-[#D92828] underline underline-offset-4">
        Explore the collection ↗
      </a>
    `;

    subtotalElement.textContent = formatPrice(0);
    totalElement.textContent = formatPrice(0);
    submitButton.disabled = true;
    submitButton.classList.add("opacity-40", "cursor-not-allowed");
    return;
  }

  cartContainer.innerHTML = validItems.map((item) => `
    <div class="flex gap-4 border-b border-white/10 pb-5">
      <img
        src="${item.image}"
        alt="${item.name}"
        class="h-24 w-20 bg-white/5 object-cover"
      />

      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-bold uppercase leading-5">
          ${item.name}
        </h3>

        <p class="mt-2 text-xs text-white/50">
          Size: ${item.size} · Qty: ${item.quantity}
        </p>

        <p class="mt-3 text-sm font-semibold">
          ${formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </div>
  `).join("");

  const subtotal = validItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  subtotalElement.textContent = formatPrice(subtotal);
  totalElement.textContent = formatPrice(subtotal);

  submitButton.disabled = false;
  submitButton.classList.remove("opacity-40", "cursor-not-allowed");
}

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  errorElement.classList.add("hidden");
  errorElement.textContent = "";

  const items = getValidItems();

  if (items.length === 0) {
    errorElement.textContent =
      "Your bag is empty or contains invalid items.";
    errorElement.classList.remove("hidden");
    renderCheckout();
    return;
  }

  if (!checkoutForm.reportValidity()) return;

  const formData = new FormData(checkoutForm);

  const customer = {
    fullName: String(formData.get("fullName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    state: String(formData.get("state") || "").trim(),
    postalCode: String(formData.get("postalCode") || "").trim()
  };

  if (Object.values(customer).some((value) => !value)) {
    errorElement.textContent =
      "Please complete all customer and shipping fields.";
    errorElement.classList.remove("hidden");
    return;
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = {
    orderNumber: `NOIR-${Date.now()}`,
    createdAt: new Date().toISOString(),
    customer,
    items,
    subtotal: total,
    total,
    status: "demo"
  };

  try {
    localStorage.setItem("noir-last-order", JSON.stringify(order));
    window.location.href = "./confirmation.html";
  } catch {
    errorElement.textContent =
      "We couldn't save your order. Please try again.";
    errorElement.classList.remove("hidden");
  }
});

renderCheckout();
