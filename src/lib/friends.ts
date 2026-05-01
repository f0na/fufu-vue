import type { FriendItem, FriendsResponse } from '@/lib/types/friend';
import * as friends_api from '@/lib/api/friends';

function map_api_friend(item: FriendItem): FriendItem {
  return {
    ...item,
    avatar: item.avatar_url || item.avatar,
  };
}

export async function get_friends(
  options: {
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
  } = {}
): Promise<FriendsResponse> {
  const { page = 1, limit = 10, sort = 'desc' } = options;

  const result = await friends_api.get_friends({ page, page_size: limit, status: 'approved' });

  let items = result.data.map(map_api_friend);

  items.sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return sort === 'desc' ? db - da : da - db;
  });

  return {
    friends: items,
    page: result.page,
    has_more: result.page < result.total_pages,
  };
}

export async function get_friend_by_id(id: string): Promise<FriendItem | null> {
  try {
    const friend = await friends_api.get_friend_by_id(id);
    return map_api_friend(friend);
  } catch {
    return null;
  }
}
