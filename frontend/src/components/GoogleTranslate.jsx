import { useEffect, useRef, useState } from "react";
import "../styles/googleTranslate.css";

/**
 * Global Google Translate widget.
 * Mounted ONCE in App.jsx, so it shows on every page (public, farmer, trader).
 * Languages are limited to English, Marathi and Hindi.
 */
const LANGUAGES = "en,mr,hi";

// Google Translate wraps text nodes in <font> tags. React then tries to remove
// the original nodes and crashes with "removeChild" errors. These patches make
// those two DOM calls fail-safe. Applied once, module-level.
if (typeof Node === "function" && !window.__gtReactPatched) {
  window.__gtReactPatched = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

function GoogleTranslate() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const openedAt = useRef(0);

  // Load Google Translate once
  useEffect(() => {
    // Called by Google's script once it has loaded
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      const mount = document.getElementById("google_translate_element");
      if (!mount || mount.childElementCount > 0) return; // avoid duplicates (StrictMode)

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES,
          layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Load the script only once
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      window.googleTranslateElementInit();
    }
  }, []);

  // Close on outside click/tap, on scroll, on Escape, and after choosing a language
  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);

    const onPointerDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) close();
    };
    const onScroll = () => {
      // ignore tiny scroll jitters right after opening (mobile address bar)
      if (Date.now() - openedAt.current > 400) close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    const onChange = () => setTimeout(close, 150); // language picked

    const wrapper = wrapperRef.current;
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("keydown", onKey);
    wrapper?.addEventListener("change", onChange);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKey);
      wrapper?.removeEventListener("change", onChange);
    };
  }, [open]);

  const toggle = () => {
    openedAt.current = Date.now();
    setOpen((o) => !o);
  };

  return (
    <div
      ref={wrapperRef}
      className={`gt-wrapper notranslate ${open ? "gt-open" : "gt-closed"}`}
      translate="no"
    >
      <button
        type="button"
        className="gt-toggle"
        onClick={toggle}
        aria-label="Change language"
        aria-expanded={open}
      >
        🌐
      </button>
      <div className="gt-select-area">
        <div id="google_translate_element" />
      </div>
    </div>
  );
}

export default GoogleTranslate;