import { useState } from "react";
import { NavLink } from "react-router-dom";
import { baseBtnStyle, activeBtnStyle } from "./navStyles";

const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/darthVader", label: "PlayGame!" },
];

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <nav
                style={{
                    padding: "12px",
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                    background: "rgba(0, 0, 0, 0.3)",
                }}
            >
                {/* Burger Button (Visible only on small screens) */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    {/* Burger button absolutely positioned on the right */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isOpen}
                        style={{
                            ...baseBtnStyle,
                            position: "relative",          // ⬅ must have
                            width: 36,
                            height: 36,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                        }}
                    >
                        {/* Top bar */}
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
                                    ? "translate(-50%, -50%) rotate(45deg)"   // X arm
                                    : "translate(-50%, calc(-50% - 7px))",    // stacked top
                            }}
                        />
                        {/* Middle bar */}
                        <span
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                width: 22,
                                height: 3,
                                background: "#fff",
                                borderRadius: 2,
                                transform: "translate(-50%, -50%)",
                                transformOrigin: "center",
                                transition: "opacity 0.2s ease",
                                opacity: isOpen ? 0 : 1,                    // hide in X state
                            }}
                        />
                        {/* Bottom bar */}
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
                                    ? "translate(-50%, -50%) rotate(-45deg)"  // X arm
                                    : "translate(-50%, calc(-50% + 7px))",    // stacked bottom
                            }}
                        />
                    </button>
                </div>


                {/* Nav Links */}
                <div
                    style={{
                        display: isOpen ? "flex" : "none",
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
                            onClick={() => setIsOpen(false)} // close on click
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
            </nav>
        </>
    );
}
