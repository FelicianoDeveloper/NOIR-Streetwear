/* ==========================================================================
   NOIR® — SACOLA FLUTUANTE
   Depois de rolar 100px, o botão da sacola desce junto com a tela.
   A posição/aparência ficam na classe .is-floating (src/site.css e motion.css);
   aqui só liga/desliga a classe e guarda o espaço dele no cabeçalho.
   ========================================================================== */
(() => {
  "use strict";

  const bagButton =
    document.getElementById("cart-button") ||
    document.getElementById("product-cart-button");

  if (!bagButton || !bagButton.parentElement) return;

  const placeholder = document.createElement("div");
  placeholder.setAttribute("aria-hidden", "true");

  let floating = false;

  function update() {
    const shouldFloat = window.scrollY > 100;
    if (shouldFloat === floating) return;

    if (shouldFloat) {
      const rect = bagButton.getBoundingClientRect();
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      bagButton.parentElement.insertBefore(placeholder, bagButton);
      bagButton.classList.add("is-floating");
    } else {
      bagButton.classList.remove("is-floating");
      placeholder.remove();
    }

    floating = shouldFloat;
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
})();
