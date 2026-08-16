import React from 'react';
import { ArrowRight, PlayCircle, Monitor, Palette, Video, Database } from 'lucide-react';
import { socialLinks } from '../data/socialLinks';
import logoImage from '../assets/logo.jpg';

const Hero = () => {
  return (
    <section id="home" className="hero-section">
      <div className="container hero-container">
        <div className="hero-content animate-fade-in">
          <h1 className="hero-title">
            Smart Digital Solutions. <br/>
            <span className="gradient-text">Built for Your Business.</span>
          </h1>
          <p className="hero-subtitle">
            We help businesses build their digital presence through creative design, modern websites, engaging content & reliable digital support — all at freelancer-friendly prices.
          </p>

          <div className="hero-cta-group">
            <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Get Started <ArrowRight size={18} />
            </a>
            <a href="#projects" className="btn btn-secondary">
              View Our Work <PlayCircle size={18} />
            </a>
          </div>
        </div>

        <div className="hero-visual">
          {/* Floating service cards around the logo */}
          <div className="abstract-shape shape-1 glass-card">
            <div className="shape-icon"><Monitor color="#00b4d8" size={28} /></div>
            <div className="shape-text">Web Design</div>
          </div>
          <div className="abstract-shape shape-2 glass-card">
            <div className="shape-icon"><Palette color="#90e0ef" size={28} /></div>
            <div className="shape-text">Brand Design</div>
          </div>
          <div className="abstract-shape shape-3 glass-card">
            <div className="shape-icon"><Video color="#00b4d8" size={28} /></div>
            <div className="shape-text">Content</div>
          </div>
          <div className="hero-gradient-blob"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
