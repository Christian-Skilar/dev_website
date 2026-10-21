document.getElementById("year").textContent = new Date().getFullYear();

const clockEl = document.getElementById("clock");
const glyphsEl = document.getElementById("clock-glyphs");
const pad = (n) => String(n).padStart(2, "0");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const DIGITS = "0123456789";
const isScrambled = (ch) => DIGITS.includes(ch);

const SCRAMBLE_MS = 1000;
let rafId = null;

function scrambleTo(finalText) {
  clockEl.setAttribute("aria-label", finalText);

  if (reduceMotion) {
    glyphsEl.textContent = finalText;
    return;
  }

  if (rafId !== null) cancelAnimationFrame(rafId);

  const len = finalText.length;
  const lockAt = [...finalText].map((_, i) => (i / Math.max(len - 1, 1)) * SCRAMBLE_MS);
  let start = null;

  function frame(now) {
    if (start === null) start = now;
    const elapsed = now - start;
    let out = "";
    let settled = true;

    for (let i = 0; i < len; i++) {
      const ch = finalText[i];
      if (!isScrambled(ch) || elapsed >= lockAt[i]) {
        out += ch;
      } else {
        out += DIGITS[(Math.random() * DIGITS.length) | 0];
        settled = false;
      }
    }

    glyphsEl.textContent = out;
    rafId = settled ? null : requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);
}

function formatNow() {
  const d = new Date();
  const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return `${date} · ${time}`;
}

scrambleTo(formatNow());
setInterval(() => {
  const now = formatNow();
  clockEl.setAttribute("aria-label", now);
  glyphsEl.textContent = now;
}, 1000);

// Ruler scrollbar for desktop, inspired by getartcraft.com/apps. Touch devices keep the native scrollbar.
(() => {
  // ponytail: checked once at load; crossing the breakpoint needs a reload
  if (!matchMedia("(pointer: fine) and (hover: hover) and (min-width: 960px)").matches) return;

  const root = document.documentElement;
  const PAD = 24; // must match --ruler-pad in CSS
  root.dataset.ruler = "on";

  const digitCol = `<span class="ruler-col">${[..."0123456789"].map((d) => `<span>${d}</span>`).join("")}</span>`;
  let ticks = "";
  for (let p = 0; p <= 100; p += 2) {
    const major = p % 10 === 0;
    ticks += `<span class="ruler-tick${major ? " major" : ""}" style="--p:${p}">${major ? `<i>${p}</i>` : ""}</span>`;
  }

  const rail = document.createElement("div");
  rail.className = "ruler";
  rail.setAttribute("role", "scrollbar");
  rail.setAttribute("aria-orientation", "vertical");
  rail.setAttribute("aria-valuemin", "0");
  rail.setAttribute("aria-valuemax", "100");
  rail.setAttribute("aria-label", "Page position");
  rail.innerHTML = `${ticks}<div class="ruler-needle"><span class="ruler-readout"><span class="ruler-digits">${digitCol.repeat(3)}</span>%</span></div>`;
  document.body.append(rail);

  const needle = rail.querySelector(".ruler-needle");
  const cols = rail.querySelectorAll(".ruler-col");
  const maxScroll = () => Math.max(1, root.scrollHeight - innerHeight);

  function update() {
    const f = Math.min(1, Math.max(0, scrollY / maxScroll()));
    const pct = Math.round(f * 100);
    needle.style.setProperty("--p", f * 100);
    needle.classList.toggle("flip", f > 0.94);
    rail.setAttribute("aria-valuenow", pct);
    [...String(pct).padStart(3, "0")].forEach((d, i) => (cols[i].style.transform = `translateY(${-d}em)`));
  }

  const jump = (y, behavior) => {
    const f = Math.min(1, Math.max(0, (y - PAD) / (innerHeight - 2 * PAD)));
    scrollTo({ top: f * maxScroll(), behavior });
  };

  rail.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    rail.setPointerCapture(e.pointerId);
    jump(e.clientY, "smooth");
  });
  rail.addEventListener("pointermove", (e) => {
    if (rail.hasPointerCapture(e.pointerId) && e.buttons) jump(e.clientY, "instant");
  });

  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
})();
