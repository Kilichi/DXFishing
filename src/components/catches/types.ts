export interface CatchAuthor {
  full_name: string | null;
  username: string | null;
}

export interface CatchWithAuthor {
  id: string;
  species: string;
  weight_kg: number | null;
  length_cm: number | null;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  caught_at: string;
  user_id: string;
  spot_id: string | null;
  author: CatchAuthor | null;
}

export const CATCHES_PAGE_SIZE = 20;
