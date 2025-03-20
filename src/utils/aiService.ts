
import { toast } from "sonner";

// Define types for message handling
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// This is a simplified AI processing function
// In a real implementation, this would connect to an actual AI service like OpenAI
export const processAIQuery = async (
  query: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  try {
    // For a real implementation, you would replace this with an actual API call
    // Example of how you might structure an API call to OpenAI:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a movie recommendation assistant." },
          ...chatHistory.map(msg => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.content
          })),
          { role: "user", content: query }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
    */

    // For demonstration purposes, we'll use a more sophisticated response system than just predefined responses
    const lowerCaseQuery = query.toLowerCase();
    
    // Create more dynamic responses based on query content
    if (lowerCaseQuery.includes("recommend") && lowerCaseQuery.includes("movie")) {
      return generateMovieRecommendation(lowerCaseQuery);
    } else if (lowerCaseQuery.includes("recommend") && lowerCaseQuery.includes("tv")) {
      return generateTVRecommendation(lowerCaseQuery);
    } else if (lowerCaseQuery.includes("actor") || lowerCaseQuery.includes("actress") || lowerCaseQuery.includes("director")) {
      return generatePersonInfo(lowerCaseQuery);
    } else if (lowerCaseQuery.includes("genre")) {
      return generateGenreInfo(lowerCaseQuery);
    } else if (lowerCaseQuery.includes("help") || lowerCaseQuery.includes("what can you")) {
      return "I can help you discover movies and TV shows based on your interests! You can ask me for recommendations, information about actors, directors, or specific genres. Try asking something like 'Recommend sci-fi movies' or 'Tell me about comedy TV shows'.";
    } else {
      // General response with some intelligence
      return `Thanks for your question about "${query}". I'm an AI assistant focusing on movies and TV shows. To give you the best recommendations, try asking about specific genres, actors, directors, or types of content you enjoy watching.`;
    }
  } catch (error) {
    console.error("Error processing AI query:", error);
    toast({
      title: "AI Processing Error",
      description: "There was an error processing your request",
      variant: "destructive"
    });
    return "I'm sorry, I encountered an error processing your request. Please try again later.";
  }
};

function generateMovieRecommendation(query: string): string {
  // Extract genre information from the query
  const genres = [
    { name: "action", present: query.includes("action") },
    { name: "comedy", present: query.includes("comedy") },
    { name: "drama", present: query.includes("drama") },
    { name: "sci-fi", present: query.includes("sci-fi") || query.includes("science fiction") },
    { name: "horror", present: query.includes("horror") },
    { name: "thriller", present: query.includes("thriller") },
    { name: "romance", present: query.includes("romance") },
    { name: "documentary", present: query.includes("documentary") },
    { name: "animation", present: query.includes("animation") || query.includes("animated") }
  ];

  // Get the detected genres
  const detectedGenres = genres.filter(g => g.present).map(g => g.name);
  
  // Define some movie recommendations by genre
  const recommendationsByGenre: Record<string, string[]> = {
    "action": ["The Dark Knight", "Mad Max: Fury Road", "John Wick", "Die Hard", "Mission: Impossible - Fallout"],
    "comedy": ["Superbad", "Bridesmaids", "The Grand Budapest Hotel", "Booksmart", "Dumb and Dumber"],
    "drama": ["The Shawshank Redemption", "The Godfather", "Schindler's List", "Parasite", "The Social Network"],
    "sci-fi": ["Blade Runner 2049", "Inception", "The Matrix", "Arrival", "Interstellar"],
    "horror": ["Hereditary", "Get Out", "The Shining", "A Quiet Place", "The Witch"],
    "thriller": ["Se7en", "Gone Girl", "Prisoners", "Zodiac", "No Country for Old Men"],
    "romance": ["Before Sunrise", "The Notebook", "La La Land", "Eternal Sunshine of the Spotless Mind", "When Harry Met Sally"],
    "documentary": ["Free Solo", "Won't You Be My Neighbor?", "Blackfish", "The Act of Killing", "Amy"],
    "animation": ["Spider-Man: Into the Spider-Verse", "Your Name", "Spirited Away", "WALL-E", "Coco"]
  };

  // If no specific genre is detected, provide a variety of recommendations
  if (detectedGenres.length === 0) {
    const allRecommendations = Object.values(recommendationsByGenre).flat();
    const randomRecommendations = allRecommendations
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    
    return `Based on your request, here are some movie recommendations across different genres:\n\n1. ${randomRecommendations[0]}\n2. ${randomRecommendations[1]}\n3. ${randomRecommendations[2]}\n4. ${randomRecommendations[3]}\n5. ${randomRecommendations[4]}\n\nAsk about a specific genre for more targeted recommendations!`;
  }
  
  // Combine recommendations from detected genres
  let allGenreRecommendations: string[] = [];
  detectedGenres.forEach(genre => {
    if (recommendationsByGenre[genre]) {
      allGenreRecommendations = [...allGenreRecommendations, ...recommendationsByGenre[genre]];
    }
  });
  
  // Select 5 random recommendations from the combined list
  const finalRecommendations = allGenreRecommendations
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
  
  const genreText = detectedGenres.length > 1 
    ? `${detectedGenres.slice(0, -1).join(', ')} and ${detectedGenres[detectedGenres.length - 1]}` 
    : detectedGenres[0];
  
  return `Based on your interest in ${genreText} movies, here are some recommendations:\n\n1. ${finalRecommendations[0]}\n2. ${finalRecommendations[1]}\n3. ${finalRecommendations[2]}\n4. ${finalRecommendations[3]}\n5. ${finalRecommendations[4]}`;
}

