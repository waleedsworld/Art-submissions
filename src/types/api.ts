
export interface ImageUploadResponse {
  id: string;
}

export interface UnmarkedImage {
  id: string;
  datefield: string;
  timestamp: string;
}

export interface ImageRecord {
  id: string;
  timestamp: string;
  datefield: string;
  marking: boolean | null;
}
