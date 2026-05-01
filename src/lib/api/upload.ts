import { ApiError } from '@/lib/api-client';

interface GitHubUploadResponse {
  content: {
    name: string;
    path: string;
    sha: string;
    size: number;
    download_url: string;
  };
  commit: { sha: string };
}

/**
 * Upload a file to GitHub repository using the GitHub API.
 * Returns the raw URL of the uploaded file.
 */
export async function upload_to_github(file: File): Promise<string> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const owner = import.meta.env.VITE_GITHUB_IMAGE_OWNER;
  const repo = import.meta.env.VITE_GITHUB_IMAGE_REPO;
  const base_path = import.meta.env.VITE_GITHUB_IMAGE_PATH || 'content/imgs';
  const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    throw new ApiError(400, undefined, 'GitHub upload is not configured. Set VITE_GITHUB_TOKEN, VITE_GITHUB_IMAGE_OWNER, and VITE_GITHUB_IMAGE_REPO in .env');
  }

  const ext = file.name.split('.').pop() || 'png';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${base_path}/${filename}`;

  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  const binary = Array.from(uint8).map((b) => String.fromCharCode(b)).join('');
  const base64 = btoa(binary);

  const body = {
    message: `Upload ${filename}`,
    content: base64,
    branch,
  };

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err_text = await res.text();
    throw new ApiError(res.status, undefined, `GitHub upload failed: ${err_text}`);
  }

  const data: GitHubUploadResponse = await res.json();
  return data.content.download_url;
}
