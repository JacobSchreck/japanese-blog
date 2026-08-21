(() => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const clock = document.querySelector("#local-time");
  if (clock) {
    clock.textContent = stamp;
    clock.setAttribute("datetime", stamp);
  }

  document.querySelectorAll('a.disabled').forEach((link) => {
    link.removeAttribute("href");
  });
})();
