import React from 'react';

const steps = [
  {
    num: "01",
    title: "Tell Us Your Requirement",
    desc: "Share your idea, business requirement or project details."
  },
  {
    num: "02",
    title: "Discuss & Plan",
    desc: "We understand your requirements and discuss the right solution."
  },
  {
    num: "03",
    title: "Create",
    desc: "We design, develop or complete the requested work."
  },
  {
    num: "04",
    title: "Deliver",
    desc: "You receive the completed project and required files."
  }
];

const HowItWorks = () => {
  return (
    <section className="how-it-works-section">
      <div className="container">
        <div className="section-header animate-fade-in">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">A simple, transparent process to get your digital projects done.</p>
        </div>
        
        <div className="steps-grid">
          {steps.map((step, idx) => (
            <div key={idx} className="step-card glass-card">
              <div className="step-number gradient-text">{step.num}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
