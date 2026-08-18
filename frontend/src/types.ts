export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
  followersCount: number;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}
