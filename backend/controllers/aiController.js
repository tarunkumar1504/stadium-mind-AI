const { GoogleGenAI } = require('@google/genai');
const db = require('../config/db');
const StadiumPoint = require('../models/StadiumPoint');
const Alert = require('../models/Alert');

let aiClient = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('Gemini AI Client initialized successfully.');
  } catch (err) {
    console.error('Error initializing Gemini SDK client:', err.message);
  }
} else {
  console.warn('GEMINI_API_KEY is not defined. AI Assistant will run in fallback mock simulation mode.');
}

// Highly realistic mock generator to run out-of-the-box
const getMockAIResponse = (prompt, points, alerts, language, accessibility) => {
  const query = prompt.toLowerCase();
  const lang = (language || 'english').toLowerCase();
  const isAcc = accessibility === 'true';

  let reply = "";
  
  // Basic translations helper
  const translate = {
    english: {
      welcome: "Hello! I am StadiumPulse AI, your FIFA World Cup 2026 assistant.",
      nocrowd: "The least congested entry point right now is Gate B (South Entrance) with only a 25% crowd level.",
      gateDWarning: "Please note that Gate D is currently heavily congested (90% capacity). I recommend avoiding it and using Gate B instead.",
      restroom: "The nearest restroom with low congestion is Restroom Block - South Tier 1 (20% crowd level). It is fully wheelchair accessible.",
      restroomAcc: "For wheelchair-accessible restrooms, you can use Restroom Block - South Tier 1 or Restroom Block - North Tier 1. Avoid the East Tier Restroom as it requires stair access.",
      vegan: "You can find 'Green Fields Vegan' concession stand in the North-West quadrant. It currently has a low wait time of about 5 minutes.",
      emergency: "EMERGENCY UPDATE: Please follow the emergency exits as directed by security. Keep corridors clear.",
      notfound: "I can help you find gates, food concessions, restrooms, current queue times, or wheelchair-friendly routes. What can I help you find?",
      recGateB: "Recommendation: Route incoming spectators to Gate B (South Entrance).\nReason: Gate B is currently at 25% capacity, while Gates A and D are congested.\nConfidence Score: 95%\nExpected Impact: Reduces average queue waiting times by 18 minutes for incoming fans.",
      recStaff: "Recommendation: Relocate 5 staff members from Gate B to Gate D.\nReason: Gate D ticket scanners are experiencing high volume (340 queue size) leading to gate congestion.\nConfidence Score: 88%\nExpected Impact: Increases ticket scanning throughput by 35% at the west wing."
    },
    spanish: {
      welcome: "¡Hola! Soy StadiumPulse AI, tu asistente oficial de la Copa Mundial de la FIFA 2026.",
      nocrowd: "El punto de entrada menos congestionado en este momento es la Puerta B (Entrada Sur) con solo un 25% de nivel de multitud.",
      gateDWarning: "Tenga en cuenta que la Puerta D está actualmente muy congestionada (90% de capacidad). Recomiendo evitarla y usar la Puerta B.",
      restroom: "El baño más cercano con baja congestión es el Bloque de Baños - Nivel Sur 1 (20% de nivel de multitud). Es totalmente accesible en silla de ruedas.",
      restroomAcc: "Para baños accesibles para sillas de ruedas, puede usar el Bloque Sur o el Bloque Norte. Evite el del Nivel Este ya que requiere escaleras.",
      vegan: "Puede encontrar el puesto de comida 'Green Fields Vegan' en el cuadrante noroeste. Actualmente tiene un tiempo de espera de unos 5 minutos.",
      emergency: "ALERTA DE EMERGENCIA: Siga las rutas de evacuación indicadas por el personal de seguridad.",
      notfound: "Puedo ayudarte a encontrar puertas, puestos de comida, baños, tiempos de espera actuales o rutas accesibles. ¿Qué necesitas?",
      recGateB: "Recomendación: Dirigir a los espectadores entrantes a la Puerta B (Entrada Sur).\nRazón: La Puerta B está al 25% de capacidad, mientras que las Puertas A y D están congestionadas.\nNivel de Confianza: 95%\nImpacto Esperado: Reduce el tiempo de espera en cola en 18 minutos.",
      recStaff: "Recomendación: Reubicar a 5 miembros del personal de la Puerta B a la Puerta D.\nRazón: Los escáneres de boletos de la Puerta D tienen un alto volumen de cola (340 personas).\nNivel de Confianza: 88%\nImpacto Esperado: Incrementa la velocidad de entrada en un 35%."
    },
    french: {
      welcome: "Bonjour ! Je suis StadiumPulse AI, votre assistant pour la Coupe du Monde de la FIFA 2026.",
      nocrowd: "Le point d'entrée le moins encombré en ce moment est la Porte B (Entrée Sud) avec seulement 25% d'occupation.",
      gateDWarning: "Veuillez noter que la Porte D est actuellement très encombrée (90% de capacité). Je vous conseille d'utiliser la Porte B.",
      restroom: "Les toilettes les moins fréquentées se trouvent dans le bloc Sud (20% d'occupation). Elles sont accessibles en fauteuil roulant.",
      restroomAcc: "Pour des toilettes accessibles, utilisez le bloc Sud ou Nord. Évitez le bloc Est qui nécessite des escaliers.",
      vegan: "Vous trouverez le stand 'Green Fields Vegan' dans le secteur Nord-Ouest. L'attente y est de 5 minutes environ.",
      emergency: "ALERTE D'URGENT: Veuillez suivre les issues de secours indiquées.",
      notfound: "Je peux vous aider à trouver les portes, stands de nourriture, toilettes, ou itinéraires PMR. Que souhaitez-vous ?",
      recGateB: "Recommandation : Orienter les supporters vers la Porte B.\nRaison : La Porte B est à 25% de sa capacité, tandis que A et D sont saturées.\nScore de confiance : 95%\nImpact attendu : Réduction du temps d'attente de 18 minutes.",
      recStaff: "Recommandation : Transférer 5 agents de la Porte B vers la Porte D.\nRaison : Forte affluence à la Porte D (file d'attente de 340 personnes).\nScore de confiance : 88%\nImpact attendu : Augmentation du débit d'entrée de 35%."
    }
  };

  const t = translate[lang] || translate.english;

  // Decision support/Organizer queries
  if (query.includes('recommend') || query.includes('organizer') || query.includes('decision') || query.includes('staff')) {
    if (query.includes('staff') || query.includes('relocate')) {
      return `${t.welcome}\n\n${t.recStaff}`;
    }
    return `${t.welcome}\n\n${t.recGateB}`;
  }

  // Fan queries
  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return t.welcome + " " + t.notfound;
  }
  if (query.includes('gate') || query.includes('entrance') || query.includes('crowd') || query.includes('queue')) {
    if (query.includes('d') || query.includes('west')) {
      return `${t.welcome}\n\n${t.gateDWarning}\n\n${t.nocrowd}`;
    }
    return `${t.welcome}\n\n${t.nocrowd}`;
  }
  if (query.includes('restroom') || query.includes('toilet') || query.includes('bathroom')) {
    if (isAcc || query.includes('wheelchair') || query.includes('accessible')) {
      return `${t.welcome}\n\n${t.restroomAcc}`;
    }
    return `${t.welcome}\n\n${t.restroom}`;
  }
  if (query.includes('vegan') || query.includes('food') || query.includes('eat') || query.includes('stall') || query.includes('concession')) {
    return `${t.welcome}\n\n${t.vegan}`;
  }
  if (query.includes('emergency') || query.includes('evacuate') || query.includes('danger')) {
    return t.emergency;
  }

  // Fallback default message
  return `${t.welcome}\n\nHere is some real-time stadium info:\n- Lowest crowd entry: Gate B (25%)\n- Highest crowd entry: Gate D (90%)\n- Current active alerts: ${alerts.length > 0 ? alerts[0].message : "None"}\n- Selected Language: ${language || 'English'}\n- Accessibility Filter: ${isAcc ? "ACTIVE (wheelchair paths prioritized)" : "Inactive"}`;
};

