export type FriendStatus = 'pending' | 'approved' | 'rejected';

export interface FriendItem {
  id: string;
  name: string;
  url: string;
  avatar_url?: string;
  avatar?: string;
  description?: string;
  email?: string;
  status: FriendStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FriendCreate {
  name: string;
  url: string;
  avatar_url?: string;
  description?: string;
  email?: string;
}

export interface FriendUpdate {
  name?: string;
  url?: string;
  avatar_url?: string;
  description?: string;
  email?: string;
  sort_order?: number;
}

export interface FriendStatusUpdate {
  status: 'approved' | 'rejected';
}

export interface FriendsResponse {
  friends: FriendItem[];
  page: number;
  has_more: boolean;
}
