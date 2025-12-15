export interface Schema {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  isActive: string;
}

export interface SchemaCommand {
  id?: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  isActive: string;
}

export interface AllSchemas {
  data: Schema[];
  totalCount: number;
  groupCount: number;
}