exports.askAssistant = async (req, res, next) => {
  const { prompt, language, accessibilityMode } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    // 1. Fetch current stadium data context
    let points = [];
    let alerts = [];

    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      points = mockData.stadiumPoints;
      alerts = mockData.alerts.filter(a => a.active);
    } else {
      points = await StadiumPoint.find({});
      alerts = await Alert.find({ active: true });
    }

    // Convert to concise text summaries to inject into Gemini prompt context
    const pointsSummary = points.map(p => 
      `${p.name} (${p.type}): crowd level=${p.crowdLevel}%, queue size=${p.queueSize} people, status=${p.status}, wheelchair-accessible=${p.accessible}`
    ).join('\n');

    const alertsSummary = alerts.map(a => 
      `Alert [${a.type}]: ${a.message} (Issued by ${a.source})`
    ).join('\n');

    // 2. If Gemini API is configured, call it
    if (aiClient) {
      const systemInstruction = `
You are "StadiumPulse AI", the ultimate intelligent operations & visitor assistant for the FIFA World Cup 2026.
Below is the current real-time state of the stadium:
[ACTIVE ALERTS]
${alertsSummary || 'No active alerts.'}

[STADIUM POINTS OF INTEREST & QUEUES]
${pointsSummary}

USER SETTINGS:
- Output Language: ${language || 'English'} (You MUST write your response entirely in this language!)
- Accessibility Mode: ${accessibilityMode === 'true' ? 'ENABLED (Prioritize wheelchair-friendly routes, elevators, ramps, and stairless restrooms)' : 'DISABLED'}

RESPONSE INSTRUCTIONS:
1. Provide a direct, helpful, and natural response to the user's query.
2. If they are asking for routes, point out which gates/locations are congested and which are clear.
3. If they are asking for recommendations (for organizers/staff), you MUST structure your recommendation using this exact format:
   Recommendation: [Core action item]
   Reason: [Data-driven justification based on queue sizes or crowd level]
   Confidence Score: [A percentage, e.g. 92%]
   Expected Impact: [Quantitative or qualitative benefit, e.g. Reduces queue wait time by 15 mins]
4. Do not mention coordinates or system details unless asked. Keep the tone professional, welcoming, and concise.
`;

      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-1.5-flash', // Using Gemini 1.5 Flash as standard for speedy text chat
          contents: [
            { role: 'user', parts: [{ text: systemInstruction + `\n\nUser Query: "${prompt}"` }] }
          ]
        });

        const replyText = response.text || "Sorry, I couldn't process that query.";
        return res.json({ response: replyText });
      } catch (geminiErr) {
        console.error('Gemini API call failed, falling back to mock response:', geminiErr.message);
        // Fallback to mock on API error
        const mockReply = getMockAIResponse(prompt, points, alerts, language, accessibilityMode);
        return res.json({ response: mockReply, note: "Fallback response due to API call failure." });
      }
    } else {
      // 3. Fallback mock assistant response
      const mockReply = getMockAIResponse(prompt, points, alerts, language, accessibilityMode);
      return res.json({ response: mockReply });
    }
  } catch (err) {
    next(err);
  }
};
