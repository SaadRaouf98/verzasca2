export interface Sector {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  hasChildren: boolean;
}

export interface SectorDetails {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  parentId: string | null;
  isRC: boolean;
}

export interface AllSectors {
  data: Sector[];
  totalCount: number;
  groupCount: number;
}

export interface SectorCommand {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  parentId: string | null;
}
