/* ==========================================================================
   NOIR® — MOTION ENGINE
   JS puro, sem dependências. Expõe window.NoirMotion para os outros scripts.
   Tudo aqui respeita prefers-reduced-motion e falha em silêncio:
   se algo der errado, o site continua funcionando sem animação.
   ========================================================================== */
(() => {
  "use strict";

  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [
    ...scope.querySelectorAll(selector),
  ];
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

  let ready = false;

  /* ------------------------------------------------------------------------
     1. SPLIT — quebra um título em palavras, cada uma dentro de uma máscara
     Mantém o <span> vermelho do ponto final colado na palavra anterior.
     ------------------------------------------------------------------------ */
  function splitWords(el) {
    if (el.classList.contains("is-split")) return;

    const nodes = [...el.childNodes];
    el.textContent = "";

    let index = 0;
    let lastUnit = null; // último .sp-c criado
    let glued = false; // true = nenhum espaço desde a última palavra

    const newUnit = () => {
      const mask = document.createElement("span");
      mask.className = "sp-m";
      const inner = document.createElement("span");
      inner.className = "sp-c";
      inner.style.setProperty("--i", index++);
      mask.appendChild(inner);
      el.appendChild(mask);
      lastUnit = inner;
      glued = true;
      return inner;
    };

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((token) => {
          if (!token) return;
          if (/^\s+$/.test(token)) {
            el.appendChild(document.createTextNode(" "));
            glued = false;
            return;
          }
          const target = glued && lastUnit ? lastUnit : newUnit();
          target.appendChild(document.createTextNode(token));
        });
        return;
      }

      if (node.nodeName === "BR") {
        el.appendChild(node);
        glued = false;
        lastUnit = null;
        return;
      }

      const target = glued && lastUnit ? lastUnit : newUnit();
      target.appendChild(node);
    });

    el.classList.add("is-split");
  }

  /* ------------------------------------------------------------------------
     2. REVEAL — o que acontece quando algo entra na tela
     ------------------------------------------------------------------------ */
  const revealIO =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries
              .filter((entry) => entry.isIntersecting)
              .forEach((entry) => {
                entry.target.classList.add("is-in");
                revealIO.unobserve(entry.target);
              });
          },
          { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
        )
      : null;

  const cardIO =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries
              .filter((entry) => entry.isIntersecting)
              .forEach((entry, order) => {
                entry.target.style.setProperty("--i", order);
                entry.target.classList.add("is-in");
                cardIO.unobserve(entry.target);
              });
          },
          { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
        )
      : null;

  function observeReveal(el) {
    if (reduce || !revealIO) {
      el.classList.add("is-in");
      return;
    }
    revealIO.observe(el);
  }

  /* Procura elementos novos (inclusive os criados por JS) e liga as animações. */
  function scan(scope = document) {
    $$("[data-split]", scope).forEach((el) => {
      splitWords(el);
      if (el.dataset.split === "intro") {
        if (ready || reduce) el.classList.add("is-in");
      } else {
        observeReveal(el);
      }
    });

    $$("[data-reveal]", scope).forEach(observeReveal);

    $$("[data-wipe]", scope).forEach((el) => {
      if (el.dataset.wipe === "intro") {
        if (ready || reduce) el.classList.add("is-in");
      } else {
        observeReveal(el);
      }
    });

    initZoom(scope);
  }

  /* Cards do catálogo: entram em sequência e de novo quando o filtro muda. */
  function enterCards(grid) {
    if (!grid) return;
    $$(".product-card", grid).forEach((card) => {
      if (reduce || !cardIO) {
        card.classList.add("is-in");
        return;
      }
      cardIO.observe(card);
    });
  }

  /* ------------------------------------------------------------------------
     3. AÇÕES — respostas visuais ao que a pessoa fez
     ------------------------------------------------------------------------ */
  function bump(bagButton) {
    if (!bagButton) return;
    const count = $("#cart-count, #product-cart-count", bagButton);
    if (count) {
      count.classList.remove("noir-bump");
      void count.offsetWidth;
      count.classList.add("noir-bump");
    }
    bagButton.classList.remove("bag-flash");
    void bagButton.offsetWidth;
    bagButton.classList.add("bag-flash");
  }

  /* A foto do produto voa até o botão da sacola. */
  function flyToBag(imgEl, bagButton) {
    if (!bagButton) return;
    if (reduce || !imgEl) {
      bump(bagButton);
      return;
    }

    const from = imgEl.getBoundingClientRect();
    const to = bagButton.getBoundingClientRect();
    if (!from.width || !to.width) {
      bump(bagButton);
      return;
    }

    const width = Math.min(from.width, 180);
    const height = width * (from.height / from.width);
    const left = from.left + from.width / 2 - width / 2;
    const top = from.top + from.height / 2 - height / 2;
    const dx = to.left + to.width / 2 - (left + width / 2);
    const dy = to.top + to.height / 2 - (top + height / 2);

    const ghost = document.createElement("div");
    ghost.className = "noir-fly";
    ghost.setAttribute("aria-hidden", "true");
    Object.assign(ghost.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundImage: `url("${imgEl.currentSrc || imgEl.src}")`,
    });
    document.body.appendChild(ghost);

    const flight = ghost.animate(
      [
        { transform: "translate3d(0,0,0) scale(1) rotate(0deg)", opacity: 1 },
        {
          transform: `translate3d(${dx * 0.45}px, ${dy * 0.45 - 90}px, 0) scale(0.55) rotate(-8deg)`,
          opacity: 1,
          offset: 0.45,
        },
        {
          transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.08) rotate(6deg)`,
          opacity: 0.25,
        },
      ],
      { duration: 850, easing: "cubic-bezier(0.55, 0, 0.25, 1)", fill: "forwards" }
    );

    flight.onfinish = () => {
      ghost.remove();
      bump(bagButton);
    };
    flight.oncancel = () => ghost.remove();
  }

  /* Botão "Add to bag +" vira "Added ✓" e a foto voa até a sacola. */
  function addedFeedback(button, imgEl, bagButton) {
    flyToBag(imgEl, bagButton);
    if (!button) return;

    if (!button.dataset.label) button.dataset.label = button.textContent.trim();
    button.textContent = "Added ✓";
    button.classList.add("is-added");

    clearTimeout(button._noirTimer);
    button._noirTimer = setTimeout(() => {
      button.textContent = button.dataset.label;
      button.classList.remove("is-added");
    }, 1400);
  }

  /* Itens da sacola entram em sequência quando o drawer abre. */
  function drawerOpened(list) {
    if (reduce || !list) return;
    list.classList.add("is-opening");
    clearTimeout(list._noirTimer);
    list._noirTimer = setTimeout(() => list.classList.remove("is-opening"), 1300);
  }

  function shake(el) {
    if (!el || reduce) return;
    el.classList.remove("noir-shake");
    void el.offsetWidth;
    el.classList.add("noir-shake");
  }

  /* Dá nome à foto clicada para a transição entre páginas "carregá-la" até o produto. */
  function markShared(card) {
    if (!card) return;
    const media = $(".card-media", card);
    if (media) media.style.viewTransitionName = `pimg-${card.dataset.openProduct}`;
  }

  /* Zoom que segue o mouse na foto do produto (só desktop). */
  function initZoom(scope = document) {
    if (!finePointer || reduce) return;
    $$("[data-zoom]", scope).forEach((box) => {
      if (box._noirZoom) return;
      box._noirZoom = true;
      const img = $("img", box);
      if (!img) return;

      box.addEventListener("pointermove", (event) => {
        const rect = box.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        img.style.transformOrigin = `${x.toFixed(1)}% ${y.toFixed(1)}%`;
        img.style.transform = "scale(1.65)";
      });
      box.addEventListener("pointerleave", () => {
        img.style.transform = "";
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. NÚMEROS E TEXTO — total que conta, pedido que "decodifica"
     ------------------------------------------------------------------------ */
  function countTo(el, value, format, duration = 1000) {
    if (!el) return;
    const fmt = format || ((n) => String(Math.round(n)));
    if (reduce) {
      el.textContent = fmt(value);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(value * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(value);
    };
    requestAnimationFrame(step);
  }

  function scramble(el, text, duration = 900) {
    if (!el) return;
    if (reduce) {
      el.textContent = text;
      return;
    }
    const pool = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#%/";
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const fixed = Math.floor(p * text.length);
      el.textContent =
        text.slice(0, fixed) +
        [...text.slice(fixed)]
          .map((ch) =>
            /[A-Za-z0-9]/.test(ch) ? pool[(Math.random() * pool.length) | 0] : ch
          )
          .join("");
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = text;
    };
    requestAnimationFrame(step);
  }

  /* Confete nas cores da marca, uma única explosão. */
  function confetti(originEl) {
    if (reduce) return;

    const canvas = document.createElement("canvas");
    canvas.className = "noir-confetti";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (canvas.width = window.innerWidth * dpr);
    const H = (canvas.height = window.innerHeight * dpr);
    const ctx = canvas.getContext("2d");

    let ox = W / 2;
    let oy = H * 0.3;
    if (originEl) {
      const r = originEl.getBoundingClientRect();
      ox = (r.left + r.width / 2) * dpr;
      oy = (r.top + r.height / 2) * dpr;
    }

    const colors = ["#D92828", "#F2F0EB", "#F2F0EB", "#FFFFFF", "#8F1B1B"];
    const pieces = Array.from({ length: 150 }, () => {
      const angle = (-100 + (Math.random() - 0.5) * 150) * (Math.PI / 180);
      const speed = (6 + Math.random() * 11) * dpr;
      return {
        x: ox,
        y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: (6 + Math.random() * 8) * dpr,
        h: (3 + Math.random() * 3) * dpr,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.4,
        color: colors[(Math.random() * colors.length) | 0],
      };
    });

    const LIFE = 2400;
    const t0 = performance.now();
    let last = t0;

    const frame = (now) => {
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      const age = now - t0;

      ctx.clearRect(0, 0, W, H);
      const fade = age > LIFE * 0.7 ? Math.max(0, 1 - (age - LIFE * 0.7) / (LIFE * 0.3)) : 1;

      pieces.forEach((p) => {
        p.vy += 0.3 * dpr * dt;
        p.vx *= Math.pow(0.985, dt);
        p.vy *= Math.pow(0.992, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (age < LIFE) requestAnimationFrame(frame);
      else canvas.remove();
    };
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------------
     5. AMBIENTE — coisas que ficam "vivas" enquanto a pessoa navega
     ------------------------------------------------------------------------ */
  function initProgress() {
    const bar = document.createElement("div");
    bar.className = "noir-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    const update = () => {
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.transform = `scaleX(${p})`;
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* Faixa infinita. Acelera quando você rola pra baixo e INVERTE quando rola pra cima. */
  function initTicker() {
    const track = $(".ticker-track");
    if (!track || !track.firstElementChild) return;

    const first = track.firstElementChild;

    const build = () => {
      [...track.children].slice(1).forEach((node) => node.remove());
      const groupWidth = first.getBoundingClientRect().width;
      if (!groupWidth) return;

      const copies = Math.ceil(window.innerWidth / groupWidth) + 1;
      for (let i = 0; i < copies; i++) {
        const clone = first.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }
      track.style.setProperty("--gw", `${groupWidth}px`);
      track.style.setProperty("--ticker-dur", `${(groupWidth / 70).toFixed(2)}s`);
      track.classList.add("is-live");
    };

    build();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    });

    try {
      const animation = track.getAnimations()[0];
      if (!animation) return;
      // Margem de tempo pra frente para o sentido inverso nunca "bater no zero".
      animation.currentTime = 1e7;

      let lastY = window.scrollY;
      let velocity = 0;
      let lastRate = 1;

      const loop = () => {
        const delta = window.scrollY - lastY;
        lastY = window.scrollY;
        velocity += (delta - velocity) * 0.12;

        const rate = Math.max(-8, Math.min(9, 1 + velocity * 0.3));
        if (Math.abs(rate - lastRate) > 0.02) {
          animation.updatePlaybackRate(rate);
          lastRate = rate;
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    } catch {
      /* sem Web Animations: a faixa segue no ritmo normal */
    }
  }

  function initParallax() {
    const images = $$("[data-parallax]");
    if (!images.length) return;

    let queued = false;
    const update = () => {
      queued = false;
      const vh = window.innerHeight;
      images.forEach((img) => {
        const rect = (img.parentElement || img).getBoundingClientRect();
        if (rect.bottom < -50 || rect.top > vh + 50) return;
        const p = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - vh / 2) / vh));
        img.style.setProperty("--py", `${(p * -24).toFixed(1)}px`);
      });
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!queued) {
          queued = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* Anel que segue o mouse; vira "VIEW" nos cards e um ponto vermelho em links/botões. */
  function initCursor() {
    if (!finePointer) return;

    const ring = document.createElement("div");
    ring.className = "noir-cursor";
    ring.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = "View";
    ring.appendChild(label);
    document.body.appendChild(ring);

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;

    window.addEventListener(
      "pointermove",
      (event) => {
        tx = event.clientX;
        ty = event.clientY;
        ring.classList.add("is-on");

        const view = event.target.closest("[data-cursor='view']");
        const control = event.target.closest("a, button, input, select, label");
        const isView = !!view && !control;
        const isLink = !!control || (!!event.target.closest("[role='link']") && !view);

        if (isView) label.textContent = view.dataset.cursorLabel || "View";
        ring.classList.toggle("is-view", isView);
        ring.classList.toggle("is-link", isLink && !isView);
      },
      { passive: true }
    );
    root.addEventListener("mouseleave", () => ring.classList.remove("is-on"));

    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------------------
     6. ARRANQUE
     ------------------------------------------------------------------------ */
  async function start() {
    root.classList.add("motion-ok");
    scan();

    if (!reduce) {
      initProgress();
      initTicker();
      initParallax();
      initCursor();
    }

    // Espera a foto principal decodificar (no máx. 0,9s) para a abertura não começar com um buraco.
    const gate = $("[data-gate]");
    if (gate && !reduce && gate.decode) {
      await Promise.race([gate.decode().catch(() => {}), wait(900)]);
    }
    await nextFrame();

    ready = true;
    root.classList.add("is-ready");
    $$("[data-split='intro'], [data-wipe='intro']").forEach((el) =>
      el.classList.add("is-in")
    );
  }

  window.NoirMotion = {
    reduce,
    scan,
    enterCards,
    flyToBag,
    addedFeedback,
    drawerOpened,
    shake,
    markShared,
    countTo,
    scramble,
    confetti,
  };

  try {
    start();
  } catch (error) {
    console.error("NOIR motion: falha ao iniciar, o site segue sem animação.", error);
  }
})();
