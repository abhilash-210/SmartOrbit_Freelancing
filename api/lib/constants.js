export const SERVICES = [
  { id: '1', name: 'Brand Design', aliases: ['1', 'brand design', 'brand', 'logo', 'branding', 'posters', 'poster'] },
  { id: '2', name: 'Web Design', aliases: ['2', 'web design', 'web', 'website', 'landing page', 'frontend'] },
  { id: '3', name: 'Content Creation & Editing', aliases: ['3', 'content creation & editing', 'content creation', 'content', 'video editing', 'video', 'editing', 'reels'] },
  { id: '4', name: 'Data Entry & Customer Support', aliases: ['4', 'data entry & customer support', 'data entry', 'customer support', 'excel', 'data', 'support'] }
];

export const CONVERSATION_STATES = {
  NEW: 'NEW',
  INTAKE_STARTED: 'INTAKE_STARTED',
  WAITING_FOR_SERVICE: 'WAITING_FOR_SERVICE',
  SERVICE_SELECTED: 'SERVICE_SELECTED',
  LEAD_RECORDED: 'LEAD_RECORDED',
  HUMAN_HANDOFF: 'HUMAN_HANDOFF',
  MANUAL_CONVERSATION: 'MANUAL_CONVERSATION'
};

export const SOURCES = {
  WEBSITE: 'website',
  DIRECT_WHATSAPP: 'direct_whatsapp',
  WHATSAPP_UNKNOWN: 'whatsapp_unknown'
};

export const ENTRY_POINTS = {
  DISCUSS_PROJECT_BUTTON: 'discuss_project_button',
  DIRECT_MESSAGE: 'direct_message',
  UNKNOWN: 'unknown'
};

export const MESSAGES = {
  GREETING: `👋 Hello! Thank you for your interest in *SmartOrbit*.

We'd love to know which service you're interested in so we can direct your request to the right person.

Please select one of the following:

1️⃣ Brand Design
2️⃣ Web Design
3️⃣ Content Creation & Editing
4️⃣ Data Entry & Customer Support`,

  INVALID_SELECTION: `No problem! 😊 Please select the service that best matches what you're looking for:

1️⃣ Brand Design
2️⃣ Web Design
3️⃣ Content Creation & Editing
4️⃣ Data Entry & Customer Support`,

  CONFIRMATION: (serviceName) => `Thank you for your response! 😊

We've received your request regarding *${serviceName}*.

Our team will review your request and get in contact with you shortly.

Thank you for your patience. 🙌`
};

export const WEBSITE_PREFILL_SUBSTRING = "interested in your";