function generateTVRecommendation(query: string): string {
  // Extract genre information from the query
  const genres = [
    { name: "action", present: query.includes("action") },
    { name: "comedy", present: query.includes("comedy") },
    { name: "drama", present: query.includes("drama") },
    { name: "sci-fi", present: query.includes("sci-fi") || query.includes("science fiction") },
    { name: "horror", present: query.includes("horror") },
    { name: "thriller", present: query.includes("thriller") },
    { name: "romance", present: query.includes("romance") },
    { name: "documentary", present: query.includes("documentary") },
    { name: "animation", present: query.includes("animation") || query.includes("animated") }
  ];

  // Get the detected genres
  const detectedGenres = genres.filter(g => g.present).map(g => g.name);
  
  // Define some TV show recommendations by genre
  const recommendationsByGenre: Record<string, string[]> = {
    "action": ["The Boys", "Daredevil", "Game of Thrones", "The Mandalorian", "Vikings"],
    "comedy": ["The Office", "Brooklyn Nine-Nine", "Parks and Recreation", "Schitt's Creek", "Ted Lasso"],
    "drama": ["Breaking Bad", "The Wire", "The Crown", "Better Call Saul", "Succession"],
    "sci-fi": ["Stranger Things", "Westworld", "The Expanse", "Black Mirror", "Severance"],
    "horror": ["The Haunting of Hill House", "American Horror Story", "Hannibal", "Yellowjackets", "Midnight Mass"],
    "thriller": ["Mindhunter", "True Detective", "The Night Of", "Fargo", "Ozark"],
    "romance": ["Normal People", "Bridgerton", "Outlander", "Jane the Virgin", "Lovesick"],
    "documentary": ["Planet Earth", "Making a Murderer", "Tiger King", "The Last Dance", "Wild Wild Country"],
    "animation": ["BoJack Horseman", "Arcane", "Rick and Morty", "Attack on Titan", "Avatar: The Last Airbender"]
  };

  // If no specific genre is detected, provide a variety of recommendations
  if (detectedGenres.length === 0) {
    const allRecommendations = Object.values(recommendationsByGenre).flat();
    const randomRecommendations = allRecommendations
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    
    return `Here are some TV show recommendations across various genres:\n\n1. ${randomRecommendations[0]}\n2. ${randomRecommendations[1]}\n3. ${randomRecommendations[2]}\n4. ${randomRecommendations[3]}\n5. ${randomRecommendations[4]}\n\nFor more targeted recommendations, ask about a specific genre!`;
  }
  
  // Combine recommendations from detected genres
  let allGenreRecommendations: string[] = [];
  detectedGenres.forEach(genre => {
    if (recommendationsByGenre[genre]) {
      allGenreRecommendations = [...allGenreRecommendations, ...recommendationsByGenre[genre]];
    }
  });
  
  // Select 5 random recommendations from the combined list
  const finalRecommendations = allGenreRecommendations
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
  
  const genreText = detectedGenres.length > 1 
    ? `${detectedGenres.slice(0, -1).join(', ')} and ${detectedGenres[detectedGenres.length - 1]}` 
    : detectedGenres[0];
  
  return `Based on your interest in ${genreText} TV shows, here are some recommendations:\n\n1. ${finalRecommendations[0]}\n2. ${finalRecommendations[1]}\n3. ${finalRecommendations[2]}\n4. ${finalRecommendations[3]}\n5. ${finalRecommendations[4]}`;
}

