export interface Entity {
  id: string;
  isDefault?: boolean;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
}

export interface AllEntities {
  data: Entity[];
  totalCount: number;
  groupCount: number;
}
