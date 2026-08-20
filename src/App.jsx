import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustSection from './components/TrustSection';
import Services from './components/Services';
import Projects from './components/Projects';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    document.title = "SmartOrbit Freelancers | Web Design, Brand Design & Digital Services";
    
    // Add meta description for SEO
    let metaDescription = document.querySelector("meta[name='description']");
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "SmartOrbit Freelancers provides affordable brand design, responsive websites, content creation and digital support services for businesses and individuals.";
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <TrustSection />
        <Services />
        <Projects />
        <About />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
