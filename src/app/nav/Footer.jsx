import React from "react";
import { FaGithub, FaLinkedin, FaYoutube, FaFacebook, FaEnvelope, FaInstagram } from "react-icons/fa";
import "./footer.css";

const Footer = ({ profile }) => {
    return (
        <footer className="footer-container">
            <div className="footer">
                © {new Date().getFullYear()} {profile.name} — Senior Software Engineer
            </div>
            <div className="social-links">
                <a href={profile.links.github} className="social-button github" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile (opens in a new tab)">
                    <FaGithub className="social-icon" />
                </a>
                <a href={profile.links.linkedin} className="social-button linkedin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">
                    <FaLinkedin className="social-icon" />
                </a>
                {profile.links.youtube && (
                    <a href={profile.links.youtube} className="social-button youtube" target="_blank" rel="noopener noreferrer" aria-label="YouTube channel (opens in a new tab)">
                        <FaYoutube className="social-icon" />
                    </a>
                )}
                {profile.links.facebook && (
                    <a href={profile.links.facebook} className="social-button facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook profile (opens in a new tab)">
                        <FaFacebook className="social-icon" />
                    </a>
                )}
                <a href={`mailto:${profile.links.email}`} className="social-button email" aria-label={`Email ${profile.links.email}`}>
                    <FaEnvelope className="social-icon" />
                </a>
                {profile.links.instagram && (
                    <a href={profile.links.instagram} className="social-button instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram profile (opens in a new tab)">
                        <FaInstagram className="social-icon" />
                    </a>
                )}
            </div>
            <div className="buy-coffee-container">
                <a href="https://www.buymeacoffee.com/omerzahid" target="_blank" rel="noopener noreferrer" className="buy-coffee-btn">
                    <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me a Coffee" />
                </a>
            </div>
        </footer>
    );
};

export default Footer;