export interface Foundation {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  hasChildren: boolean;
  sectorId?: string;
}

export interface FoundationDetails {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  parentId: string | null;
  isRC: boolean;
  sector?: { id: string; title: string };
  subSector?: { id: string; title: string };
}

export interface AllFoundations {
  data: Foundation[];
  totalCount: number;
  groupCount: number;
}

export interface FoundationCommand {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  parentId: string | null;
  sector?: { id: string; title: string };
  subSector?: { id: string; title: string };
}
