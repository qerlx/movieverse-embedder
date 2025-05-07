
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

export async function searchCollections(query: string) {
  try {
    const url = `https://api.themoviedb.org/3/search/collection?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
    const response = await fetch(url, API_OPTIONS);
    if (!response.ok) throw new Error(`Failed to search collections for "${query}"`);
    return await response.json();
  } catch (error) {
    console.error(`Error searching collections for "${query}":`, error);
    throw error;
  }
}

// Special function to fetch MCU collection
// Since MCU is a list (84979) and not a standard collection, we need to handle it differently
export async function fetchMCUCollection(): Promise<Collection> {
  try {
    // This is a placeholder - in a real implementation, you would either:
    // 1. Create a custom MCU collection on the backend
    // 2. Use a TMDB list and transform it to match the Collection type
    // For simplicity, we'll create a mock MCU collection here
    return {
      id: 84979,
      name: "Marvel Cinematic Universe",
      overview: "The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.",
      poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", // Iron Man poster as representative
      backdrop_path: "/rO0LncgjszG43IaPZnBJWPiNJgZ.jpg", // Classic Avengers backdrop
      parts: [
        // These would typically come from the actual API
        // Just including a few representative MCU films
        {
          id: 1726,
          title: "Iron Man",
          poster_path: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
          backdrop_path: "/rO0LncgjszG43IaPZnBJWPiNJgZ.jpg",
          release_date: "2008-05-02",
          overview: "Tony Stark builds an armored suit to fight the throes of evil.",
          vote_average: 7.6,
          vote_count: 25000,
          popularity: 80.5,
          adult: false,
          video: false,
          original_language: "en"
        },
        {
          id: 299536,
          title: "Avengers: Infinity War",
          poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
          backdrop_path: "/lmZFxXgJE3vgrciwuDib0N8CfQo.jpg",
          release_date: "2018-04-27",
          overview: "The Avengers must stop Thanos from collecting the Infinity Stones.",
          vote_average: 8.3,
          vote_count: 28000,
          popularity: 85.7,
          adult: false,
          video: false,
          original_language: "en"
        },
        {
          id: 299534,
          title: "Avengers: Endgame",
          poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
          backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
          release_date: "2019-04-26",
          overview: "The Avengers embark on a final mission to defeat Thanos once and for all.",
          vote_average: 8.4,
          vote_count: 24000,
          popularity: 90.2,
          adult: false,
          video: false,
          original_language: "en"
        }
      ]
    };
  } catch (error) {
    console.error("Error creating MCU collection:", error);
    throw error;
  }
}
