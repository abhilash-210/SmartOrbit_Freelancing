export const DEFAULT_WHATSAPP_MESSAGE = "Hello SmartOrbit Freelancers, I am interested in your freelancing services. I would like to discuss about project.";

export const getWhatsAppUrl = (customMessage = DEFAULT_WHATSAPP_MESSAGE) => {
  return `https://wa.me/918019677679?text=${encodeURIComponent(customMessage)}`;
};

export const socialLinks = {
  whatsapp: getWhatsAppUrl(),
  whatsappRaw: "https://wa.me/918019677679",
  email: "mailto:freelancingxaitech@gmail.com",
  phone: "tel:+918019677679",
  github: "", // ADD GITHUB URL HERE
  instagram: "", // ADD INSTAGRAM URL HERE
  linkedin: "", // ADD LINKEDIN URL HERE
  fiverr: "" // ADD FIVERR URL HERE
};

