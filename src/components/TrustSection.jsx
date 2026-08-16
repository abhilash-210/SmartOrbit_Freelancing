import React from 'react';
import { IndianRupee, Lightbulb, Smartphone, Users } from 'lucide-react';

const TrustSection = () => {
  const trustFeatures = [
    {
      icon: <IndianRupee size={28} className="trust-icon-color" />,
      title: "Affordable",
      description: "Professional digital services at budget-friendly prices."
    },
    {
      icon: <Lightbulb size={28} className="trust-icon-color" />,
      title: "Creative",
      description: "Modern designs and content tailored to your business."
    },
    {
      icon: <Smartphone size={28} className="trust-icon-color" />,
      title: "Responsive",
      description: "Mobile-friendly and responsive solutions."
    },
    {
      icon: <Users size={28} className="trust-icon-color" />,
      title: "Client Focused",
      description: "We work closely with clients to understand their requirements."
    }
  ];

  return (
    <section className="trust-section">
      <div className="container">
        <div className="trust-grid">
          {trustFeatures.map((feature, index) => (
            <div key={index} className="trust-card glass-card">
              <div className="trust-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="trust-title">{feature.title}</h3>
              <p className="trust-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
