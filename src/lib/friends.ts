import type { FriendItem, FriendsResponse } from '@/lib/types/friend';

/**
 * 从 public/content/friends/friends.json 读取友链数据
 */
async function read_friends_from_file(): Promise<FriendItem[]> {
  try {
    const res = await fetch('/content/friends/friends.json');
    if (!res.ok) return [];
    const data = await res.json();
    const items: FriendItem[] = Array.isArray(data.friends) ? data.friends : [];
    // 公开页面只显示已通过审核的友链
    return items.filter((f) => f.status === 'approved');
  } catch {
    return [];
  }
}

/**
 * 获取所有友链
 */
async function fetch_all_friends(): Promise<FriendItem[]> {
  return read_friends_from_file();
}

/**
 * 获取友链列表（支持分页和筛选）
 */
export async function get_friends(
  options: {
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
  } = {}
): Promise<FriendsResponse> {
  const { page = 1, limit = 10, sort = 'desc' } = options;

  const friends = await fetch_all_friends();

  friends.sort((a, b) => {
    const date_a = new Date(a.created_at).getTime();
    const date_b = new Date(b.created_at).getTime();
    return sort === 'desc' ? date_b - date_a : date_a - date_b;
  });

  const start_index = (page - 1) * limit;
  const end_index = start_index + limit;
  const paginated_friends = friends.slice(start_index, end_index);
  const has_more = end_index < friends.length;

  return {
    friends: paginated_friends,
    page,
    has_more,
  };
}

/**
 * 根据 ID 获取单个友链
 */
export async function get_friend_by_id(id: string): Promise<FriendItem | null> {
  const friends = await fetch_all_friends();
  return friends.find((friend) => friend.id === id) || null;
}
