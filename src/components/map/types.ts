export interface SpotAuthor {
  full_name: string | null;
  username: string | null;
}

export interface SpotWithAuthor {
  id: string;
  name: string;
  description: string | null;
  fish_types: string[];
  is_public: boolean;
  latitude: number | null;
  longitude: number | null;
  user_id: string;
  author: SpotAuthor | null;
}
