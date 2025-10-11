import { NavLink } from "react-router-dom";
import { baseBtnStyle, activeBtnStyle } from "./navStyles";

const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/darthVader", label: "PlayGame!" },
];

export default function NavBar() {
    return (
        <nav
            style={{
                padding: "12px",
                textAlign: "center",
                position: "sticky",
                top: 0,
                zIndex: 1000,
                background: "transparent",
                backdropFilter: "none",
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
        </nav>
    );
}
