export type FriendStatus = 'pending' | 'approved' | 'rejected';

export interface FriendItem {
  id: string;
  name: string;
  url: string;
  avatar?: string;
  description?: string;
  created_at: string;
  status?: FriendStatus;
}

export interface FriendsResponse {
  friends: FriendItem[];
  page: number;
  has_more: boolean;
}
