export interface Documenttype {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  isSystematic: true;
}

export interface AllDocumentTypes {
  data: Documenttype[];
  totalCount: number;
  groupCount: number;
}
