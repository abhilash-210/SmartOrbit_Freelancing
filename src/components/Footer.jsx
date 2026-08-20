import React from 'react';
import { Code, Camera, Briefcase, MessageCircle, Mail, Phone } from 'lucide-react';
import { socialLinks } from '../data/socialLinks';
import logoImage from '../assets/logo.jpg';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">

          <div className="footer-brand">
            <img src={logoImage} alt="SmartOrbit" className="footer-logo" />
            <p className="footer-tagline">Creative Digital Solutions for Modern Businesses. Affordable, professional, and built to grow.</p>

            <div className="footer-socials">
              {socialLinks.whatsapp && <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>}
              {socialLinks.email && <a href={socialLinks.email} aria-label="Email"><Mail size={18} /></a>}
              {socialLinks.phone && <a href={socialLinks.phone} aria-label="Phone"><Phone size={18} /></a>}
              {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Code size={18} /></a>}
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Camera size={18} /></a>}
              {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Briefcase size={18} /></a>}
            </div>
          </div>

          <div className="footer-links-group">
            <h3>Navigation</h3>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h3>Services</h3>
            <ul>
              <li><a href="#services">Brand Design</a></li>
              <li><a href="#services">Web Design</a></li>
              <li><a href="#services">Content Creation</a></li>
              <li><a href="#services">Data Entry</a></li>
            </ul>
          </div>

          <div className="footer-contact-group">
            <h3>Contact Us</h3>
            <p><a href={socialLinks.phone}>+91 8019677679</a></p>
            <p><a href={socialLinks.email}>freelancingxaitech@gmail.com</a></p>
          </div>

        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SmartOrbit Freelancers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
