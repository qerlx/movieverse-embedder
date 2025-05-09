
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

// Function to fetch the MCU list from TMDb with the updated ID
export async function fetchMCUList() {
  try {
    // Use the MCU list ID: 84979
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

// Function to fetch DC Universe movies 
export async function fetchDCUList() {
  try {
    // Use DC Universe list ID: 3
    const url = 'https://api.themoviedb.org/3/list/3?language=en-US&page=1';
    const response = await fetch(url, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch DC Universe list');
    const data = await response.json();
    
    return {
      id: 3,
      name: "DC Universe",
      overview: "The DC Universe (DCU) is the shared universe where most stories in American comic book titles published by DC Comics take place.",
      poster_path: data.items[0]?.poster_path || "/aGp9V5O5ESJ0kQDTPVlCW0KBgch.jpg",
      backdrop_path: data.items[0]?.backdrop_path || "/2va32apQP97gvUxaMnL5wYIiMfS.jpg",
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
    console.error("Error fetching DC Universe list:", error);
    throw error;
  }
}

// Function to fetch Star Wars collection
export async function fetchStarWarsCollection() {
  try {
    // Combine Star Wars collections
    const [mainCollection, rogueOne, soloMovie] = await Promise.all([
      fetchCollection(10), // Main Star Wars Saga
      fetchCollection(330459), // Rogue One
      fetchCollection(404609), // Solo
    ]);
    
    // Combine into one mega collection
    return {
      id: 10,
      name: "Star Wars Universe",
      overview: "The Star Wars Universe encompasses multiple film series, standalone films, TV series, and more, all set in the iconic galaxy far, far away created by George Lucas.",
      poster_path: mainCollection.poster_path,
      backdrop_path: mainCollection.backdrop_path,
      parts: [
        ...mainCollection.parts,
        ...rogueOne.parts,
        ...soloMovie.parts
      ].sort((a, b) => {
        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
        return dateA - dateB;
      })
    };
  } catch (error) {
    console.error("Error fetching Star Wars collection:", error);
    throw error;
  }
}

// Function to fetch Pixar films
export async function fetchPixarCollection() {
  try {
    // Use a list for Pixar films - a curated list with ID 9463
    const url = 'https://api.themoviedb.org/3/list/9463?language=en-US&page=1';
    const response = await fetch(url, API_OPTIONS);
    if (!response.ok) throw new Error('Failed to fetch Pixar list');
    const data = await response.json();
    
    return {
      id: 9463,
      name: "Pixar Films",
      overview: "Collection of animated films produced by Pixar Animation Studios, known for their groundbreaking computer animation and heartfelt storytelling.",
      poster_path: data.items[0]?.poster_path || "/9pZvf3FkeiZpIwMurYMpNKgs5JC.jpg",
      backdrop_path: data.items[0]?.backdrop_path || "/uUiId6cG32JSRI6RyBQSvQtLjz2.jpg",
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
    console.error("Error fetching Pixar collection:", error);
    throw error;
  }
}
