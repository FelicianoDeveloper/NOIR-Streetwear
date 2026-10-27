
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
  if (
    !order ||
    !Array.isArray(order.items) ||
    !order.customer ||
    typeof order.customer !== "object" ||
    !Number.isFinite(Number(order.total)) ||
    typeof order.orderNumber !== "string" ||
    !order.items.every(
      (item) =>
        item &&
        typeof item.name === "string" &&
        typeof item.size === "string" &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0 &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0
    )
  ) {
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
itemsContainer.replaceChildren();
order.items.forEach((item) => {
  const row = document.createElement("div");
  row.className =
    "flex justify-between gap-4 border-b border-white/10 pb-4";
  const details = document.createElement("div");
  const name = document.createElement("h3");
  name.className = "text-xs font-bold uppercase";
  name.textContent = item.name;

  const description = document.createElement("p");
  description.className = "mt-2 text-xs text-white/40";
  description.textContent =
    `Size: ${item.size} · Qty: ${item.quantity}`;

  details.append(name, description);

  const price = document.createElement("p");
  price.className = "whitespace-nowrap text-sm";
  price.textContent = formatPrice(item.price * item.quantity);

  row.append(details, price);
  itemsContainer.append(row);
});

const customer = order.customer;

customerContainer.replaceChildren();

const createTextElement = (tag, text, className = "") => {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
};

customerContainer.append(
  createTextElement(
    "p",
    customer.fullName,
    "font-bold text-[#F2F0EB]"
  ),
  createTextElement("p", customer.email),
  createTextElement("p", customer.phone)
);

const addressContainer = document.createElement("div");
addressContainer.className = "border-t border-white/10 pt-4";

addressContainer.append(
  createTextElement("p", customer.address),
  createTextElement("p", `${customer.city}, ${customer.state}`),
  createTextElement("p", `Postal code: ${customer.postalCode}`)
);

customerContainer.append(addressContainer);
}


loadConfirmation();
