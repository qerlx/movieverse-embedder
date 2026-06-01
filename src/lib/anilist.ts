/**
 * AniList GraphQL client - public API, no key required.
 * Docs: https://anilist.gitbook.io/anilist-apiv2-docs/
 */

const ENDPOINT = "https://graphql.anilist.co";

export interface AniMedia {
  id: number;
  idMal?: number | null;
  title: { romaji?: string; english?: string; native?: string };
  coverImage: { large?: string; extraLarge?: string; color?: string };
  bannerImage?: string | null;
  description?: string | null;
  episodes?: number | null;
  duration?: number | null;
  status?: string | null;
  season?: string | null;
  seasonYear?: number | null;
  startDate?: { year?: number; month?: number; day?: number };
  averageScore?: number | null;
  meanScore?: number | null;
  popularity?: number | null;
  genres?: string[];
  format?: string | null;
  studios?: { nodes: { name: string }[] };
  nextAiringEpisode?: { airingAt: number; episode: number; timeUntilAiring: number } | null;
  trailer?: { id: string; site: string; thumbnail?: string } | null;
}

const MEDIA_FRAGMENT = `
  id
  idMal
  title { romaji english native }
  coverImage { large extraLarge color }
  bannerImage
  episodes
  duration
  status
  season
  seasonYear
  averageScore
  meanScore
  popularity
  genres
  format
  startDate { year month day }
  nextAiringEpisode { airingAt episode timeUntilAiring }
`;

async function gql<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "AniList error");
  return json.data as T;
}

export interface AnimeListResult {
  Page: { pageInfo: { hasNextPage: boolean; total: number; currentPage: number }; media: AniMedia[] };
}

export type AnimeSort =
  | "TRENDING_DESC"
  | "POPULARITY_DESC"
  | "SCORE_DESC"
  | "FAVOURITES_DESC"
  | "START_DATE_DESC"
  | "UPDATED_AT_DESC";

export interface BrowseParams {
  page?: number;
  perPage?: number;
  sort?: AnimeSort | AnimeSort[];
  search?: string;
  genre?: string;
  season?: "WINTER" | "SPRING" | "SUMMER" | "FALL";
  seasonYear?: number;
  status?: "RELEASING" | "FINISHED" | "NOT_YET_RELEASED";
  format?: "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL";
}

export async function browseAnime(params: BrowseParams = {}) {
  const {
    page = 1,
    perPage = 24,
    sort = "POPULARITY_DESC",
    search,
    genre,
    season,
    seasonYear,
    status,
    format,
  } = params;

  const query = `
    query (
      $page: Int, $perPage: Int, $sort: [MediaSort],
      $search: String, $genre: String, $season: MediaSeason,
      $seasonYear: Int, $status: MediaStatus, $format: MediaFormat
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { hasNextPage total currentPage }
        media(
          type: ANIME, sort: $sort, search: $search, genre: $genre,
          season: $season, seasonYear: $seasonYear, status: $status, format: $format,
          isAdult: false
        ) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;
  const data = await gql<AnimeListResult>(query, {
    page,
    perPage,
    sort: Array.isArray(sort) ? sort : [sort],
    search: search || undefined,
    genre: genre || undefined,
    season,
    seasonYear,
    status,
    format,
  });
  return data.Page;
}

export async function getAnimeDetail(id: number): Promise<AniMedia & {
  relations?: any;
  recommendations?: { nodes: { mediaRecommendation: AniMedia }[] };
  characters?: any;
  studios?: { nodes: { name: string }[] };
  description?: string;
  trailer?: { id: string; site: string; thumbnail?: string };
}> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FRAGMENT}
        description(asHtml: false)
        studios(isMain: true) { nodes { name } }
        trailer { id site thumbnail }
        recommendations(perPage: 12, sort: RATING_DESC) {
          nodes { mediaRecommendation { ${MEDIA_FRAGMENT} } }
        }
      }
    }
  `;
  const data = await gql<{ Media: any }>(query, { id });
  return data.Media;
}

export const ANIME_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy",
  "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological",
  "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

export function getAnimeTitle(m: { title: AniMedia["title"] }): string {
  return m.title?.english || m.title?.romaji || m.title?.native || "Untitled";
}
