
import Together from "together-ai";

// Initialize the Together AI client with your API key
const API_KEY = "2e02291e588ee5cd9660af7ab744417c65e7f3023da7b3c1d0ad90bbc04f3486";
const together = new Together(API_KEY);

// The model to use
const MODEL = "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8";

/**
 * Function to generate recommendations based on user prompt
 */
export async function generateAIRecommendations(prompt: string): Promise<string> {
  try {
    const systemPrompt = `You are MovieMind, an expert AI assistant specialized in movie and TV show recommendations. 
Your task is to recommend relevant movies and TV shows based on user preferences.

GUIDELINES:
- Provide thoughtful, specific recommendations tailored to the user's request
- For each recommendation, include:
  * Title
  * Year of release
  * Brief explanation of why this matches their interests (2-3 sentences)
  * A fun fact or interesting trivia about the recommendation
- Recommend 3-5 items unless the user specifies otherwise
- Format your recommendations in a clean, readable way
- If appropriate, suggest thematically related movies/shows they might also enjoy
- Use a friendly, conversational tone
- If you don't have enough information to make good recommendations, ask clarifying questions

Remember that your goal is to help users discover content they'll genuinely enjoy, not just popular titles.`;

    const response = await together.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    return "Sorry, I couldn't generate recommendations at this time. Please try again later.";
  }
}

/**
 * Function to analyze a user's watch history and provide insights
 */
export async function analyzeWatchHistory(watchHistory: string): Promise<string> {
  try {
    const systemPrompt = `You are an analytical AI assistant specializing in movie and TV show analysis.
Your task is to analyze a user's watch history and provide interesting insights.

GUIDELINES:
- Identify patterns in the user's viewing habits
- Highlight genres, directors, or actors they seem to prefer
- Suggest what this might indicate about their taste
- Mention any interesting contrasts or surprises in their viewing history
- Be specific, insightful, and thoughtful in your analysis
- End with 2-3 recommendations based on their viewing patterns
- Use a friendly, conversational tone

Your analysis should feel personalized and offer genuine value to help users understand their own preferences better.`;

    const response = await together.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here's my watch history: ${watchHistory}. What does this say about my taste?` }
      ],
      model: MODEL,
      temperature: 0.6,
      max_tokens: 800,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing watch history:", error);
    return "Sorry, I couldn't analyze your watch history at this time. Please try again later.";
  }
}

/**
 * Function to generate movie or TV show trivia
 */
export async function generateMediaTrivia(title: string): Promise<string> {
  try {
    const systemPrompt = `You are TriviaMaster, an AI expert on movie and TV show trivia and behind-the-scenes facts.
Your task is to provide fascinating trivia about a specific title.

GUIDELINES:
- Provide 5-7 interesting, lesser-known facts about the requested movie or TV show
- Include a mix of:
  * Behind-the-scenes information
  * Cast trivia
  * Production challenges or changes
  * Easter eggs or hidden details
  * Interesting context about how it was made or received
- Format each fact as a numbered list for readability
- Make sure facts are accurate and specific
- Avoid obvious information that most fans would already know
- Use an enthusiastic, engaging tone

Your goal is to delight users with fascinating information they probably didn't know about media they enjoy.`;

    const response = await together.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Tell me some interesting trivia about "${title}"` }
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 800,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating media trivia:", error);
    return "Sorry, I couldn't generate trivia at this time. Please try again later.";
  }
}
