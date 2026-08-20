import React, { useState } from 'react';
import { Palette, Monitor, Video, Database, ArrowRight, X } from 'lucide-react';
import { services } from '../data/services';
import { socialLinks, getWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from '../data/socialLinks';

const iconMap = {
  Palette: <Palette size={32} />,
  Monitor: <Monitor size={32} />,
  Video: <Video size={32} />,
  Database: <Database size={32} />
};

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);


  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="section-header animate-fade-in">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Everything you need to build and grow your digital presence.</p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card glass-card">
              <div className="service-icon">
                {iconMap[service.icon]}
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.description}</p>
              
              <div className="service-price">
                <span className="price-label">Starting from</span>
                <span className="price-value">{service.startingPrice}</span>
              </div>
              
              <div className="service-actions">
                <button 
                  className="btn btn-secondary w-full"
                  onClick={() => setSelectedService(service)}
                >
                  View Details
                </button>
                <a 
                  href={getWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary w-full"
                >
                  Get Started
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedService(null)}>
              <X size={24} />
            </button>
            
            <div className="modal-header">
              <div className="service-icon large">
                {iconMap[selectedService.icon]}
              </div>
              <h3 className="modal-title">{selectedService.title}</h3>
              <p className="modal-subtitle">{selectedService.subtitle}</p>
            </div>
            
            <div className="modal-body">
              <div className="modal-section">
                <h4>What you get:</h4>
                <ul className="service-features-list">
                  {selectedService.features.map((feature, idx) => (
                    <li key={idx}>
                      <ArrowRight size={16} className="feature-icon" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="modal-price-box">
                <span className="modal-price-label">Starting Price</span>
                <span className="modal-price-value">{selectedService.startingPrice}</span>
              </div>
            </div>
            
            <div className="modal-footer">
              <a 
                href={getWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary w-full"
              >
                Discuss Your Project
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
