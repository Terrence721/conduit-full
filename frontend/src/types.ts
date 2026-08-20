export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
  followersCount: number;
}

export interface ProfileResponse {
  profile: Profile;
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

export interface ArticleResponse {
  article: Article;
}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: Profile;
}

export interface User {
  username: string;
  bio: string | null;
  image: string | null;
  email: string;
  token: string;
}

export interface AuthState {
  headers: { Authorization: string } | null;
  isAuth: boolean;
  loggedUser: User;
}

export const emptyAuthState: AuthState = {
  headers: null,
  isAuth: false,
  loggedUser: {
    username: "",
    bio: null,
    image: null,
    email: "",
    token: "",
  },
};

export interface MessageResponse {
  message: { body: string[] };
}
