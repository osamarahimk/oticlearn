
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getClient = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Simulates the backend process of vectorizing and understanding the document
// Now resolves faster to mimic background processing start
export const synthesizeDocumentContext = async (title: string, content: string): Promise<string> => {
    // In a real implementation using Google Cloud Storage and Firestore, 
    // this would trigger a Cloud Function to vectorize the document.
    // Here we simulate a delay.
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("Context synthesized successfully.");
        }, 2000);
    });
}

export const generateSummary = async (text: string): Promise<string> => {
  const client = getClient();
  if (!client) return "AI Service Unavailable: Missing API Key.";

  try {
    // Truncate text if extremely large to avoid token limits in this demo
    const context = text.length > 50000 ? text.substring(0, 50000) + "..." : text;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Please provide a concise, bulleted summary of the following text suitable for a student revision note:\n\n${context}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "An error occurred while generating the summary. Please try again.";
  }
};

export const askDocument = async (documentText: string, question: string): Promise<string> => {
  const client = getClient();
  if (!client) return "AI Service Unavailable: Missing API Key.";

  try {
    // Truncate text if extremely large to avoid token limits in this demo
    const context = documentText.length > 50000 ? documentText.substring(0, 50000) + "..." : documentText;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: The following is the content of a document the user is studying:\n${context}\n\nUser Question: ${question}\n\nAnswer the question based on the document context. If the answer isn't in the document, use your general knowledge but mention that it's not in the text.`,
    });
    return response.text || "Could not answer question.";
  } catch (error) {
    console.error("Error asking document:", error);
    return "An error occurred processing your question.";
  }
};

export const generateQuiz = async (text: string): Promise<string> => {
  const client = getClient();
  if (!client) return "AI Service Unavailable.";

  try {
    const context = text.length > 50000 ? text.substring(0, 50000) + "..." : text;
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 3 multiple-choice questions based on this text to test comprehension. Format it clearly with the question, options, and the correct answer hidden at the bottom:\n\n${context}`,
    });
    return response.text || "Could not generate quiz.";
  } catch (error) {
    console.error("Error generating quiz:", error);
    return "An error occurred generating the quiz.";
  }
};

export const getStudyTips = async (topic: string): Promise<string> => {
   const client = getClient();
  if (!client) return "AI Service Unavailable.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Give me 3 unique, scientifically proven study techniques specifically for learning about "${topic}". Keep it brief and actionable.`,
    });
    return response.text || "Could not fetch study tips.";
  } catch (error) {
     console.error("Error getting tips:", error);
    return "An error occurred fetching tips.";
  }
}
