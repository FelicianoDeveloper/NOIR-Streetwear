/* ==========================================================================
   NOIR® — PÁGINA DE PRODUTO
   Os dados e a sacola moram em store.js e cart-drawer.js (carregados antes).
   Este arquivo cuida só do detalhe: tamanho, quantidade e "Add to bag".
   ========================================================================== */
(() => {
  "use strict";

  const { byId, money } = window.NoirStore;

  const detail = document.querySelector("#product-detail");
  const bag = window.NoirCart.init({
    button: "#product-cart-button",
    count: "#product-cart-count",
  });

  const productId = Number(new URLSearchParams(window.location.search).get("id"));
  const product = byId(productId);

  if (!detail) return;

  if (!product) {
    document.title = "Product not found — NOIR®";

    detail.innerHTML = `
      <div class="py-16">
        <h1 class="font-display text-5xl font-black uppercase">
          Product not found.
        </h1>
        <a href="./index.html#collection"
           class="tap mt-6 inline-block text-sm underline underline-offset-4">
          Return to collection
        </a>
      </div>
    `;
  } else {
    document.title = `${product.name} — NOIR®`;
    document.querySelector("#breadcrumb-name").textContent = product.name;

    detail.innerHTML = `
      <div>
        <div class="relative overflow-hidden bg-[#171717]" data-zoom data-cursor="view" data-cursor-label="Zoom" style="view-transition-name: pimg-${product.id}">
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
        <p data-intro style="--d: 250" class="text-xs uppercase tracking-[0.3em] text-[#D92828]">
          ${product.category} / DROP 001
        </p>

        <h1 data-split="intro" style="--d: 350" class="fit-display mt-4 font-display text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-8xl">
          ${product.name}<span class="text-[#D92828]">.</span>
        </h1>

        <p data-intro style="--d: 800" class="mt-6 text-xl font-medium">${money(product.price)}</p>

        <p data-intro style="--d: 900" class="mt-6 max-w-lg text-sm leading-7 text-white/60">
          ${product.description}
        </p>

        <div class="mt-10" data-intro style="--d: 1000">
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

        <div class="mt-8" data-intro style="--d: 1100">
          <label for="product-quantity" class="mb-3 block text-xs font-bold uppercase tracking-widest">
            Quantity
          </label>
          <input
            id="product-quantity"
            type="number"
            inputmode="numeric"
            min="1"
            max="10"
            value="1"
            class="w-24 border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#D92828]"
          />
        </div>

        <button
          id="detail-add-to-cart"
          data-intro
          style="--d: 1200"
          type="button"
          class="mt-6 w-full bg-[#D92828] px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] transition hover:bg-[#F2F0EB] hover:text-[#0B0B0B] sm:max-w-md"
        >
          Add to bag +
        </button>

        <p data-intro style="--d: 1300" class="mt-5 text-[10px] uppercase tracking-widest text-white/40">
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
        window.NoirMotion?.shake(sizeOptions);
        return;
      }

      const quantity = Number(quantityInput.value);

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        quantityInput.focus();
        quantityInput.reportValidity();
        return;
      }

      if (!bag?.add(product.id, selectedSize, quantity)) return;

      addButton.textContent = "Added to bag ✓";
      addButton.classList.add("is-added");

      // Motion: a foto do produto voa até a sacola.
      window.NoirMotion?.flyToBag(
        document.querySelector("[data-zoom] img"),
        bag.button
      );

      setTimeout(() => {
        addButton.textContent = "Add to bag +";
        addButton.classList.remove("is-added");
      }, 1500);
    });
  }

  // Motion: liga as animações nos elementos que acabaram de ser criados acima.
  window.NoirMotion?.scan(document);
})();
