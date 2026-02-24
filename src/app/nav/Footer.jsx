import React from "react";
import "./footer.css";

const SocialIcon = ({ kind }) => {
    switch (kind) {
        case "github":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="social-icon">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.2-3.37-1.2-.46-1.19-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .08 1.53 1.05 1.53 1.05.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.97c.85 0 1.72.12 2.53.36 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.95-2.33 4.81-4.56 5.07.36.32.67.94.67 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
                </svg>
            );
        case "linkedin":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="social-icon">
                    <path fill="currentColor" d="M6.94 8.5a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM5.5 9.75h2.9V19H5.5V9.75Zm4.57 0h2.78v1.26h.04c.39-.73 1.34-1.5 2.75-1.5 2.95 0 3.5 1.98 3.5 4.56V19h-2.9v-4.2c0-1-.02-2.28-1.36-2.28-1.36 0-1.57 1.09-1.57 2.2V19h-2.9V9.75Z" />
                </svg>
            );
        case "youtube":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="social-icon">
                    <path fill="currentColor" d="M21.8 8.2a2.8 2.8 0 0 0-1.97-1.99C18.08 5.75 12 5.75 12 5.75s-6.08 0-7.83.46A2.8 2.8 0 0 0 2.2 8.2 29.2 29.2 0 0 0 1.75 12c0 1.3.15 2.6.45 3.8a2.8 2.8 0 0 0 1.97 1.99c1.75.46 7.83.46 7.83.46s6.08 0 7.83-.46a2.8 2.8 0 0 0 1.97-1.99c.3-1.2.45-2.5.45-3.8 0-1.3-.15-2.6-.45-3.8ZM10 14.4V9.6L14.2 12 10 14.4Z" />
                </svg>
            );
        case "facebook":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="social-icon">
                    <path fill="currentColor" d="M13.5 21v-7h2.3l.35-2.75H13.5v-1.76c0-.8.21-1.35 1.35-1.35h1.44V5.7A18.3 18.3 0 0 0 14.2 5c-2.08 0-3.5 1.3-3.5 3.68v2.57H8.35V14h2.35v7h2.8Z" />
                </svg>
            );
        case "email":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="social-icon">
                    <path fill="currentColor" d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Zm1.8.5L12 12.1 19.2 7H4.8Zm14.7 10.5V8.3L12.4 13a.7.7 0 0 1-.8 0L4.5 8.3v9.2h15Z" />
                </svg>
            );
        case "instagram":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="social-icon">
                    <path fill="currentColor" d="M7.2 3h9.6A4.2 4.2 0 0 1 21 7.2v9.6a4.2 4.2 0 0 1-4.2 4.2H7.2A4.2 4.2 0 0 1 3 16.8V7.2A4.2 4.2 0 0 1 7.2 3Zm-.2 4.2v9.6c0 .11.09.2.2.2h9.6c.11 0 .2-.09.2-.2V7.2a.2.2 0 0 0-.2-.2H7.2a.2.2 0 0 0-.2.2Zm5 2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Zm0 1.9a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Zm4.2-2.5a.95.95 0 1 1 0 1.9.95.95 0 0 1 0-1.9Z" />
                </svg>
            );
        default:
            return null;
    }
};

const Footer = ({ profile }) => {
    return (
        <footer className="footer-container">
            <div className="footer">
                © {new Date().getFullYear()} {profile.name} — Senior Software Engineer
            </div>
            <div className="social-links">
                <a
                    href={profile.links.github}
                    className="social-button github"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub profile (opens in a new tab)"
                >
                    <SocialIcon kind="github" />
                </a>
                <a
                    href={profile.links.linkedin}
                    className="social-button linkedin"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile (opens in a new tab)"
                >
                    <SocialIcon kind="linkedin" />
                </a>
                {profile.links.youtube ? (
                    <a
                        href={profile.links.youtube}
                        className="social-button youtube"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube channel (opens in a new tab)"
                    >
                        <SocialIcon kind="youtube" />
                    </a>
                ) : null}
                {profile.links.facebook ? (
                    <a
                        href={profile.links.facebook}
                        className="social-button facebook"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook profile (opens in a new tab)"
                    >
                        <SocialIcon kind="facebook" />
                    </a>
                ) : null}
                <a
                    href={`mailto:${profile.links.email}`}
                    className="social-button email"
                    aria-label={`Email ${profile.links.email}`}
                >
                    <SocialIcon kind="email" />
                </a>
                {profile.links.instagram ? (
                    <a
                        href={profile.links.instagram}
                        className="social-button instagram"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram profile (opens in a new tab)"
                    >
                        <SocialIcon kind="instagram" />
                    </a>
                ) : null}
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
