import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

const DISCLAIMER =
  "This assistant provides general information only and is not medical advice. For diagnosis or treatment, consult a qualified clinician.";

const SYSTEM_PROMPT = `You are a cautious health information assistant for Rahat Clinic. You are not a doctor. Never diagnose. Reply with ONLY valid JSON (no markdown, no code fences) in this exact shape:
{"advice":"string","nextSteps":"string","doctorSuggestion":"string"}
- advice: 2–4 short sentences of general self-care or education.
- nextSteps: practical steps (rest, fluids, monitoring, OTC cautions if appropriate).
- doctorSuggestion: when to book a clinic visit or seek urgent/emergency care.
If symptoms could be serious (chest pain, stroke signs, severe bleeding, trouble breathing, etc.), urge emergency care immediately in doctorSuggestion.`;

function parseOpenAiJson(content) {
  if (!content || typeof content !== "string") return null;
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function fallbackFromKeywords(message) {
  const lower = message.toLowerCase();

  if (
    /chest\s*pain|heart\s*attack|can't\s*breathe|cannot\s*breathe|choking|stroke|paralysis|unconscious|severe\s*bleeding/.test(
      lower
    )
  ) {
    return {
      advice:
        "Symptoms like these can be life-threatening. Stay as calm as possible and avoid driving yourself if you feel very unwell.",
      nextSteps:
        "Call your local emergency number immediately. If someone is with you, ask them to stay with you until help arrives.",
      doctorSuggestion:
        "Seek emergency care right now. After stabilisation, follow up with your doctor or book an appointment at Rahat Clinic for ongoing care.",
    };
  }

  if (/headache|migraine|head\s*hurts/.test(lower)) {
    return {
      advice:
        "Tension headaches and mild migraines often improve with rest, a quiet dark room, and good hydration. Over-the-counter pain relief may help some people if you normally tolerate it and have no contraindications.",
      nextSteps:
        "Drink water, rest, limit screen time, and note if vision changes, neck stiffness, fever, or the worst headache of your life appear.",
      doctorSuggestion:
        "Book a doctor if the headache is sudden and severe, follows a head injury, comes with fever or stiff neck, or does not improve with usual care.",
    };
  }

  if (/fever|temperature|chills/.test(lower)) {
    return {
      advice:
        "Fever is often the body fighting infection. Rest, drink fluids, and monitor how you feel. Light clothing and a comfortable room temperature can help.",
      nextSteps:
        "Track temperature if you can, use paracetamol or ibuprofen only as directed on the label and if safe for you, and seek care if you worsen.",
      doctorSuggestion:
        "See a clinician if fever lasts more than a few days, is very high, or comes with rash, breathing difficulty, confusion, or severe pain.",
    };
  }

  if (/cold|flu|cough|sore\s*throat|runny\s*nose|congestion/.test(lower)) {
    return {
      advice:
        "Most colds are viral and improve with time. Warm fluids, salt-water gargles for sore throat, and honey for cough (adults) may ease symptoms.",
      nextSteps:
        "Rest, hydrate, wash hands often, and avoid close contact to protect others. Use OTC medicines only as directed.",
      doctorSuggestion:
        "Book a doctor if symptoms last more than 10–14 days, you have high fever, chest pain, or trouble breathing.",
    };
  }

  if (/stomach|nausea|vomit|diarrhea|loose\s*motion/.test(lower)) {
    return {
      advice:
        "Gastrointestinal upset is common. Small sips of oral rehydration or clear fluids can help prevent dehydration.",
      nextSteps:
        "Try bland foods when hungry, avoid alcohol and greasy food, and rest. Seek urgent care if you cannot keep fluids down.",
      doctorSuggestion:
        "See a doctor if symptoms are severe, bloody, last more than 48 hours, or you show signs of dehydration.",
    };
  }

  if (/anxiety|stress|can't\s*sleep|insomnia|panic/.test(lower)) {
    return {
      advice:
        "Stress and poor sleep often feed each other. Gentle routines, limiting caffeine, and brief relaxation breathing can help some people.",
      nextSteps:
        "Try a regular sleep schedule, short walks, and talking to someone you trust. Avoid self-medicating with alcohol.",
      doctorSuggestion:
        "Book a clinician if anxiety or sleep problems persist, affect daily life, or you have thoughts of harming yourself—seek immediate help in that case.",
    };
  }

  return {
    advice:
      "For many general health questions, rest, balanced nutrition, hydration, and monitoring symptoms over a short period are reasonable starting points.",
    nextSteps:
      "Write down your symptoms, when they started, and anything that makes them better or worse to discuss with a professional.",
    doctorSuggestion:
      "If symptoms are new, worsening, or worrying, book an appointment at Rahat Clinic or your regular doctor for personalised advice.",
  };
}

async function tryOpenAi(userMessage) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  const parsed = parseOpenAiJson(text);
  if (
    !parsed ||
    typeof parsed.advice !== "string" ||
    typeof parsed.nextSteps !== "string" ||
    typeof parsed.doctorSuggestion !== "string"
  ) {
    return null;
  }

  return {
    advice: parsed.advice.trim(),
    nextSteps: parsed.nextSteps.trim(),
    doctorSuggestion: parsed.doctorSuggestion.trim(),
    source: "ai",
  };
}

export const chatQuery = catchAsyncErrors(async (req, res, next) => {
  const { message } = req.body;
  if (!message || typeof message !== "string" || !message.trim()) {
    return next(new ErrorHandler("Message is required", 400));
  }

  const trimmed = message.trim().slice(0, 2000);

  const ai = await tryOpenAi(trimmed);
  if (ai) {
    return res.status(200).json({
      success: true,
      advice: ai.advice,
      nextSteps: ai.nextSteps,
      doctorSuggestion: ai.doctorSuggestion,
      disclaimer: DISCLAIMER,
      source: "ai",
    });
  }

  const fb = fallbackFromKeywords(trimmed);
  return res.status(200).json({
    success: true,
    advice: fb.advice,
    nextSteps: fb.nextSteps,
    doctorSuggestion: fb.doctorSuggestion,
    disclaimer: DISCLAIMER,
    source: "rules",
  });
});
