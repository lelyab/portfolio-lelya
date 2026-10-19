/* Lelya Bedin — interactions du portfolio */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  document.documentElement.classList.add("js");

  /* ---------- Loader ---------- */
  const loader = document.querySelector(".loader");
  const hideLoader = () => loader && loader.classList.add("is-done");
  if (loader) {
    const delay = reduceMotion ? 0 : 1500;
    window.addEventListener("load", () => setTimeout(hideLoader, delay));
    setTimeout(hideLoader, 4000); // filet de sécurité
  }

  /* ---------- Année du footer ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Placeholders : si une image manque, on garde le bloc stylé ---------- */
  document.addEventListener(
    "error",
    (e) => {
      if (e.target.tagName !== "IMG") return;
      const media = e.target.closest(".media");
      if (media) media.classList.add("is-empty");
      else e.target.style.display = "none";
    },
    true
  );

  /* ---------- Galeries : construit les cartes vidéo à partir de data-* ---------- */
  document.querySelectorAll(".gallery").forEach((gallery) => {
    const { title, sub, prefix, count } = gallery.dataset;
    const total = parseInt(count, 10) || 0;

    const head = document.createElement("div");
    head.className = "gallery__head";
    head.innerHTML = `
      <h3 class="gallery__title reveal">${title}</h3>
      ${sub ? `<span class="gallery__sub reveal">${sub}</span>` : ""}`;
    gallery.appendChild(head);

    const grid = document.createElement("div");
    grid.className = "gallery__grid";
    for (let i = 1; i <= total; i++) {
      const n = String(i).padStart(2, "0");
      const phone = document.createElement("figure");
      phone.className = "phone reveal";
      phone.style.setProperty("--d", `${((i - 1) % 4) * 0.08}s`);
      phone.dataset.cursor = "Voir";
      phone.innerHTML = `
        <div class="media" data-label="Vidéo à ajouter">
          <img src="assets/${prefix}-${n}.jpg" alt="${title}, création ${i}" loading="lazy">
        </div>`;
      grid.appendChild(phone);
    }
    gallery.appendChild(grid);
  });

  /* ---------- Révélations au scroll ---------- */
  const revealEls = document.querySelectorAll(
    ".reveal, .reveal-clip, .split-line"
  );
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Titres : la ligne du hero et de la section contact se révèlent d'elle-même */
  document.querySelectorAll(".hero__title .split-line").forEach((el) => {
    setTimeout(() => el.classList.add("is-visible"), reduceMotion ? 0 : 1700);
  });

  /* ---------- Compteurs animés ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) {
      el.textContent = target.toLocaleString("fr-FR");
      return;
    }
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased).toLocaleString("fr-FR");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          cio.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Parallaxe ---------- */
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  let ticking = false;
  const updateParallax = () => {
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const factor = parseFloat(el.dataset.parallax) || 0;
      const center = rect.top + rect.height / 2 - vh / 2;
      el.style.translate = `0 ${(-center * factor).toFixed(1)}px`;
    });
    ticking = false;
  };

  /* ---------- Barre de progression + nav ---------- */
  const nav = document.querySelector(".nav");
  const progress = document.querySelector(".progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 40);
    if (!reduceMotion && !ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = document.querySelector(".nav__burger");
  const menu = document.querySelector(".menu");
  if (burger && menu) {
    const setMenu = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }

  /* ---------- Curseur personnalisé ---------- */
  const cursor = document.querySelector(".cursor");
  if (cursor && finePointer && !reduceMotion) {
    let x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      cursor.classList.add("is-active");
    });
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll("a, button, .phone, .service, .frame, [data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hover");
        const label = el.dataset.cursor || "";
        cursor.dataset.label = label;
        cursor.classList.toggle("has-label", Boolean(label));
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hover");
        cursor.dataset.label = "";
      });
    });

    /* Boutons magnétiques */
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.3;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });

    /* Inclinaison 3D des cartes vidéo */
    document.querySelectorAll(".phone").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }
})();
