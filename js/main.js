/* ====================================================================
   Paras Beniwal — portfolio interactions
   ==================================================================== */
"use strict";

const fine = window.matchMedia("(pointer: fine)").matches;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============ preloader ============ */
(() => {
  const pre = document.getElementById("preloader");
  const bar = document.getElementById("preloaderBar");
  const txt = document.getElementById("preloaderText");
  const words = ["initializing", "loading weights", "warming up GPU", "deploying"];
  let p = 0, w = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + 8 + Math.random() * 18);
    bar.style.width = p + "%";
    if (p > (w + 1) * 25 && w < words.length - 1) txt.textContent = words[++w];
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => pre.classList.add("done"), 250);
    }
  }, 110);
})();

/* ============ custom cursor ============ */
(() => {
  if (!fine) return;
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  const label = document.getElementById("cursorLabel");
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

  addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });
  (function follow() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  })();

  document.querySelectorAll("[data-cursor]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      const mode = el.dataset.cursor;
      ring.classList.toggle("viewing", mode === "view");
      ring.classList.toggle("hovering", mode === "hover");
      label.textContent = mode === "view" ? "VIEW" : "";
    });
    el.addEventListener("mouseleave", () => {
      ring.classList.remove("viewing", "hovering");
      label.textContent = "";
    });
  });
})();

/* ============ magnetic buttons ============ */
(() => {
  if (!fine || reduced) return;
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });
})();

/* ============ neural network hero canvas ============ */
(() => {
  const canvas = document.getElementById("neuralCanvas");
  const ctx = canvas.getContext("2d");
  let W, H, nodes = [], mouse = { x: -9999, y: -9999 };
  const N = () => Math.min(110, Math.floor((W * H) / 16000));

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    nodes = Array.from({ length: N() }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: 1 + Math.random() * 1.8,
    }));
  }
  resize();
  addEventListener("resize", resize);
  canvas.parentElement.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener("mouseleave", () => {
    mouse.x = mouse.y = -9999;
  });

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const n of nodes) {
      // gentle pull toward cursor
      const dxm = mouse.x - n.x, dym = mouse.y - n.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < 220 && dm > 1) {
        n.vx += (dxm / dm) * 0.012;
        n.vy += (dym / dm) * 0.012;
      }
      n.vx = Math.max(-0.7, Math.min(0.7, n.vx));
      n.vy = Math.max(-0.7, Math.min(0.7, n.vy));
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(138, 125, 255, ${0.16 * (1 - d / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      const n = nodes[i];
      const nearMouse = Math.hypot(mouse.x - n.x, mouse.y - n.y) < 160;
      ctx.fillStyle = nearMouse ? "rgba(199, 242, 76, 0.9)" : "rgba(236, 234, 244, 0.5)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduced) requestAnimationFrame(frame);
  }
  frame();
})();

/* ============ typewriter ============ */
(() => {
  const el = document.getElementById("typewriter");
  const phrases = [
    "Machine Learning Engineer",
    "I fine-tune Transformers",
    "I build RAG pipelines",
    "I ship MLOps, not notebooks",
    "200+ DSA problems deep",
  ];
  let pi = 0, ci = 0, deleting = false;
  function type() {
    const word = phrases[pi];
    el.textContent = word.slice(0, ci);
    if (!deleting && ci < word.length) { ci++; setTimeout(type, 55); }
    else if (!deleting) { deleting = true; setTimeout(type, 1700); }
    else if (ci > 0) { ci--; setTimeout(type, 28); }
    else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 350); }
  }
  type();
})();

/* ============ scroll progress + nav ============ */
(() => {
  const bar = document.getElementById("scrollProgress");
  const nav = document.getElementById("nav");
  let lastY = 0;
  addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (scrollY / max) * 100 + "%";
    nav.classList.toggle("scrolled", scrollY > 40);
    nav.classList.toggle("hidden", scrollY > 300 && scrollY > lastY);
    lastY = scrollY;
  }, { passive: true });
})();

/* ============ reveal on scroll ============ */
(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll(".reveal-up, .title-mask").forEach((el) => io.observe(el));
})();

/* ============ animated counters ============ */
(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = +el.dataset.count;
      const t0 = performance.now();
      const dur = 1400;
      (function step(t) {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => io.observe(el));
})();

/* ============ GSAP: horizontal project scroll + marquee ============ */
(() => {
  if (typeof gsap === "undefined" || reduced) return;
  gsap.registerPlugin(ScrollTrigger);

  const track = document.getElementById("hscrollTrack");
  const wrap = document.getElementById("hscrollWrap");
  const dist = () => track.scrollWidth - innerWidth;

  if (dist() > 80) {
    gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: () => "+=" + dist(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  // marquee scrubs with scroll velocity
  const marquee = document.getElementById("marqueeTrack");
  let mq = 0, vel = 0;
  ScrollTrigger.create({
    onUpdate: (self) => { vel = self.getVelocity() / 300; },
  });
  gsap.ticker.add(() => {
    mq -= 0.6 + Math.min(14, Math.abs(vel));
    vel *= 0.92;
    const half = marquee.scrollWidth / 2;
    if (-mq >= half) mq += half;
    marquee.style.transform = `translateX(${mq}px)`;
  });
})();

/* ============ 3D tilt cards ============ */
(() => {
  if (!fine || reduced) return;
  document.querySelectorAll(".tilt, .project-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform =
        `perspective(900px) rotateY(${(px - 0.5) * 7}deg) rotateX(${(0.5 - py) * 7}deg)`;
      card.style.setProperty("--mx", px * 100 + "%");
      card.style.setProperty("--my", py * 100 + "%");
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });
})();

/* ============ swipe widget (HomLuv homage) ============ */
(() => {
  const card = document.getElementById("swipeCard");
  const result = document.getElementById("swipeResult");
  const like = document.getElementById("swipeLike");
  const nope = document.getElementById("swipeNope");
  const fling = (dir, msg) => {
    card.classList.add(dir === 1 ? "flung-right" : "flung-left");
    setTimeout(() => { result.textContent = msg; }, 350);
  };
  like.addEventListener("click", () =>
    fling(1, "♥ style profile updated → match found: work4paras@gmail.com"));
  nope.addEventListener("click", () =>
    fling(-1, "noted! retraining on your feedback… try scrolling again 😄"));
})();

/* ============ konami easter egg ============ */
(() => {
  const code = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let i = 0;
  addEventListener("keydown", (e) => {
    i = e.key === code[i] ? i + 1 : (e.key === code[0] ? 1 : 0);
    if (i === code.length) {
      i = 0;
      document.body.classList.toggle("party");
    }
  });
})();

document.getElementById("year").textContent = new Date().getFullYear();
