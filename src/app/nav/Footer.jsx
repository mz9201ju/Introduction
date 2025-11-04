import React from "react";
import "./footer.css";

const Footer = ({ profile }) => {
    return (
        <footer className="footer-container">
            <div className="footer">
                © {new Date().getFullYear()} {profile.name} — Senior Software Engineer
            </div>
            <div className="social-links">
                {/* GitHub Icon */}
                <a
                    href={profile.links.github}
                    className="social-button github"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="fab fa-github"></i> {/* Font Awesome GitHub Icon */}
                </a>
                {/* LinkedIn Icon */}
                <a
                    href={profile.links.linkedin}
                    className="social-button linkedin"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="fab fa-linkedin-in"></i> {/* Font Awesome LinkedIn Icon */}
                </a>
                {/* YouTube Icon */}
                <a
                    href={profile.links.youtube || "#"}
                    className="social-button youtube"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="fab fa-youtube"></i> {/* Font Awesome YouTube Icon */}
                </a>
                {/* Facebook Icon */}
                <a
                    href={profile.links.facebook || "#"}
                    className="social-button facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="fab fa-facebook-f"></i> {/* Font Awesome Facebook Icon */}
                </a>
                {/* Email Link */}
                <a
                    href={`mailto:${profile.links.email}`}
                    className="social-button email"
                >
                    <i className="fas fa-envelope"></i> {/* Font Awesome Email Icon */}
                    {profile.links.email ? null : " (Email)"}
                </a>
            </div>
            <div className="buy-coffee-container">
                <a
                    href="https://www.buymeacoffee.com/omerzahid"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-coffee-btn"
                >
                    <img
                        src="https://cdn.buymeacoffee.com/buttons/default-orange.png"
                        alt="Buy Me a Coffee"
                    />
                </a>
            </div>
        </footer>
    );
};

export default Footer;
