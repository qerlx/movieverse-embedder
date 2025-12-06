import { Collection } from "@/types";

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQzYzU2N2ZhZTk3Y2JlZGM0OGQ1YWQ0Yjg5M2YzMSIsIm5iZiI6MTc0MTc1NzA2NC43MzMsInN1YiI6IjY3ZDExYTg4MTM5OTBhMDU4YjYwYWExMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PfUfbFyxCtI3bJehMrDRUuuKOPp58WC-_4B4aUovCyA";

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

export async function fetchCollection(id: number): Promise<Collection> {
  const url = `https://api.themoviedb.org/3/collection/${id}?language=en-US`;
  const response = await fetch(url, API_OPTIONS);
  if (!response.ok) throw new Error(`Failed to fetch collection ${id}`);
  return await response.json();
}

// 75+ TMDb collections - Netflix-style premium collections
export const COLLECTION_IDS = [
  // Marvel Universe
  { id: 86311, name: "The Avengers Collection" },
  { id: 2344, name: "Spider-Man Collection" },
  { id: 131292, name: "Deadpool Collection" },
  { id: 127635, name: "Black Panther Collection" },
  { id: 131295, name: "Iron Man Collection" },
  { id: 623911, name: "Thor Collection" },
  { id: 403374, name: "Captain America Collection" },
  { id: 284433, name: "Guardians of the Galaxy Collection" },
  { id: 131296, name: "X-Men Collection" },
  { id: 529892, name: "Wolverine Collection" },
  { id: 573693, name: "Ant-Man Collection" },
  { id: 453993, name: "Doctor Strange Collection" },
  
  // DC Universe  
  { id: 556, name: "Batman Collection" },
  { id: 263, name: "The Dark Knight Collection" },
  { id: 209131, name: "Justice League Collection" },
  { id: 573436, name: "Aquaman Collection" },
  { id: 618529, name: "Wonder Woman Collection" },
  { id: 295130, name: "Suicide Squad Collection" },
  { id: 531242, name: "Shazam Collection" },
  
  // Action & Adventure
  { id: 131635, name: "John Wick Collection" },
  { id: 87096, name: "Mission Impossible Collection" },
  { id: 948, name: "The Fast & Furious Collection" },
  { id: 234, name: "The Matrix Collection" },
  { id: 262, name: "James Bond Collection" },
  { id: 8537, name: "Pirates of the Caribbean Collection" },
  { id: 8091, name: "The Terminator Collection" },
  { id: 535790, name: "The Equalizer Collection" },
  { id: 256322, name: "The Expendables Collection" },
  { id: 295270, name: "Kingsman Collection" },
  { id: 645, name: "Taken Collection" },
  
  // Fantasy & Sci-Fi
  { id: 9485, name: "Harry Potter Collection" },
  { id: 10, name: "Star Wars Collection" },
  { id: 1241, name: "The Lord of the Rings Collection" },
  { id: 8945, name: "The Hobbit Collection" },
  { id: 328, name: "Jurassic Park Collection" },
  { id: 827, name: "Alien Collection" },
  { id: 1710, name: "Blade Runner Collection" },
  { id: 726871, name: "Dune Collection" },
  { id: 1575, name: "Star Trek Collection" },
  { id: 86066, name: "Transformers Collection" },
  { id: 535313, name: "Godzilla Collection" },
  { id: 748783, name: "MonsterVerse Collection" },
  { id: 115570, name: "Planet of the Apes Reboot" },
  { id: 121938, name: "Venom Collection" },
  
  // Horror & Thriller
  { id: 87359, name: "The Conjuring Universe" },
  { id: 115575, name: "IT Collection" },
  { id: 91697, name: "The Purge Collection" },
  { id: 2980, name: "Halloween Collection" },
  { id: 656, name: "Saw Collection" },
  { id: 404609, name: "A Quiet Place Collection" },
  { id: 528, name: "Nightmare on Elm Street" },
  { id: 520, name: "Friday the 13th Collection" },
  { id: 2467, name: "Scream Collection" },
  { id: 495527, name: "Insidious Collection" },
  
  // Animation & Family
  { id: 10194, name: "Toy Story Collection" },
  { id: 32886, name: "Shrek Collection" },
  { id: 53159, name: "Despicable Me Collection" },
  { id: 91361, name: "Kung Fu Panda Collection" },
  { id: 386382, name: "Sonic the Hedgehog Collection" },
  { id: 8650, name: "Cars Collection" },
  { id: 173710, name: "Finding Nemo Collection" },
  { id: 1709, name: "The Incredibles Collection" },
  { id: 264, name: "Madagascar Collection" },
  { id: 137696, name: "Hotel Transylvania Collection" },
  { id: 9818, name: "Ice Age Collection" },
  { id: 750822, name: "Trolls Collection" },
  { id: 404825, name: "Secret Life of Pets" },
  { id: 292, name: "How to Train Your Dragon" },
  { id: 445791, name: "Frozen Collection" },
  { id: 430, name: "Monsters, Inc. Collection" },
  
  // Drama & Crime
  { id: 230, name: "The Godfather Collection" },
  { id: 105995, name: "Creed Collection" },
  { id: 422837, name: "Knives Out Collection" },
  { id: 1575, name: "Rocky Collection" },
  { id: 14563, name: "The Hunger Games Collection" },
  { id: 119050, name: "Maze Runner Collection" },
  { id: 131635, name: "Divergent Collection" },
];

export async function fetchAllCollections(): Promise<Collection[]> {
  const collections = await Promise.all(
    COLLECTION_IDS.map(async ({ id }) => {
      try {
        return await fetchCollection(id);
      } catch (error) {
        console.error(`Failed to fetch collection ${id}:`, error);
        return null;
      }
    })
  );
  
  return collections.filter((c): c is Collection => c !== null);
}

// Load collection data by ID (for CollectionDetail page)
export async function loadCollectionData(id: string): Promise<Collection | null> {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return null;
  
  try {
    return await fetchCollection(numericId);
  } catch (error) {
    console.error(`Error loading collection ${id}:`, error);
    return null;
  }
}
