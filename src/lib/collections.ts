
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

// Function to fetch the MCU list from TMDb with the updated ID
export async function fetchMCUList() {
  try {
    // Use the correct MCU list ID: 84979
    const url = 'https://api.themoviedb.org/3/list/84979?language=en-US&page=1';
    const response = await fetch(url, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch MCU list');
    const data = await response.json();
    
    // Transform the list data into Collection format for consistency
    return {
      id: 84979,
      name: "Marvel Cinematic Universe",
      overview: "The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios.",
      poster_path: data.items[0]?.poster_path || "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
      backdrop_path: data.items[0]?.backdrop_path || "/rO0LncgjszG43IaPZnBJWPiNJgZ.jpg",
      parts: data.items.map(item => ({
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
      }))
    };
  } catch (error) {
    console.error("Error fetching MCU list:", error);
    throw error;
  }
}
