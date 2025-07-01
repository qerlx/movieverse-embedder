
import { Collection } from "@/types";

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQzYzU2N2ZhZTk3Y2JlZGM0OGQ1YWQ0Yjg5M2YzMSIsIm5iZiI6MTc0MTc1NzA2NC43MzMsInN1YiI6IjY3ZDExYTg4MTM5OTBhMDU4YjYwYWExMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PfUfbFyxCtI3bJehMrDRUuuKOPp58WC-_4B4aUovCyA'
  }
};

export async function fetchCollection(id: number): Promise<Collection> {
  try {
    const url = `https://api.themoviedb.org/3/collection/${id}?language=en-US`;
    const response = await fetch(url, API_OPTIONS);
    if (!response.ok) throw new Error(`Failed to fetch collection ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching collection ${id}:`, error);
    throw error;
  }
}

export async function fetchMCUCollection(): Promise<Collection> {
  try {
    // Use the official MCU collection ID: 131295 (The Marvel Cinematic Universe)
    const collectionId = 131295;
    let collection = await fetchCollection(collectionId);
    
    // If the main collection doesn't have enough movies, supplement with additional MCU collections
    if (!collection.parts || collection.parts.length < 20) {
      console.log("Fetching additional MCU movies from multiple collections...");
      
      // Known MCU collection IDs
      const mcuCollectionIds = [
        131295, // The Marvel Cinematic Universe
        131296, // The Infinity Saga
        623911, // Phase One
        623912, // Phase Two  
        623913  // Phase Three
      ];
      
      const allMovies = new Map();
      
      // Add movies from main collection first
      if (collection.parts) {
        collection.parts.forEach(movie => {
          allMovies.set(movie.id, movie);
        });
      }
      
      // Fetch from other collections
      for (const id of mcuCollectionIds.slice(1)) {
        try {
          const additionalCollection = await fetchCollection(id);
          if (additionalCollection.parts) {
            additionalCollection.parts.forEach(movie => {
              // Only add if it's not already in our collection
              if (!allMovies.has(movie.id)) {
                allMovies.set(movie.id, movie);
              }
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch collection ${id}:`, error);
        }
      }
      
      // Convert back to array and sort by release date
      collection.parts = Array.from(allMovies.values()).sort((a, b) => {
        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
        return dateA - dateB;
      });
    }
    
    // Enhance the collection with better metadata
    return {
      ...collection,
      name: "Marvel Cinematic Universe",
      overview: collection.overview || "The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios. The films are based on characters that appear in American comic books published by Marvel Comics.",
      poster_path: collection.poster_path || "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
      backdrop_path: collection.backdrop_path || "/rO0LncgjszG43IaPZnBJWPiNJgZ.jpg"
    };
  } catch (error) {
    console.error("Error fetching MCU collection:", error);
    
    // Fallback: try to use the list approach if collection fails
    try {
      console.log("Trying fallback MCU list approach...");
      return await fetchMCUList();
    } catch (listError) {
      console.error("Fallback MCU list also failed:", listError);
      throw new Error("Failed to fetch MCU collection and fallback list");
    }
  }
}

// Collection definitions for the app
export const collections = [
  {
    id: 'mcu',
    name: 'Marvel Cinematic Universe',
    description: 'The complete Marvel Cinematic Universe collection featuring all MCU movies in chronological order.',
    type: 'movie' as const,
    fetchFunction: fetchMCUCollection
  },
  {
    id: 'jurassic-park',
    name: 'Jurassic Park Collection',
    description: 'Experience the wonder and terror of dinosaurs with the complete Jurassic Park franchise.',
    type: 'movie' as const,
    fetchFunction: () => fetchCollection(328) // Jurassic Park Collection ID
  },
  {
    id: 'star-wars',
    name: 'Star Wars Collection',
    description: 'A long time ago in a galaxy far, far away... The complete Star Wars saga.',
    type: 'movie' as const,
    fetchFunction: () => fetchCollection(10) // Star Wars Collection ID
  },
  {
    id: 'fast-furious',
    name: 'Fast & Furious Collection',
    description: 'High-octane action and family bonds in the Fast & Furious franchise.',
    type: 'movie' as const,
    fetchFunction: () => fetchCollection(9485) // Fast & Furious Collection ID
  },
  {
    id: 'harry-potter',
    name: 'Harry Potter Collection',
    description: 'Enter the magical world of Hogwarts with Harry Potter and his friends.',
    type: 'movie' as const,
    fetchFunction: () => fetchCollection(1241) // Harry Potter Collection ID
  },
  {
    id: 'lord-of-rings',
    name: 'The Lord of the Rings Collection',
    description: 'Epic fantasy adventure through Middle-earth in the Lord of the Rings trilogy.',
    type: 'movie' as const,
    fetchFunction: () => fetchCollection(119) // Lord of the Rings Collection ID
  },
  {
    id: 'batman-dark-knight',
    name: 'The Dark Knight Collection',
    description: 'Christopher Nolan\'s acclaimed Dark Knight trilogy.',
    type: 'movie' as const,
    fetchFunction: () => fetchCollection(263) // The Dark Knight Collection ID
  },
  {
    id: 'top-rated',
    name: 'Top Rated Movies',
    description: 'The highest rated movies of all time according to critics and audiences.',
    type: 'movie' as const,
    fetchFunction: async () => {
      const response = await fetch('https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1', {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQzYzU2N2ZhZTk3Y2JlZGM0OGQ1YWQ0Yjg5M2YzMSIsIm5iZiI6MTc0MTc1NzA2NC43MzMsInN1YiI6IjY3ZDExYTg4MTM5OTBhMDU4YjYwYWExMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PfUfbFyxCtI3bJehMrDRUuuKOPp58WC-_4B4aUovCyA'
        }
      });
      return await response.json();
    }
  }
];

// Fallback function to fetch the MCU list from TMDb
export async function fetchMCUList(): Promise<Collection> {
  try {
    // Use a more reliable MCU list ID or create from search
    const searchUrl = 'https://api.themoviedb.org/3/search/collection?query=marvel%20cinematic%20universe&language=en-US&page=1';
    const searchResponse = await fetch(searchUrl, API_OPTIONS);
    
    if (!searchResponse.ok) throw new Error('Failed to search for MCU collections');
    const searchData = await searchResponse.json();
    
    // Find the best MCU collection from search results
    const mcuCollection = searchData.results?.find((collection: any) => 
      collection.name.toLowerCase().includes('marvel cinematic universe') ||
      collection.name.toLowerCase().includes('infinity saga')
    );
    
    if (mcuCollection) {
      return await fetchCollection(mcuCollection.id);
    }
    
    // If search fails, use the list approach as final fallback
    const url = 'https://api.themoviedb.org/3/list/1?language=en-US&page=1';
    const response = await fetch(url, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch MCU list');
    const data = await response.json();
    
    // Transform the list data into Collection format
    return {
      id: 131295,
      name: "Marvel Cinematic Universe",
      overview: "The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.",
      poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
      backdrop_path: "/rO0LncgjszG43IaPZnBJWPiNJgZ.jpg",
      parts: data.items?.map((item: any) => ({
        id: item.id,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.release_date,
        overview: item.overview,
        vote_average: item.vote_average,
        vote_count: item.vote_count || 0,
        popularity: item.popularity || 0,
        adult: item.adult || false,
        video: item.video || false,
        original_language: item.original_language || "en"
      })) || []
    };
  } catch (error) {
    console.error("Error fetching MCU list:", error);
    throw error;
  }
}
