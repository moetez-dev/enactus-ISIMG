/* ═══════════════════════════════════════════════════════════════
   toast.js  —  Enactus ISIMG
   Toast notification system. Exports: window.Toast
   ═══════════════════════════════════════════════════════════════ */

"use strict";

(function () {

  /* Inject styles once */
  if (!document.getElementById("_toast-style")) {
    const s = document.createElement("style");
    s.id = "_toast-style";
    s.textContent = `
      #_toast-container {
        position: fixed; bottom: 1.5rem; right: 1.5rem;
        z-index: 99999; display: flex; flex-direction: column;
        gap: 0.5rem; pointer-events: none;
      }
      ._toast {
        display: flex; align-items: center; gap: 0.75rem;
        padding: 0.875rem 1.25rem; border-radius: 1rem;
        font-family: 'Source Sans 3', 'Segoe UI', sans-serif;
        font-size: 0.82rem; font-weight: 700; max-width: 360px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        pointer-events: auto; cursor: pointer;
        animation: _toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
      }
      ._toast.success { background:#111; color:#22c55e; border:1px solid rgba(34,197,94,0.25); }
      ._toast.error   { background:#111; color:#ef4444; border:1px solid rgba(239,68,68,0.25); }
      ._toast.warning { background:#111; color:#FFC222; border:1px solid rgba(255,194,34,0.25); }
      ._toast.info    { background:#111; color:#3b82f6; border:1px solid rgba(59,130,246,0.25); }
      ._toast._out    { animation: _toastOut 0.3s ease-in both; }
      @keyframes _toastIn  { from{opacity:0;transform:translateX(100%) scale(0.9)} to{opacity:1;transform:none} }
      @keyframes _toastOut { from{opacity:1;transform:none} to{opacity:0;transform:translateX(30px) scale(0.95)} }
    `;
    document.head.appendChild(s);
  }

  function getContainer() {
    let c = document.getElementById("_toast-container");
    if (!c) {
      c = document.createElement("div");
      c.id = "_toast-container";
      document.body.appendChild(c);
    }
    return c;
  }

  const ICONS = { success: "✓", error: "✕", warning: "!", info: "i" };

  function show(type, message, duration) {
    duration = duration || 4000;
    const container = getContainer();
    const toast = document.createElement("div");
    toast.className = "_toast " + type;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "polite");

    const icon = document.createElement("span");
    icon.textContent = ICONS[type] || "i";
    icon.style.cssText = "font-size:1rem;flex-shrink:0;font-weight:900;";

    const text = document.createElement("span");
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    const dismiss = function () {
      if (toast._dismissed) return;
      toast._dismissed = true;
      toast.classList.add("_out");
      toast.addEventListener("animationend", function () { toast.remove(); }, { once: true });
    };

    toast.addEventListener("click", dismiss);
    setTimeout(dismiss, duration);
  }

  window.Toast = {
    success: function (msg, dur) { show("success", msg, dur); },
    error:   function (msg, dur) { show("error",   msg, dur); },
    warning: function (msg, dur) { show("warning", msg, dur); },
    info:    function (msg, dur) { show("info",    msg, dur); },
  };

})();