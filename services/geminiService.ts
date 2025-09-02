
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully,
  // maybe showing a message in the UI. For this example, we'll throw.
  throw new Error("API_KEY environment variable not set. Please add `API_KEY='your_api_key'` to the .env file.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const summarizeText = async (text: string): Promise<string> => {
  if (!text.trim()) {
    throw new Error("Input text cannot be empty.");
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following text in a clear and concise manner. Focus on the key points and main ideas:\n\n---\n${text}\n---`,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to get summary from the AI. Please check your connection and API key.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty.");
  }
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate the image. The model might have content restrictions.");
  }
};

export const createDocQAChat = (documentText: string): Chat => {
  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a helpful AI assistant. Your task is to answer questions based ONLY on the provided document context. Do not use any external knowledge. If the answer is not found within the document, you must state: "I cannot find the answer in the provided document."\n\nDOCUMENT:\n---\n${documentText}\n---`,
    },
  });
  return chat;
};
