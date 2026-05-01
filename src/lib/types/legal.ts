export interface LegalDocument {
  id: string;
  version: string;
  content: string;
  created_at: string;
}

export interface PrivacyDocument extends LegalDocument {
  date: string;
}
