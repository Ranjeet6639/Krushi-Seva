import { useEffect } from "react";
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

  return (
    <div className="gt-wrapper notranslate" translate="no">
      <span className="gt-icon" aria-hidden="true">🌐</span>
      <div id="google_translate_element" />
    </div>
  );
}

export default GoogleTranslate;