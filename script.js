/* ===========================
   K'Alial Studio — Carpetas
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  initForm();
  initFolderTilt();
});

/* ---------- Pequeño movimiento de las fotos al mover el mouse ---------- */
function initFolderTilt() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduceMotion || !hasMouse) return;

  const pieces = document.querySelectorAll(".snap, .blueprint, .clip");
  let ticking = false;

  window.addEventListener("mousemove", (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 a 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      pieces.forEach((el, i) => {
        const depth = 3 + (i % 3) * 2;
        el.style.translate = `${(-x * depth).toFixed(1)}px ${(-y * depth).toFixed(1)}px`;
      });
      ticking = false;
    });
  });
}

/* ---------- Formulario "Avisarme" ---------- */
function initForm() {
  const form = document.getElementById("notifyForm");
  const input = document.getElementById("email");
  const msg = document.getElementById("notifyMsg");
  const btn = form?.querySelector(".notify__btn");
  if (!form || !input || !msg || !btn) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const setMessage = (text, isError = false) => {
    msg.textContent = text;
    msg.classList.toggle("is-error", isError);
    form.classList.toggle("is-error", isError);
  };

  input.addEventListener("input", () => {
    if (form.classList.contains("is-error")) setMessage("");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!emailRegex.test(email)) {
      setMessage("Por favor escribe un correo válido.", true);
      input.focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando…";

    try {
      await sendEmail(email);
      setMessage("¡Gracias! Te enviaremos tu invitación muy pronto.");
      form.reset();
      btn.textContent = "¡Listo!";
      setTimeout(() => {
        btn.textContent = "Avisarme";
        btn.disabled = false;
      }, 3000);
    } catch (err) {
      console.error(err);
      setMessage("Algo salió mal. Inténtalo de nuevo en un momento.", true);
      btn.textContent = "Avisarme";
      btn.disabled = false;
    }
  });
}

/*
  Conecta aquí tu servicio de correos (Formspree, Mailchimp, Brevo, tu backend…).
  Ejemplo con Formspree: crea un formulario en formspree.io y pega tu URL abajo.
*/
const FORM_ENDPOINT = ""; // ej: "https://formspree.io/f/xxxxxxx"

async function sendEmail(email) {
  if (!FORM_ENDPOINT) {
    // Modo demo: simula el envío
    return new Promise((resolve) => setTimeout(resolve, 900));
  }

  const res = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}