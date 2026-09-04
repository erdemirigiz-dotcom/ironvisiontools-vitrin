/* IronVision Tools vitrin — vanilla JS: timecode, imleç ışığı, 3D duvar paralaksı,
   scroll reveal, FormSubmit köprüsü. Kütüphane yok. */
"use strict";

/* ── WhatsApp kanalı — TEK AYAR NOKTASI ──────────────────────────────
   // DEMIR: numarayı buraya  → tırnak arasına ülke koduyla yaz, boşluksuz.
   //   örn. WA_NUMARA = "905XXXXXXXXX";   (link: https://wa.me/[WHATSAPP_NUMARASI])
   Bu tek satır doldurulunca hem genel WhatsApp butonu hem Aile Arşivi
   kartındaki "WhatsApp'tan sorun" butonu otomatik aktif olur.
   Boşken: genel buton gizli kalır, aile butonu görünür ama iletişim formuna düşer. */
const WA_NUMARA = "";
(() => {
  // Genel WhatsApp butonu (iletişim bölümü) — numara yoksa gizli kalır
  const b = document.getElementById("waBtn");
  if (b && WA_NUMARA) {
    b.href = "https://wa.me/" + WA_NUMARA + "?text=" + encodeURIComponent("Merhaba, siteden geliyorum — bir proje konuşmak istiyorum.");
    b.hidden = false;
  }
  // Aile Arşivi kartındaki birincil WhatsApp butonu — görünür kalır,
  // numara gelince wa.me linkine döner, boşken formu açar
  const fw = document.getElementById("famWaBtn");
  if (fw && WA_NUMARA) {
    fw.href = "https://wa.me/" + WA_NUMARA + "?text=" + encodeURIComponent("Merhaba, Aile Arşivi Sitesi için bir demo istiyorum.");
    fw.target = "_blank";
    fw.rel = "noopener";
  }
})();

/* ── ürün/kaynak etiketi: hangi karttan gelindiğini forma taşır ── */
(() => {
  const urunField = document.getElementById("urunField");
  document.querySelectorAll("[data-urun]").forEach((el) => {
    el.addEventListener("click", () => {
      if (urunField) urunField.value = el.getAttribute("data-urun");
    });
  });
})();

/* ── 24fps timecode (REC dili: canlı atölye kaydı hissi) ── */
(() => {
  const el = document.getElementById("tc");
  if (!el) return;
  const t0 = performance.now();
  const pad = (n) => String(n).padStart(2, "0");
  setInterval(() => {
    const s = (performance.now() - t0) / 1000;
    const f = Math.floor((s % 1) * 24);
    el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}:${pad(f)}`;
  }, 1000 / 24);
})();

/* ── imleç ışığı ── */
addEventListener("pointermove", (e) => {
  document.getElementById("spot").style.setProperty("--mx", e.clientX + "px");
  document.getElementById("spot").style.setProperty("--my", e.clientY + "px");
}, { passive: true });

/* ── 3D iş duvarı: fare/scroll paralaksı (ana duvar + vitrin serisi) ── */
document.querySelectorAll("#wall, #series").forEach((wall) => {
  const cards = wall.querySelectorAll(".card");
  wall.addEventListener("pointermove", (e) => {
    const r = wall.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5;
    cards.forEach((c) => {
      c.style.setProperty("--ry", (nx * 6).toFixed(2) + "deg");
      c.style.setProperty("--rx", (4 - ny * 6).toFixed(2) + "deg");
    });
  }, { passive: true });
  wall.addEventListener("pointerleave", () => {
    cards.forEach((c) => { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); });
  });
});

/* ── scroll reveal ── */
(() => {
  const targets = document.querySelectorAll(".card, .step, .svc, .tr-split > *, .tool, .sec-t, .sec-sub");
  targets.forEach((t) => t.classList.add("rv"));
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  targets.forEach((t) => io.observe(t));
})();

/* ── iletişim formu: FormSubmit köprüsü (backend'siz) ── */
document.getElementById("cform")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const btn = f.querySelector("button");
  btn.disabled = true; btn.style.opacity = ".5";
  try {
    const data = Object.fromEntries(new FormData(f).entries());
    const r = await fetch("https://formsubmit.co/ajax/ironvisiontools@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        _subject: "IVT vitrin — " + (data.urun || "Genel") + " talebi: " + (data.name || ""),
        _template: "table",
        ...data,
      }),
    });
    if (!r.ok) throw new Error();
    document.getElementById("cdone").hidden = false;
    f.querySelectorAll("input,textarea").forEach((i) => (i.disabled = true));
  } catch {
    document.getElementById("cerr").hidden = false;
    btn.disabled = false; btn.style.opacity = "";
  }
});
