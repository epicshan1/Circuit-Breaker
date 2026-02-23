
import { GoogleGenAI, Type, Modality } from "@google/genai";

export class GeminiService {
  private static instance: GeminiService;
  private ai: any;

  private constructor() {
    // Correct initialization using named parameter and process.env.API_KEY directly
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  // Gemini 3 Pro - Thinking Mode for complex advice
  async getDeepReflection(journalEntries: any[]) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze these nervous system regulation journal entries and provide a detailed, compassionate analysis of patterns and one advanced somatic recommendation: ${JSON.stringify(journalEntries)}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text;
  }

  // Gemini 3 Pro - Chatbot
  async chatWithGuide(message: string, history: { role: string; parts: { text: string }[] }[]) {
    const chat = this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      // Pass existing history to the chat instance
      history: history,
      config: {
        systemInstruction: "You are a world-class somatic therapist and nervous system expert. You help users understand polyvagal theory and somatic regulation techniques. Keep answers concise, empathetic, and grounded in neuroscience.",
      }
    });
    
    const response = await chat.sendMessage({ message });
    return response.text;
  }

  // Gemini 3 Flash - Transcription
  async transcribeAudio(base64Audio: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "audio/webm;codecs=opus", data: base64Audio } },
          { text: "Transcribe this audio recording of a person reflecting on their nervous system state. Correct any minor speech errors but keep the emotional tone." }
        ]
      }
    });
    return response.text;
  }

  // Gemini Flash Lite - Fast analysis
  async fastSymptomCheck(symptoms: string) {
    const response = await this.ai.models.generateContent({
      // Use the correct model alias 'gemini-flash-lite-latest'
      model: "gemini-flash-lite-latest",
      contents: `Quickly identify the likely autonomic state (Ventral, Sympathetic, or Dorsal Vagal) based on these symptoms: ${symptoms}. Give a 1-sentence answer.`,
    });
    return response.text;
  }

  // Gemini 2.5 Flash TTS
  async generateSpeech(text: string): Promise<string | undefined> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this instruction calmly and supportively: ${text}` }] }],
      config: {
        // Use Modality enum and ensure it is an array with a single element
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    // Property access is preferred over method calls
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }
}
