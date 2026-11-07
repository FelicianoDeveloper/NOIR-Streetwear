/* ==========================================================================
   NOIR® — SACOLA (drawer)
   Um único código para a sacola da home e da página de produto.
   O HTML do drawer (#cart-drawer, #cart-items, ...) é igual nas duas páginas.

   Uso:
     const bag = NoirCart.init({ button: "#cart-button", count: "#cart-count" });
     bag.add(productId, "M", 1);
   Depende de store.js (carregue antes).
   ========================================================================== */
(() => {
  "use strict";

  const { byId, money, loadCart, saveCart, count, subtotal } = window.NoirStore;

  const $ = (selector) => document.querySelector(selector);

  function emptyState() {
    return `
      <div class="flex h-full min-h-48 flex-col items-center justify-center text-center">
        <p class="font-display text-4xl font-black uppercase">
          Nothing here<span class="text-[#D92828]">.</span>
        </p>
        <p class="mt-3 text-sm text-white/45">
          Your next favorite piece is waiting.
        </p>
      </div>
    `;
  }

  function itemMarkup(item) {
    const product = byId(item.id);
    if (!product) return "";

    const data = `data-id="${product.id}" data-size="${item.size}"`;

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

          <p class="mt-2 text-sm">${money(product.price)}</p>
          <p class="mt-1 text-xs uppercase tracking-widest text-white/50">
            Size: ${item.size}
          </p>

          <div class="mt-auto flex items-center justify-between gap-3 pt-4">
            <div class="flex items-center border border-white/20">
              <button
                type="button"
                data-cart-action="decrease"
                ${data}
                class="qty-btn px-3 py-2 hover:text-[#D92828]"
                aria-label="Decrease quantity of ${product.name}"
              >−</button>

              <span class="min-w-8 text-center text-xs">${item.quantity}</span>

              <button
                type="button"
                data-cart-action="increase"
                ${data}
                class="qty-btn px-3 py-2 hover:text-[#D92828]"
                aria-label="Increase quantity of ${product.name}"
              >+</button>
            </div>

            <button
              type="button"
              data-cart-action="remove"
              ${data}
              class="tap text-[10px] uppercase tracking-widest text-white/40 underline hover:text-[#D92828]"
              aria-label="Remove ${product.name} from bag"
            >Remove</button>
          </div>
        </div>
      </article>
    `;
  }

  function init({ button, count: countSelector }) {
    const el = {
      button: $(button),
      count: $(countSelector),
      drawer: $("#cart-drawer"),
      overlay: $("#cart-overlay"),
      close: $("#close-cart"),
      keepShopping: $("#continue-shopping"),
      items: $("#cart-items"),
      subtotal: $("#cart-subtotal"),
      drawerCount: $("#drawer-cart-count"),
      checkout: $("#checkout-button"),
    };

    const missing = Object.keys(el).filter((key) => !el[key]);
    if (missing.length) {
      console.error(
        `NOIR: elementos da sacola não encontrados (${missing.join(", ")}). Confira os IDs no HTML.`
      );
      return null;
    }

    let cart = loadCart();

    function render() {
      const quantity = count(cart);

      el.count.textContent = quantity;
      el.drawerCount.textContent = `(${quantity})`;
      el.subtotal.textContent = money(subtotal(cart));
      el.checkout.disabled = cart.length === 0;

      el.items.innerHTML =
        cart.length === 0 ? emptyState() : cart.map(itemMarkup).join("");
    }

    function commit() {
      saveCart(cart);
      render();
    }

    function isOpen() {
      return el.drawer.getAttribute("aria-hidden") === "false";
    }

    function open() {
      el.drawer.classList.remove("translate-x-full");
      el.overlay.classList.remove("hidden");
      el.drawer.setAttribute("aria-hidden", "false");
      el.drawer.removeAttribute("inert");
      document.body.classList.add("overflow-hidden");
      el.close.focus();
      window.NoirMotion?.drawerOpened(el.items);
    }

    function close() {
      el.drawer.classList.add("translate-x-full");
      el.overlay.classList.add("hidden");
      el.drawer.setAttribute("aria-hidden", "true");
      el.drawer.setAttribute("inert", "");
      document.body.classList.remove("overflow-hidden");
      el.button.focus();
    }

    function add(id, size = "M", quantity = 1) {
      const product = byId(id);
      if (!product || !product.sizes.includes(size)) return false;

      const existing = cart.find(
        (item) => item.id === product.id && item.size === size
      );

      if (existing) existing.quantity += quantity;
      else cart.push({ id: product.id, quantity, size });

      commit();
      return true;
    }

    el.items.addEventListener("click", (event) => {
      const action = event.target.closest("[data-cart-action]");
      if (!action) return;

      const id = Number(action.dataset.id);
      const size = action.dataset.size;
      const item = cart.find((line) => line.id === id && line.size === size);
      if (!item) return;

      if (action.dataset.cartAction === "increase") item.quantity += 1;
      if (action.dataset.cartAction === "decrease") item.quantity -= 1;
      if (action.dataset.cartAction === "remove") item.quantity = 0;

      cart = cart.filter((line) => line.quantity > 0);
      commit();
    });

    el.button.addEventListener("click", open);
    el.close.addEventListener("click", close);
    el.keepShopping.addEventListener("click", close);
    el.overlay.addEventListener("click", close);

    el.checkout.addEventListener("click", () => {
      if (cart.length === 0) return;
      window.location.href = "./checkout.html";
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) close();
    });

    /* Voltou pelo botão "voltar" do celular (a página vem do cache) ou mexeu em outra aba:
       relê a sacola para o contador nunca ficar desatualizado. */
    const refresh = () => {
      cart = loadCart();
      render();
    };
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) refresh();
    });
    window.addEventListener("storage", (event) => {
      if (event.key === window.NoirStore.CART_KEY) refresh();
    });

    render();

    return { add, open, close, button: el.button };
  }

  window.NoirCart = { init };
})();
