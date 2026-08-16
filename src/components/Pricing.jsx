import React from 'react';
import { services } from '../data/services';
import { socialLinks } from '../data/socialLinks';

const Pricing = () => {
  return (
    <section className="pricing-section">
      <div className="container">
        <div className="section-header animate-fade-in">
          <h2 className="section-title">Starting Prices</h2>
          <p className="section-subtitle">Affordable digital services. No hidden fees.</p>
        </div>
        
        <div className="pricing-grid">
          {services.map(service => (
            <div key={service.id} className="pricing-card glass-card">
              <h3 className="pricing-title">{service.title}</h3>
              <div className="pricing-amount">
                <span className="pricing-label">Starting from</span>
                <span className="pricing-value gradient-text">{service.startingPrice}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pricing-disclaimer glass-card">
          <p><strong>Note:</strong> Prices shown are starting prices. Final pricing depends on project requirements, complexity and delivery requirements.</p>
          <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4">
            Get a Custom Quote
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
