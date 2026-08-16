import React from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { socialLinks } from '../data/socialLinks';

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div className="contact-info animate-fade-in" style={{ maxWidth: '600px', width: '100%' }}>
          <h2 className="section-title">Have a Project in Mind?</h2>
          <p className="contact-desc">Tell us what you need and let's build something that works for your business.</p>
          
          <div className="contact-methods" style={{ marginTop: '40px' }}>
            <div className="contact-method glass-card">
              <div className="method-icon"><MessageCircle /></div>
              <div className="method-details" style={{ textAlign: 'left' }}>
                <h4>WhatsApp</h4>
                <p>+91 8019677679</p>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm mt-2">Chat on WhatsApp</a>
              </div>
            </div>
            
            <div className="contact-method glass-card">
              <div className="method-icon"><Phone /></div>
              <div className="method-details" style={{ textAlign: 'left' }}>
                <h4>Phone</h4>
                <p>+91 8019677679</p>
                <a href={socialLinks.phone} className="btn btn-secondary btn-sm mt-2">Call Us</a>
              </div>
            </div>
            
            <div className="contact-method glass-card">
              <div className="method-icon"><Mail /></div>
              <div className="method-details" style={{ textAlign: 'left' }}>
                <h4>Email</h4>
                <p>freelancingxaitech@gmail.com</p>
                <a href={socialLinks.email} className="btn btn-secondary btn-sm mt-2">Send Email</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
