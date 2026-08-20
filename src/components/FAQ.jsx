import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: "Do you work with international clients?",
    a: "Yes. SmartOrbit Freelancers can work with clients from India and other countries."
  },
  {
    q: "Can I request a custom package?",
    a: "Yes. Clients can contact us with their requirements for a customized quote."
  },
  {
    q: "Do you build mobile-responsive websites?",
    a: "Yes. Websites are designed to work across mobile, tablet and desktop screens."
  },
  {
    q: "Can I see demo projects before ordering?",
    a: "Yes. Visitors can explore our demo portfolio projects."
  },
  {
    q: "How do I contact you?",
    a: "Clients can contact us through WhatsApp, phone or email."
  },
  {
    q: "Do prices vary depending on the project?",
    a: "Yes. Listed prices are starting prices and the final quote depends on requirements."
  }
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleFaq = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="faq-section">
      <div className="container">
        <div className="section-header animate-fade-in">
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`faq-item glass-card ${openIdx === idx ? 'open' : ''}`}
              onClick={() => toggleFaq(idx)}
            >
              <div className="faq-question">
                <h3>{faq.q}</h3>
                {openIdx === idx ? <ChevronUp size={20} className="primary-color" /> : <ChevronDown size={20} />}
              </div>
              {openIdx === idx && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
