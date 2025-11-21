
import { GoogleGenAI, Type, Schema } from "@google/genai";

const getClient = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Context Synthesis ---
export const synthesizeDocumentContext = async (title: string, content: string): Promise<string[]> => {
    const client = getClient();
    if (!client || content.length < 50) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(["General Study", "Uncategorized"]);
            }, 1500);
        });
    }

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following document content (Title: ${title}) and extract 3-5 short, relevant topic tags. Return them as a comma-separated list.\n\nContent Preview: ${content.substring(0, 2000)}`,
        });
        
        const text = response.text || "";
        return text.split(',').map(t => t.trim());
    } catch (e) {
        console.error("Synthesis failed", e);
        return ["General Study"];
    }
}

// --- Structured Summarization ---
export const generateSummary = async (text: string): Promise<any> => {
  const client = getClient();
  if (!client) return null;

  try {
    const context = text.length > 100000 ? text.substring(0, 100000) + "..." : text;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the provided text and generate a structured summary.`,
      config: {
          systemInstruction: `You are an expert academic summarizer. Break down the text into 3-5 logical sections. For each section, provide a heading, a brief paragraph description, and 2-3 bullet points of key data. Return JSON. Context: ${context}`,
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  title: { type: Type.STRING, description: "Overall summary title" },
                  sections: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              heading: { type: Type.STRING },
                              content: { type: Type.STRING, description: "Paragraph summary of this section" },
                              keyPoints: { 
                                  type: Type.ARRAY, 
                                  items: { type: Type.STRING },
                                  description: "Bullet points for this section"
                              }
                          },
                          required: ["heading", "content", "keyPoints"]
                      }
                  }
              },
              required: ["title", "sections"]
          }
      }
    });
    
    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating summary:", error);
    return null;
  }
};

// --- Chat / Q&A ---
export const askDocument = async (documentText: string, chatHistory: {role: string, text: string}[], question: string): Promise<string> => {
  const client = getClient();
  if (!client) return "AI Service Unavailable: Missing API Key.";

  try {
    const context = documentText.length > 500000 ? documentText.substring(0, 500000) + "..." : documentText;

    const history = chatHistory.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are a helpful, encouraging AI tutor. 
        You have access to a specific document provided below. 
        Answer the user's questions based primarily on this document. 
        If the answer is not in the document, you may use your general knowledge but explicitly state "I couldn't find this in the document, but generally..."
        Keep answers concise and educational.
        
        --- START OF DOCUMENT ---
        ${context}
        --- END OF DOCUMENT ---`,
      },
      history: history
    });

    const response = await chat.sendMessage({ message: question });
    return response.text || "I couldn't generate an answer.";
  } catch (error) {
    console.error("Error asking document:", error);
    return "I'm having trouble processing that request right now.";
  }
};

// --- Structured Quiz Generation ---
export const generateQuiz = async (text: string): Promise<any> => {
  const client = getClient();
  if (!client) return null;

  try {
    const context = text.length > 50000 ? text.substring(0, 50000) + "..." : text;
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a 5-question multiple-choice quiz based on the provided text.`,
      config: {
          systemInstruction: `You are a quiz generator. You must return a JSON object matching the requested schema. The content is based on: ${context}`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING }
                            },
                            correctAnswerIndex: { type: Type.INTEGER },
                            explanation: { type: Type.STRING }
                        },
                        required: ["question", "options", "correctAnswerIndex", "explanation"]
                    }
                }
            },
            required: ["title", "questions"]
          }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error generating quiz:", error);
    return null;
  }
};

// --- Structured Study Tips ---
export const getStudyTips = async (topic: string): Promise<any> => {
   const client = getClient();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Give me 3 unique, scientifically proven study techniques specifically for learning about "${topic}".`,
      config: {
          systemInstruction: "You are a study coach. Return a JSON object containing a list of tips. Each tip should have a title, a short description, the method name (e.g. 'Feynman Technique'), and a suggested icon emoji.",
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  tips: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              title: { type: Type.STRING },
                              description: { type: Type.STRING },
                              method: { type: Type.STRING },
                              icon: { type: Type.STRING, description: "A single emoji char" }
                          },
                          required: ["title", "description", "method", "icon"]
                      }
                  }
              }
          }
      }
    });
    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
     console.error("Error getting tips:", error);
    return null;
  }
}

// --- Specialized AI Tutor Chat ---
export const chatWithTutor = async (
    chatHistory: {role: string, text: string}[], 
    message: string, 
    mode: 'SOCRATIC' | 'ELI5'
): Promise<string> => {
    const client = getClient();
    if (!client) return "AI Service Unavailable.";

    const history = chatHistory.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    let systemInstruction = "";
    if (mode === 'SOCRATIC') {
        systemInstruction = "You are a Socratic Tutor. Your goal is to guide the student to the answer by asking probing, thought-provoking questions. Do NOT give the answer directly. If the student asks for the answer, refuse gently and ask another guiding question.";
    } else if (mode === 'ELI5') {
        systemInstruction = "You are an 'Explain Like I'm 5' expert. Simplify complex topics using easy-to-understand analogies, simple vocabulary, and fun examples. Avoid jargon.";
    }

    try {
        const chat = client.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
            history: history
        });
        const response = await chat.sendMessage({ message });
        return response.text || "No response.";
    } catch (error) {
        console.error("Tutor Chat Error", error);
        return "I'm having a bit of trouble right now.";
    }
}

// --- Flashcard Generator ---
export const generateFlashcards = async (topic: string): Promise<any> => {
    const client = getClient();
    if (!client) return null;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 5 study flashcards about: "${topic}"`,
            config: {
                systemInstruction: "You are a flashcard generator. Create concise question (front) and answer (back) pairs.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING },
                        cards: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    front: { type: Type.STRING },
                                    back: { type: Type.STRING }
                                },
                                required: ["front", "back"]
                            }
                        }
                    },
                    required: ["topic", "cards"]
                }
            }
        });
        const jsonText = response.text || "{}";
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Flashcard Error", error);
        return null;
    }
}
