export interface GalleryPhoto {
  id: string;
  gallery_id: string;
  path: string;
  created_at: string;
  deleted_at: string | null;
}

export interface Gallery {
  id: string;
  title: string;
  cover_path: string;
  tags: string[];
  photos: string[] | GalleryPhoto[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GalleryCreate {
  title: string;
  cover_path?: string;
  tags?: string[];
}

export interface GalleryUpdate {
  title?: string;
  cover_path?: string;
  tags?: string[];
}

export interface PhotosCreate {
  paths: string[];
}

export interface PhotoState {
  id: string;
  x: number;
  y: number;
  rotation: number;
  z_index: number;
}
