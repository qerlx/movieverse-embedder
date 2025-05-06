
import { API_OPTIONS, TMDB_BASE_URL } from "../api";
import { Collection, MovieCollection, CollectionListItem } from "@/types/collections";
import { Movie } from "@/types";

// Get a TMDb list by ID (e.g., MCU Collection is list 84979)
export const getCollection = async (listId: number): Promise<Collection> => {
  try {
    console.log(`Fetching collection with list ID: ${listId}`);
    const response = await fetch(`${TMDB_BASE_URL}/list/${listId}`, API_OPTIONS);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch collection: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching collection:', error);
    throw error;
  }
};

// Process a raw collection into a more usable format with calculated stats
export const processCollection = (collection: Collection): MovieCollection => {
  const movies = collection.items.filter(item => 'title' in item) as Movie[];
  
  // Calculate average rating
  const totalRating = movies.reduce((sum, movie) => sum + movie.vote_average, 0);
  const averageRating = movies.length > 0 ? parseFloat((totalRating / movies.length).toFixed(1)) : 0;
  
  // Get release date range
  const sortedByDate = [...movies].sort((a, b) => {
    const dateA = new Date(a.release_date || "").getTime();
    const dateB = new Date(b.release_date || "").getTime();
    return dateA - dateB;
  });
  
  const firstReleaseDate = sortedByDate[0]?.release_date || "";
  const lastReleaseDate = sortedByDate[sortedByDate.length - 1]?.release_date || "";
  
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    poster_path: collection.poster_path,
    backdrop_path: collection.backdrop_path,
    average_rating: averageRating,
    item_count: movies.length,
    first_release_date: firstReleaseDate,
    last_release_date: lastReleaseDate,
    movies: sortedByDate
  };
};

// Get popular movie collections
export const getPopularCollections = async (): Promise<CollectionListItem[]> => {
  // For now, return hardcoded collections to avoid API rate limits
  // In a production app, this would fetch from the API
  return [
    {
      id: 84979,
      name: "Marvel Cinematic Universe",
      description: "The Marvel Cinematic Universe (MCU) films are a series of American superhero films produced by Marvel Studios based on characters that appear in publications by Marvel Comics.",
      poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
      backdrop_path: "/vbY95t58MDArtyUXUIb8Fx1dCry.jpg",
      item_count: 32
    },
    {
      id: 86311,
      name: "Star Wars Collection",
      description: "An epic space opera film series created by George Lucas, centered on the Skywalker family and their journey in a galaxy far, far away.",
      poster_path: "/xfA9wORKdCqCUEuPUctHFxUhqLN.jpg",
      backdrop_path: "/zqkmTXzjkAgXmEWLRsY4UpTWCeo.jpg",
      item_count: 9
    },
    {
      id: 645,
      name: "James Bond Collection",
      description: "A British secret agent working for MI6 under the codename 007. Based on the novel series by Ian Fleming.",
      poster_path: "/9MI0TgawN5PxHzxIUW0Y3Ybmsw6.jpg",
      backdrop_path: "/jPu8yiadqgzwecf0sSpcbZREbWB.jpg",
      item_count: 26
    },
    {
      id: 10,
      name: "Harry Potter Collection",
      description: "The magical adventures of the boy who lived, based on J.K. Rowling's globally beloved series.",
      poster_path: "/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg",
      backdrop_path: "/vbY95t58MDArtyUXUIb8Fx1dCry.jpg",
      item_count: 8
    },
    {
      id: 87096,
      name: "Mission: Impossible Collection",
      description: "An American action spy film series based on the television series of the same name, following IMF agent Ethan Hunt.",
      poster_path: "/geEjCGfdmRAA1skCvznmiun4SKI.jpg",
      backdrop_path: "/628Dep6AxEtDxjZoGP78TsOxXhL.jpg", 
      item_count: 6
    },
    {
      id: 295,
      name: "Pirates of the Caribbean Collection",
      description: "A series of fantasy swashbuckler films produced by Jerry Bruckheimer and based on Walt Disney's theme park attraction.",
      poster_path: "/uRPGZIZ7Jpu9QvUHcEjx3VVzm57.jpg",
      backdrop_path: "/wUBy3Hb2U9P0C2bYQHeZ5D9MiyQ.jpg",
      item_count: 5
    }
  ];
};

// Create a dedicated function to fetch the MCU collection directly
export const getMCUCollection = async (): Promise<MovieCollection> => {
  try {
    const MCU_COLLECTION_ID = 84979;
    const collection = await getCollection(MCU_COLLECTION_ID);
    return processCollection(collection);
  } catch (error) {
    console.error('Error fetching MCU collection:', error);
    throw error;
  }
};
