
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
  // MCU movies in chronological timeline order - only verified MCU films
  const mcuMovieIds = [
    1771,    // Captain America: The First Avenger (2011)
    102382,  // Captain Marvel (2019) - set in 1995
    1726,    // Iron Man (2008)
    10138,   // Iron Man 2 (2010) 
    10195,   // Thor (2011)
    24428,   // The Avengers (2012)
    68721,   // Iron Man 3 (2013)
    76338,   // Thor: The Dark World (2013)
    1865,    // Captain America: The Winter Soldier (2014)
    118340,  // Guardians of the Galaxy (2014)
    99861,   // Avengers: Age of Ultron (2015)
    76341,   // Ant-Man (2015)
    271110,  // Captain America: Civil War (2016)
    284052,  // Doctor Strange (2016)
    283995,  // Guardians of the Galaxy Vol. 2 (2017)
    348350,  // Spider-Man: Homecoming (2017)
    284053,  // Thor: Ragnarok (2017)
    281957,  // Black Panther (2018)
    299536,  // Avengers: Infinity War (2018)
    363088,  // Ant-Man and the Wasp (2018)
    299534,  // Avengers: Endgame (2019)
    429617,  // Spider-Man: Far From Home (2019)
    505642,  // Black Widow (2021)
    566525,  // Shang-Chi and the Legend of the Ten Rings (2021)
    524434,  // Eternals (2021)
    634649,  // Spider-Man: No Way Home (2021)
    453395,  // Doctor Strange in the Multiverse of Madness (2022)
    616037,  // Thor: Love and Thunder (2022)
    507086,  // Black Panther: Wakanda Forever (2022)
    640146,  // Ant-Man and the Wasp: Quantumania (2023)
    447365,  // Guardians of the Galaxy Volume 3 (2023)
    609681,  // The Marvels (2023)
  ];

  try {
    const moviePromises = mcuMovieIds.map(async (movieId) => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, API_OPTIONS);
        if (response.ok) {
          return await response.json();
        }
        return null;
      } catch (error) {
        console.warn(`Failed to fetch movie ${movieId}:`, error);
        return null;
      }
    });

    const movies = await Promise.all(moviePromises);
    const validMovies = movies.filter(movie => movie !== null);

    return {
      id: 131295,
      name: "Marvel Cinematic Universe",
      overview: "The Marvel Cinematic Universe (MCU) is an American media franchise and shared universe centered on a series of superhero films produced by Marvel Studios. Experience the complete MCU saga in chronological timeline order.",
      poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
      backdrop_path: "/rO0LncgjszG43IaPZnBJWPiNJgZ.jpg",
      parts: validMovies
    };
  } catch (error) {
    console.error("Error fetching MCU collection:", error);
    throw new Error("Failed to fetch MCU collection");
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

// Get collection by ID
export function getCollectionById(id: string) {
  return collections.find(collection => collection.id === id);
}

// Load collection data by ID
export async function loadCollectionData(id: string): Promise<Collection | null> {
  const collection = getCollectionById(id);
  if (!collection) return null;
  
  try {
    const data = await collection.fetchFunction();
    // Handle different response structures
    const items = data?.results || data?.parts || data || [];
    return {
      ...data,
      id: collection.id,
      name: collection.name,
      description: collection.description,
      parts: items
    };
  } catch (error) {
    console.error(`Error loading collection ${id}:`, error);
    throw error;
  }
}

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
