import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { baseBtnStyle, activeBtnStyle } from "./navStyles";

const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/ask-me", label: "Ask Me" },
    { to: "/darthVader", label: "PlayGame!" },
];

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [compactMode, setCompactMode] = useState(false); // 👈 becomes true on PlayGame or scroll
    const navRef = useRef(null);
    const location = useLocation();

    // ✅ Detect outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✅ Resize handler
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ✅ Scroll + route detection to shrink or switch
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY > 300 || location.pathname === "/darthVader") {
                // 👈 when scrolled down or on PlayGame page
                setCompactMode(true);
            } else {
                setCompactMode(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // check immediately
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]);

    return (
        <nav
            ref={navRef}
            style={{
                position: "fixed", // 👈 stays locked at top
                top: 0,
                left: 0,
                width: "100%",
                zIndex: 1000,
                background: compactMode
                    ? "rgba(0,0,0,0.7)" // darker + smaller on scroll or PlayGame
                    : "rgba(0,0,0,0.3)",
                padding: compactMode ? "6px 10px" : "12px 10px",
                transition: "all 0.3s ease-in-out",
                boxShadow: compactMode ? "0 2px 6px rgba(0,0,0,0.3)" : "none",
            }}
        >
            {/* Header bar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",   // ⬅ centers the group
                    alignItems: "center",
                    gap: "12px",                 // ⬅ spacing between logo and burger
                    width: "100%",               // ensures it’s centered relative to nav width
                }}
            >
                {/* Burger button (only in compact or mobile mode) */}
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
                            cursor: "pointer",
                            position: "relative",
                            ...baseBtnStyle
                        }}
                    >
                        <span
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                width: 22,
                                height: 3,
                                background: "#fff",
                                borderRadius: 2,
                                transformOrigin: "center",
                                transition: "transform 0.25s ease, opacity 0.2s ease",
                                transform: isOpen
                                    ? "translate(-50%, -50%) rotate(45deg)"
                                    : "translate(-50%, calc(-50% - 7px))",
                            }}
                        />
                        <span
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                width: 22,
                                height: 3,
                                background: "#fff",
                                borderRadius: 2,
                                opacity: isOpen ? 0 : 1,
                                transform: "translate(-50%, -50%)",
                                transition: "opacity 0.2s ease",
                            }}
                        />
                        <span
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                width: 22,
                                height: 3,
                                background: "#fff",
                                borderRadius: 2,
                                transformOrigin: "center",
                                transition: "transform 0.25s ease",
                                transform: isOpen
                                    ? "translate(-50%, -50%) rotate(-45deg)"
                                    : "translate(-50%, calc(-50% + 7px))",
                            }}
                        />
                    </button>
                )}
            </div>

            {/* Links */}
            {(!isMobile && !compactMode) || isOpen ? (
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
                            style={({ isActive }) => ({
                                ...baseBtnStyle,
                                ...(isActive ? activeBtnStyle : null),
                            })}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            ) : null}
        </nav>
    );
}
