import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { baseBtnStyle, activeBtnStyle } from "./navStyles";

const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/darthVader", label: "PlayGame!" },
];

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navRef = useRef(null);

    // ✅ Detect clicks outside to close
    useEffect(() => {
        function handleClickOutside(e) {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✅ Listen for window resize to toggle mobile/desktop
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <nav
            ref={navRef}
            style={{
                padding: "12px",
                position: "sticky",
                top: 0,
                zIndex: 1000,
                background: "rgba(0, 0, 0, 0.3)",
            }}
        >
            {/* ===============================
          📱 Mobile View — Burger Menu
         =============================== */}
            {isMobile ? (
                <>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",   // ⬅ centers the group
                            alignItems: "center",
                            gap: "12px",                 // ⬅ spacing between logo and burger
                            width: "100%",               // ensures it’s centered relative to nav width
                        }}
                    >

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
                            }}
                        >
                            {/* Burger bars */}
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
                    </div>

                    {isOpen && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                marginTop: "10px",
                                transition: "all 0.3s ease",
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
                                        display: "block",
                                        margin: "6px 0",
                                    })}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* ===============================
                    💻 Desktop View — Horizontal Tabs
                   =============================== */
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "24px",
                    }}
                >
                    {links.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={({ isActive }) => ({
                                ...baseBtnStyle,
                                ...(isActive ? activeBtnStyle : null),
                            })}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </nav>
    );
}
