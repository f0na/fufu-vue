export interface LikeResponse {
  count: number;
  liked: boolean;
}

export type LikeTargetType = 'post' | 'site';
