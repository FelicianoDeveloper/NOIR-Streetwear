/* ==========================================================================
   NOIR® — HOME (catálogo)
   Os dados e a sacola moram em store.js e cart-drawer.js (carregados antes).
   Este arquivo cuida só da vitrine: filtros, ordenação e cards.
   ========================================================================== */
(() => {
  "use strict";

  const { products, money } = window.NoirStore;

  const grid = document.querySelector("#product-grid");
  const countLabel = document.querySelector("#product-count");
  const filters = document.querySelector("#category-filters");
  const sort = document.querySelector("#sort-products");

  if (!grid || !countLabel || !filters || !sort) {
    console.error(
      "NOIR: elementos do catálogo não encontrados. Confira os IDs no index.html."
    );
    return;
  }

  const bag = window.NoirCart.init({
    button: "#cart-button",
    count: "#cart-count",
  });

  let activeCategory = "all";

  function cardMarkup(product) {
    return `
      <article
        class="product-card group cursor-pointer"
        data-cursor="view"
        data-open-product="${product.id}"
        tabindex="0"
        role="link"
        aria-label="View ${product.name}"
      >
        <div class="card-media relative overflow-hidden bg-[#171717]">
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
            class="card-cta absolute bottom-3 left-3 right-3 bg-[#F2F0EB] px-4 py-4 text-xs font-bold uppercase tracking-widest text-[#0B0B0B] transition hover:bg-[#D92828] hover:text-white"
          >
            Add to bag +
          </button>
        </div>

        <div class="card-meta flex items-start justify-between gap-3 pt-4">
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
    `;
  }

  function renderProducts() {
    let visible = [...products];

    if (activeCategory !== "all") {
      visible = visible.filter((product) => product.category === activeCategory);
    }

    if (sort.value === "price-asc") {
      visible.sort((a, b) => a.price - b.price);
    } else if (sort.value === "price-desc") {
      visible.sort((a, b) => b.price - a.price);
    }

    grid.innerHTML = visible.map(cardMarkup).join("");
    countLabel.textContent = `${visible.length} products / Drop 001`;

    // Motion: os cards entram em sequência (também quando o filtro muda).
    window.NoirMotion?.enterCards(grid);
  }

  function openProduct(card) {
    window.NoirMotion?.markShared(card); // a foto "viaja" até a página do produto
    window.location.href = `./product.html?id=${card.dataset.openProduct}`;
  }

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    activeCategory = button.dataset.category;

    filters.querySelectorAll("[data-category]").forEach((item) => {
      const active = item === button;

      item.setAttribute("aria-pressed", String(active));
      item.classList.toggle("bg-[#D92828]", active);
      item.classList.toggle("border-[#D92828]", active);
      item.classList.toggle("text-white", active);
      item.classList.toggle("border-white/20", !active);
    });

    renderProducts();
  });

  sort.addEventListener("change", renderProducts);

  grid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");

    if (addButton) {
      const added = bag?.add(Number(addButton.dataset.addToCart));

      // Motion: botão confirma e a foto voa até a sacola.
      if (added) {
        window.NoirMotion?.addedFeedback(
          addButton,
          addButton.closest(".product-card")?.querySelector("img"),
          bag.button
        );
      }
      return;
    }

    const card = event.target.closest("[data-open-product]");
    if (card) openProduct(card);
  });

  grid.addEventListener("keydown", (event) => {
    const card = event.target.closest("[data-open-product]");

    if (!card || (event.key !== "Enter" && event.key !== " ")) return;
    if (event.target.closest("button")) return;

    event.preventDefault();
    openProduct(card);
  });

  renderProducts();
})();
