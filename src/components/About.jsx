import React from 'react';
import { Palette, Monitor, Video, Database } from 'lucide-react';
import logoImage from '../assets/logo.jpg';
import { socialLinks } from '../data/socialLinks';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-grid">
          <div className="about-content animate-fade-in">
            <h2 className="section-title" style={{ textAlign: 'left' }}>About SmartOrbit Freelancers</h2>
            <p className="about-text">
              SmartOrbit Freelancers is a digital services initiative focused on helping businesses, startups and individuals build a strong online presence through affordable creative and technology solutions. We combine design thinking with technical expertise to deliver results that matter.
            </p>

            <div className="about-features">
              <div className="about-feature">
                <span className="feature-dot"></span>
                <span><strong>Brand Design:</strong> Creating memorable visual identities.</span>
              </div>
              <div className="about-feature">
                <span className="feature-dot"></span>
                <span><strong>Web Design:</strong> Building responsive, fast, and modern websites.</span>
              </div>
              <div className="about-feature">
                <span className="feature-dot"></span>
                <span><strong>Content Creation:</strong> Engaging videos and promotional material.</span>
              </div>
              <div className="about-feature">
                <span className="feature-dot"></span>
                <span><strong>Data Entry & Digital Support:</strong> Accurate and organized data management.</span>
              </div>
            </div>
          </div>

          <div className="about-visual glass-card">
            <div className="about-visual-inner">
              <img src={logoImage} alt="SmartOrbit" style={{
                height: '140px',
                width: 'auto',
                objectFit: 'contain',
                margin: '0 auto 24px',
                filter: 'drop-shadow(0 0 24px rgba(0, 180, 216, 0.4))'
              }} />
              <h3 className="gradient-text" style={{ fontSize: '1.6rem' }}>Creative Digital Solutions<br/>for Modern Businesses</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
