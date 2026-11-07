
// Catálogo, preços e leitura da sacola vêm do store.js (carregado antes deste arquivo).
const { money: formatPrice, loadCart, lines } = window.NoirStore;

const cartContainer = document.querySelector("#checkout-items");
const subtotalElement = document.querySelector("#checkout-subtotal");
const totalElement = document.querySelector("#checkout-total");
const checkoutForm = document.querySelector("#checkout-form");
const errorElement = document.querySelector("#checkout-error");

// Itens válidos da sacola (produto, preço e tamanho conferidos no store.js).
const getValidItems = () => lines(loadCart());

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
         class="tap inline-block text-xs uppercase tracking-widest text-[#D92828] underline underline-offset-4">
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

  // Motion: o total "conta" até o valor final.
  window.NoirMotion?.countTo(totalElement, subtotal, formatPrice, 1200);

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

  const submitButton = checkoutForm.querySelector('button[type="submit"]');

  try {
    localStorage.setItem("noir-last-order", JSON.stringify(order));

    // Motion: estado de "processando" antes de abrir a confirmação.
    submitButton.disabled = true;
    submitButton.classList.add("btn-loading");
    submitButton.textContent = "Placing order…";

    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 900;

    setTimeout(() => {
      window.location.href = "./confirmation.html";
    }, delay);
  } catch {
    errorElement.textContent =
      "We couldn't save your order. Please try again.";
    errorElement.classList.remove("hidden");
  }
});

renderCheckout();

// Se a pessoa voltar com o botão "voltar" do navegador, o botão não fica travado.
window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;

  const button = checkoutForm.querySelector('button[type="submit"]');
  button.disabled = false;
  button.classList.remove("btn-loading");
  button.textContent = "Review order ↗";
});
