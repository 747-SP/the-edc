export interface Session {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
  expiresAt?: number;
}

export interface PostRecord {
  $type: string;
  text: string;
  embed?: {
    $type: string;
    images: Array<{
      image: { $type: string; blob: string };
      alt: string;
    }>;
  };
  tags?: string[];
}

export interface BlueskyPost {
  uri: string;
  cid: string;
  post: {
    record: PostRecord & { $type: string };
    author: {
      did: string;
      handle: string;
    };
    indexedAt: string;
  };
}

export interface CalendarDay {
  date: string; // ISO date string YYYY-MM-DD
  posts: BlueskyPost[];
}
