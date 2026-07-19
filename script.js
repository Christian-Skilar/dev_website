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
  return `${date} — ${time}`;
}

scrambleTo(formatNow());
setInterval(() => {
  const now = formatNow();
  clockEl.setAttribute("aria-label", now);
  glyphsEl.textContent = now;
}, 1000);
