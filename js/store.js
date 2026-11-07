/* ==========================================================================
   NOIR® — STORE
   Fonte única de verdade do site: catálogo, preço e sacola (localStorage).
   Antes estas mesmas informações estavam copiadas em main.js, product.js e
   checkout.js. Agora, para mudar um preço ou adicionar um produto, edite
   SÓ a lista `products` abaixo.
   Carregue este arquivo ANTES dos outros scripts da página.
   ========================================================================== */
(() => {
  "use strict";

  const CART_KEY = "noir-cart";
  const DEFAULT_SIZE = "M";

  const products = [
    {
      id: 1,
      name: "VOID OVERSIZED TEE",
      category: "T-shirts",
      price: 149.9,
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
      price: 289.9,
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
      price: 259.9,
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
      price: 129.9,
      image: "./assets/images/no-signal-tee.jpg",
      label: "ESSENTIAL",
      description:
        "Disconnect from the noise. The NO SIGNAL Tee keeps things clean with a minimalist design and an effortless oversized fit. Less distraction. More identity.",
      sizes: ["XS", "S", "M", "L", "XL"],
    },
  ];

  const byId = (id) => products.find((product) => product.id === Number(id));

  const money = (value) =>
    Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  /* Valida um item vindo do localStorage; devolve null se não servir. */
  function normalizeItem(item) {
    if (!item) return null;

    const product = byId(item.id);
    if (!product) return null;

    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) return null;

    const size = String(item.size || DEFAULT_SIZE).toUpperCase();

    return {
      id: product.id,
      quantity,
      size: product.sizes.includes(size) ? size : DEFAULT_SIZE,
    };
  }

  /* Lê a sacola, descarta itens inválidos e junta linhas repetidas (mesmo produto + tamanho). */
  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(saved)) return [];

      const cart = [];

      saved.map(normalizeItem).filter(Boolean).forEach((item) => {
        const same = cart.find(
          (line) => line.id === item.id && line.size === item.size
        );
        if (same) same.quantity += item.quantity;
        else cart.push(item);
      });

      return cart;
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      return true;
    } catch {
      return false;
    }
  }

  const count = (cart) => cart.reduce((total, item) => total + item.quantity, 0);

  const subtotal = (cart) =>
    cart.reduce((total, item) => {
      const product = byId(item.id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);

  /* Itens da sacola já com nome, preço e imagem (usado no checkout). */
  const lines = (cart) =>
    cart.map((item) => {
      const product = byId(item.id);
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity,
        size: item.size,
      };
    });

  window.NoirStore = {
    CART_KEY,
    DEFAULT_SIZE,
    products,
    byId,
    money,
    loadCart,
    saveCart,
    count,
    subtotal,
    lines,
  };
})();