function generatePersonInfo(query: string): string {
  // Simplified person information generator
  // In a real implementation, this would query a database or API
  
  const commonActors = [
    { name: "tom hanks", info: "Tom Hanks is an American actor known for Forrest Gump, Saving Private Ryan, and Cast Away. He's won two Academy Awards for Best Actor." },
    { name: "meryl streep", info: "Meryl Streep is considered one of the greatest actresses of her generation, with a record 21 Academy Award nominations and 3 wins." },
    { name: "leonardo dicaprio", info: "Leonardo DiCaprio is known for films like Titanic, The Revenant (for which he won an Oscar), and Inception." },
    { name: "jennifer lawrence", info: "Jennifer Lawrence rose to fame with The Hunger Games series and won an Oscar for Silver Linings Playbook." },
    { name: "denzel washington", info: "Denzel Washington is a highly acclaimed actor who has won two Academy Awards and is known for films like Training Day and Malcolm X." },
    { name: "christopher nolan", info: "Christopher Nolan is a director known for mind-bending films like Inception, Interstellar, and The Dark Knight trilogy." },
    { name: "steven spielberg", info: "Steven Spielberg is one of the most influential directors in film history, known for E.T., Jurassic Park, Schindler's List, and many more classics." },
    { name: "quentin tarantino", info: "Quentin Tarantino is known for his unique directing style in films like Pulp Fiction, Django Unchained, and Once Upon a Time in Hollywood." }
  ];
  
  const lowerCaseQuery = query.toLowerCase();
  
  for (const person of commonActors) {
    if (lowerCaseQuery.includes(person.name)) {
      return person.info;
    }
  }
  
  // If no specific person is matched
  return "I'd be happy to tell you about specific actors, actresses, or directors. Could you please mention their name more specifically? For example, 'Tell me about Christopher Nolan' or 'Who is Meryl Streep?'";
}

function generateGenreInfo(query: string): string {
  // Simplified genre information generator
  const genres = [
    { name: "action", info: "Action films are characterized by high energy, big-budget physical stunts and chases, battles, fights, and adventures. They tend to feature a resourceful hero struggling against incredible odds." },
    { name: "comedy", info: "Comedy films are designed to elicit laughter from the audience. Comedies center on a light-hearted plot, funny dialogues, and humorous situations." },
    { name: "drama", info: "Drama films are serious presentations or stories with settings or life situations that portray realistic characters in conflict with themselves, others, or forces of nature." },
    { name: "sci-fi", info: "Science fiction films are speculative in nature and often include advanced technology, space exploration, time travel, extraterrestrial life, or parallel dimensions." },
    { name: "horror", info: "Horror films are designed to frighten and panic viewers, causing dread and alarm. They often feature the supernatural, monsters, or psychological fears." },
    { name: "thriller", info: "Thriller films maintain heightened tension throughout. They typically involve plots with criminals, stalkers, or terrorists, with suspense being the primary design element." },
    { name: "romance", info: "Romance films focus on passion, emotion, and the affectionate romantic involvement of the main characters. The plot revolves around obstacles that must be overcome before the love is realized." },
    { name: "documentary", info: "Documentaries are non-fictional films intended to document reality, primarily for education, historical record, or instruction." },
    { name: "animation", info: "Animation films use multiple sequential images to simulate motion, often using drawn or painted images, computer graphics, or photographs of objects." }
  ];
  
  const lowerCaseQuery = query.toLowerCase();
  
  for (const genre of genres) {
    if (lowerCaseQuery.includes(genre.name)) {
      return genre.info;
    }
  }
  
  // If no specific genre is matched
  return "There are many film and TV genres including action, comedy, drama, sci-fi, horror, thriller, romance, documentary, and animation. Each has its own characteristics and conventions. Which specific genre would you like to know more about?";
}
