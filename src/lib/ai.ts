
import Together from "together-ai";

// Initialize the Together AI client with your API key
const API_KEY = "2e02291e588ee5cd9660af7ab744417c65e7f3023da7b3c1d0ad90bbc04f3486";
const together = new Together({
  apiKey: API_KEY
});

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
  * Title (in quotes to make it easily recognizable)
  * Year of release in parentheses (YYYY)
  * Brief explanation of why this matches their interests (2-3 sentences)
  * A fun fact or interesting trivia about the recommendation
- Recommend 3-5 items unless the user specifies otherwise
- Format your recommendations in a clean, readable way with each recommendation clearly separated
- Make sure to include both movies AND TV shows when appropriate
- Be specific about genres, directors, actors, and themes
- If you don't have enough information to make good recommendations, ask clarifying questions
- Remember to put titles in quotes to make them easily identifiable

Remember that your goal is to help users discover content they'll genuinely enjoy based on their preferences.`;

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
- Identify patterns in the user's viewing habits (genres, themes, directors, actors, time periods)
- Highlight genres, directors, or actors they seem to prefer with specific examples
- Comment on the diversity or specificity of their taste
- Suggest what this might indicate about their preferences or personality
- Mention any interesting contrasts or surprises in their viewing history
- Be specific, insightful, and thoughtful in your analysis
- End with 3-4 specific recommendations based on their viewing patterns
  * Make sure to put recommended titles in quotes (for easy identification)
  * Include the year of release in parentheses for each recommendation
- Format your response in clear sections:
  * General Patterns
  * Notable Preferences
  * Potential Blind Spots
  * Tailored Recommendations
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
  * Cast trivia and interesting actor stories
  * Production challenges or last-minute changes
  * Easter eggs or hidden details viewers might have missed
  * Box office performance or critical reception context
  * Interesting connections to other films or cultural impact
- Format each fact as a numbered list for readability (1., 2., etc.)
- Start with confirmation of the title and its release year: "'Title' (YEAR) - Directed by DIRECTOR"
- Make sure facts are accurate and specific
- Avoid obvious information that most fans would already know
- Use an enthusiastic, engaging tone
- If multiple movies/shows share the same name, briefly mention this and provide facts for the most well-known version

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

/**
 * Function to simulate automation tasks that would typically require backend
 */
export async function simulateAutomationTask(taskType: string, parameters: Record<string, string>): Promise<string> {
  try {
    const systemPrompt = `You are an AI assistant that simulates browser automation for a streaming platform.
Your task is to respond as if you are performing automated tasks in a browser, even though this is a simulation.

REQUESTED TASK: ${taskType}
PARAMETERS: ${JSON.stringify(parameters)}

GUIDELINES:
- Respond as if you're actually performing the requested browser task
- For 'login' tasks: Describe the login process step by step and provide a simulated result
- For 'screenshot' tasks: Describe what would be visible in the screenshot of the specified page
- For 'check_playback' tasks: Describe the video player state as if you're checking if a video is playing
- Include typical success/failure conditions that might occur during automation
- Add realistic details about page elements, UI components, and interactions
- Format your response to mimic an automation log with timestamps and step details
- End with a clear status indicator (SUCCESS or FAILURE) and any relevant details

Remember that your goal is to help users understand how browser automation would work in a real backend implementation.`;

    const response = await together.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Execute ${taskType} task with parameters: ${JSON.stringify(parameters)}` }
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 800,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error simulating automation task:", error);
    return "Sorry, I couldn't simulate the automation task at this time. Please try again later.";
  }
}
