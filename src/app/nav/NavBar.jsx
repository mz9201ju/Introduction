// @app/nav/NavBar.jsx
import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { baseBtnStyle, activeBtnStyle } from "./navStyles";

/*
  NavBar.jsx
  - Adds a globe button that toggles a custom language dropdown.
  - Keeps a hidden #google_translate_element so Google widget can initialize.
  - Language buttons try the Google combo first (no reload), fall back to a cookie+reload.
  - Accessibility: keyboard handlers + pointer events; avoids passive touch errors.
  - Lots of comments so you (or other devs) can follow the logic easily.
*/

const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "Projects" },
    { to: "/ask-me", label: "Ask Me" },
    /* { to: "/resume-generator", label: "Resume Generator" }, */
    { to: "/darthVader", label: "PlayGame!" },
];

export default function NavBar() {
    // UI state
    const [isOpen, setIsOpen] = useState(false); // mobile burger menu
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [compactMode, setCompactMode] = useState(false); // shrinks on scroll or on /darthVader
    const [showTranslate, setShowTranslate] = useState(false); // show/hide our dropdown panel
    const [isTranslating, setIsTranslating] = useState(false); // busy state while translate in progress

    // refs & routing
    const navRef = useRef(null);
    const gRef = useRef(null); // reference to hidden google element (for clarity)
    const location = useLocation();

    // ----------------------------
    // Outside click: close panels/menus
    // ----------------------------
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setIsOpen(false);
                setShowTranslate(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ----------------------------
    // Responsive: update isMobile on resize
    // ----------------------------
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ----------------------------
    // Compact mode: on scroll or PlayGame or Resume Generator Page
    // ----------------------------
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY > 300 
                || location.pathname === "/darthVader" 
                || location.pathname === "/resume-generator"
                || location.pathname === "/about"
                || location.pathname === "/ask-me"
            ) {
                setCompactMode(true);
            } else {
                setCompactMode(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll(); // initial
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]);

    // ----------------------------
    // Google Translate script init (run once)
    // - Keeps guards to avoid duplicate injection in SPA/HMR.
    // - Restricts languages to ar,en,zh-CN,fr,hi
    // ----------------------------
    useEffect(() => {
        if (typeof window === "undefined") return;

        // If script already injected, just try initialize once if google available
        if (window.__google_translate_script_injected) {
            if (window.google && window.google.translate && !window.__google_translate_initialized) {
                setTimeout(() => {
                    try {
                        window.googleTranslateElementInit && window.googleTranslateElementInit();
                    } catch { }
                }, 80);
            }
            return;
        }

        // mark injected (prevents duplicate injection across HMR)
        window.__google_translate_script_injected = true;
        window.__google_translate_initialized = false;

        // callback Google will call (cb param in script URL)
        window.googleTranslateElementInit = function () {
            if (window.__google_translate_initialized) return; // only once
            window.__google_translate_initialized = true;

            let attempts = 0;
            const MAX_ATTEMPTS = 8;
            const TRY_DELAY_MS = 200;

            const tryInit = () => {
                const el = document.getElementById("google_translate_element");
                attempts++;

                // If our hidden target isn't present yet, retry a few times (should be present now)
                if (!el) {
                    if (attempts <= MAX_ATTEMPTS) {
                        setTimeout(tryInit, TRY_DELAY_MS);
                        return;
                    } else {
                        console.warn("Google Translate: target element '#google_translate_element' not found after retries.");
                        return;
                    }
                }

                try {
                    new window.google.translate.TranslateElement(
                        {
                            pageLanguage: "en",
                            includedLanguages: "ar,en,zh-CN,fr,hi", // limited list
                            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                            autoDisplay: false,
                        },
                        "google_translate_element"
                    );
                } catch (err) {
                    console.warn("Google Translate init error:", err);
                }
            };

            tryInit();
        };

        // Inject supportive CSS once (hides native Google UI but leaves select accessible)
        if (!document.querySelector('style[data-google-trans-style="true"]')) {
            const css = `
        /* hide Google banner/icon */
        .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }

        /* keep select present but visually hidden (so JS can access it) */
        #google_translate_element { position: absolute !important; left: -9999px !important; top: -9999px !important; width: 1px !important; height: 1px !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; }

        /* hide any visible Google dropdown that might leak into UI */
        iframe.goog-te-menu-frame, .goog-te-menu-value { display: none !important; }

        /* our custom translate panel */
        .nav-translate-panel { position: absolute; right: 10px; top: 56px; z-index: 1200; background: rgba(0,0,0,0.65); padding: 8px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.5); }
        .nav-translate-panel .lang-btn { margin: 6px 6px 0 0; padding: 6px 10px; border-radius: 8px; cursor: none; font-weight:700; border:1px solid rgba(90,140,255,0.45); background: transparent; color: #e0e6ff; }
      `;
            const s = document.createElement("style");
            s.setAttribute("data-google-trans-style", "true");
            s.innerHTML = css;
            document.head.appendChild(s);
        }

        // Add the Google script (only if it isn't already present)
        if (!document.querySelector('script[src*="translate_a/element.js"]')) {
            const script = document.createElement("script");
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            script.defer = true;
            script.onerror = () => console.warn("Google Translate script failed to load.");
            document.body.appendChild(script);
        } else {
            // if script already there, try to init after a short delay
            setTimeout(() => {
                try {
                    window.googleTranslateElementInit && window.googleTranslateElementInit();
                } catch { }
            }, 120);
        }

        // deliberately no teardown: leaving the script/style is fine for SPA navigation
    }, []);

    // ----------------------------
    // Robust setLanguage implementation
    // - Tries to set GTranslate combo (fast, no reload)
    // - Tries iframe click (best-effort; may be blocked by cross-origin)
    // - Falls back to cookie + reload (reliable)
    // ----------------------------
    const setLanguage = (langCode) => {
        // debounce if already translating
        if (isTranslating) return;
        setIsTranslating(true);

        // 1) Try using the google select combo repeatedly while widget loads
        const tryComboWithRetries = (attempt = 0) =>
            new Promise((resolve) => {
                const combo = document.querySelector("#google_translate_element .goog-te-combo");
                if (combo) {
                    try {
                        combo.value = langCode;
                        combo.dispatchEvent(new Event("change", { bubbles: true }));
                        // Give Google a moment to apply changes
                        setTimeout(() => resolve(true), 250);
                        return;
                    } catch (err) {
                        // fall through to retry
                    }
                }
                if (attempt < 12) {
                    setTimeout(() => resolve(tryComboWithRetries(attempt + 1)), 200);
                } else {
                    resolve(false);
                }
            });

        // 2) Try clicking language link inside Google iframe (best-effort)
        const tryIframeClick = () => {
            try {
                const menuIframe = document.querySelector("iframe.goog-te-menu-frame");
                if (menuIframe) {
                    const iframeDoc = menuIframe.contentDocument || menuIframe.contentWindow?.document;
                    if (iframeDoc) {
                        const anchors = Array.from(iframeDoc.querySelectorAll("a"));
                        const match = anchors.find((a) => {
                            const href = a.getAttribute("href") || "";
                            const text = (a.textContent || "").toLowerCase();
                            return href.includes(langCode) || text.includes(langCode.toLowerCase()) || (langCode === "zh-CN" && (text.includes("chinese") || text.includes("中文")));
                        });
                        if (match) {
                            match.click();
                            return true;
                        }
                    }
                }
            } catch (err) {
                // cross-origin access will throw; silently ignore and fallback
            }
            return false;
        };

        (async () => {
            // try combo
            const comboOk = await tryComboWithRetries();
            if (comboOk) {
                setShowTranslate(false);
                setIsTranslating(false);
                return;
            }

            // try iframe click
            const iframeTried = tryIframeClick();
            if (iframeTried) {
                setShowTranslate(false);
                setIsTranslating(false);
                return;
            }

            // final fallback: set googtrans cookie and reload (reliable)
            try {
                const source = "en"; // change this if your default site language isn't English
                const cookieVal = `/${source}/${langCode}`;
                // set cookie for current domain
                document.cookie = `googtrans=${cookieVal};path=/;max-age=31536000`;
                // also attempt to set for root domain (best-effort)
                try {
                    const hostParts = window.location.hostname.split(".");
                    if (hostParts.length > 1) {
                        const root = `.${hostParts.slice(-2).join(".")}`;
                        document.cookie = `googtrans=${cookieVal};path=/;domain=${root};max-age=31536000`;
                    }
                } catch (_) { }
            } catch (err) {
                console.warn("Failed to set googtrans cookie:", err);
            } finally {
                // reload so Google Translate picks up cookie and applies translation
                window.location.reload();
            }
        })();
    };

    // ----------------------------
    // Toggle panel helper
    // - Stops propagation so outside-click handler doesn't immediately close it
    // - Attempts to init the widget immediately if script is loaded but not initialized
    // ----------------------------
    const toggleTranslate = (e) => {
        e && e.stopPropagation();

        // If script loaded but init hasn't run, try to call init now
        if (window.google && window.google.translate && !window.__google_translate_initialized) {
            try {
                window.googleTranslateElementInit && window.googleTranslateElementInit();
            } catch { }
        }

        setShowTranslate((s) => !s);
    };

    // small merged style for translate globe/button to blend with your nav
    const translateBtnStyle = {
        ...baseBtnStyle,
        padding: "0",
        margin: "0 6px",
        minWidth: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    // ----------------------------
    // Render
    // ----------------------------
    return (
        <nav
            ref={navRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                zIndex: 1000,
                padding: "6px 10px",
                transition: "all 0.3s ease-in-out",
                marginTop: "27px",
            }}
        >
            {/* ---------------------------------------------------------------------
          IMPORTANT: Hidden google target (first child of <nav>)
          - Keeps the element in DOM on page load so googleTranslateElementInit
            can find it and initialize without retries / race conditions.
          - We visually hide it but leave it accessible to JS (select/combo).
         --------------------------------------------------------------------- */}
            <div
                id="google_translate_element"
                ref={gRef}
                aria-hidden="true"
                style={{
                    position: "absolute",
                    left: "-9999px",
                    top: "-9999px",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                    opacity: 0,
                    pointerEvents: "none",
                }}
            />

            {/* Header row (logo / burger / translate) */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", width: "100%", position: "relative" }}>
                {/* Mobile burger (only shown on mobile/compact) */}
                {(isMobile || compactMode) && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isOpen}
                        style={{
                            width: 36,
                            height: 36,
                            border: "none",
                            background: "transparent",
                            cursor: "none",
                            position: "relative",
                            ...baseBtnStyle,
                        }}
                    >
                        <span style={{ position: "absolute", left: "50%", top: "50%", width: 22, height: 3, background: "#fff", borderRadius: 2, transformOrigin: "center", transition: "transform 0.25s ease, opacity 0.2s ease", transform: isOpen ? "translate(-50%, -50%) rotate(45deg)" : "translate(-50%, calc(-50% - 7px))" }} />
                        <span style={{ position: "absolute", left: "50%", top: "50%", width: 22, height: 3, background: "#fff", borderRadius: 2, opacity: isOpen ? 0 : 1, transform: "translate(-50%, -50%)", transition: "opacity 0.2s ease" }} />
                        <span style={{ position: "absolute", left: "50%", top: "50%", width: 22, height: 3, background: "#fff", borderRadius: 2, transformOrigin: "center", transition: "transform 0.25s ease", transform: isOpen ? "translate(-50%, -50%) rotate(-45deg)" : "translate(-50%, calc(-50% + 7px))" }} />
                    </button>
                )}

                {/* ---------------------------
            TRANSLATE: Globe toggle + dropdown panel
            - Click globe to open panel (keyboard accessible)
            - The panel contains language buttons; each triggers setLanguage(...)
           --------------------------- */}
                <div style={{ position: "absolute", right: 12, top: 8, zIndex: 1500, pointerEvents: "auto" }}>
                    {/* Globe toggle button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // init widget if script already loaded but init hasn't run
                            if (window.google && window.google.translate && !window.__google_translate_initialized) {
                                try {
                                    window.googleTranslateElementInit && window.googleTranslateElementInit();
                                } catch { }
                            }
                            setShowTranslate((s) => !s);
                        }}
                        onPointerDown={(e) => {
                            // Prevent accidental gestures for touch devices
                            try {
                                if (e.pointerType === "touch") e.preventDefault();
                            } catch (_) { }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setShowTranslate((s) => !s);
                            }
                        }}
                        aria-haspopup="true"
                        aria-expanded={showTranslate}
                        aria-label="Open language options"
                        title="Languages"
                        style={{ ...translateBtnStyle, zIndex: 1501, pointerEvents: "auto", touchAction: "manipulation" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e0e6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20" />
                            <path d="M12 2a15 15 0 0 1 0 20" />
                            <path d="M12 2a15 15 0 0 0 0 20" />
                        </svg>
                    </button>

                    {/* Dropdown panel - visible when showTranslate is true */}
                    {showTranslate && (
                        <div
                            className="nav-translate-panel"
                            style={{
                                right: isMobile ? 8 : 12,
                                zIndex: 1600,
                                pointerEvents: "auto",
                                position: "absolute",
                                width: isMobile ? 200 : 260,
                            }}
                            onClick={(e) => e.stopPropagation()} // keep clicks inside from closing the panel
                        >
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {[
                                    ["ar", "العربية"],
                                    ["en", "English"],
                                    ["zh-CN", "中文"],
                                    ["fr", "Français"],
                                    ["hi", "हिन्दी"],
                                ].map(([code, label]) => (
                                    <button
                                        key={code}
                                        className="lang-btn"
                                        onPointerUp={(e) => {
                                            try {
                                                e.preventDefault();
                                            } catch (_) { }
                                            // setLanguage handles retries and fallback; show busy state
                                            setIsTranslating(true);
                                            setLanguage(code);
                                        }}
                                        onClick={() => {
                                            // fallback for browsers without pointer events
                                            setIsTranslating(true);
                                            setLanguage(code);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                setIsTranslating(true);
                                                setLanguage(code);
                                            }
                                        }}
                                        disabled={isTranslating}
                                        aria-busy={isTranslating}
                                        style={{
                                            opacity: isTranslating ? 0.6 : 1,
                                            pointerEvents: isTranslating ? "none" : "auto",
                                        }}
                                        title={`Translate to ${label}`}
                                    >
                                        {isTranslating ? "Translating…" : label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Links (desktop or expanded mobile) */}
            {((!isMobile && !compactMode) || isOpen) ? (
                <div
                    style={{
                        display: "flex",
                        flexDirection: isMobile || compactMode ? "column" : "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: isMobile || compactMode ? "10px" : "0",
                        gap: isMobile || compactMode ? "8px" : "24px",
                    }}
                >
                    {links.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsOpen(false)}
                            style={({ isActive }) => ({ ...baseBtnStyle, ...(isActive ? activeBtnStyle : null) })}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            ) : null}
        </nav>
    );
}
