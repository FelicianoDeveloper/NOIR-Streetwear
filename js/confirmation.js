
const orderNumberElement = document.querySelector(
  "#confirmation-order-number"
);

const totalElement = document.querySelector(
  "#confirmation-total"
);

const itemsContainer = document.querySelector(
  "#confirmation-items"
);

const customerContainer = document.querySelector(
  "#confirmation-customer"
);

const formatPrice = (price) =>
  Number(price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function loadConfirmation() {
  let order;

  try {
    order = JSON.parse(
      localStorage.getItem("noir-last-order")
    );
  } catch {
    order = null;
  }

  if (!order || !Array.isArray(order.items)) {
    orderNumberElement.textContent = "No order found";
    totalElement.textContent = formatPrice(0);

    itemsContainer.textContent =
      "No saved demonstration order was found.";

    customerContainer.textContent =
      "Complete the checkout to view your order details.";

    return;
  }

  orderNumberElement.textContent = order.orderNumber;
  totalElement.textContent = formatPrice(order.total);

  itemsContainer.innerHTML = order.items.map((item) => `
    <div class="flex justify-between gap-4 border-b border-white/10 pb-4">
      <div>
        <h3 class="text-xs font-bold uppercase">
          ${item.name}
        </h3>

        <p class="mt-2 text-xs text-white/40">
          Size: ${item.size} · Qty: ${item.quantity}
        </p>
      </div>

      <p class="whitespace-nowrap text-sm">
        ${formatPrice(item.price * item.quantity)}
      </p>
    </div>
  `).join("");

  const customer = order.customer;

  customerContainer.innerHTML = `
    <p class="font-bold text-[#F2F0EB]">
      ${customer.fullName}
    </p>

    <p>${customer.email}</p>
    <p>${customer.phone}</p>

    <div class="border-t border-white/10 pt-4">
      <p>${customer.address}</p>
      <p>${customer.city}, ${customer.state}</p>
      <p>Postal code: ${customer.postalCode}</p>
    </div>
  `;
}

loadConfirmation();
