document.getElementById("year").textContent = new Date().getFullYear();

const clock = document.getElementById("clock");
const pad = (n) => String(n).padStart(2, "0");

function tick() {
  const d = new Date();
  const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  clock.textContent = `${date} — ${time}`;
}

tick();
setInterval(tick, 1000);
