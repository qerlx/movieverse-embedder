
import { Movie, TVShow } from ".";

export interface Collection {
  id: number;
  name: string;
  description: string;
  backdrop_path: string | null;
  poster_path: string | null;
  items: (Movie | TVShow)[];
  created_by: {
    name: string;
    username: string;
  };
}

export interface MovieCollection {
  id: number;
  name: string;
  description: string;
  poster_path: string | null;
  backdrop_path: string | null;
  average_rating: number;
  item_count: number;
  first_release_date: string;
  last_release_date: string;
  movies: Movie[];
}

export interface CollectionListItem {
  id: number;
  name: string;
  description: string;
  poster_path: string | null;
  backdrop_path: string | null;
  item_count: number;
}
