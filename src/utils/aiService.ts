
import { toast } from "sonner";

// Define types for message handling
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// OpenAI API integration for AI processing
export const processAIQuery = async (
  query: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  try {
    // Transform chat history to OpenAI format
    const messages = [
      { 
        role: "system", 
        content: "You are a friendly and knowledgeable movie recommendation assistant for MovieStreamHub. Answer questions about movies, TV shows, actors, directors and provide personalized recommendations. Keep responses concise (under 150 words) and conversational. Focus on being helpful with movie and TV show related questions."
      },
      // Add last few messages from history to provide context
      ...chatHistory.slice(-5).map(msg => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content
      })),
      { role: "user", content: query }
    ];

    // Make API call to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("Error processing AI query:", error);
    // Return a fallback response if the API call fails
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
};
