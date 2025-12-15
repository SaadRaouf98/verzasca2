import { ClassificationLevel } from '@core/enums/classification-level.enum';

export interface Classification {
  id: string;
  title: string;
  titleEn: string;
  isActive?: true;
  classificationLevel?: ClassificationLevel;
  userCount?: number;
}

export interface ClassificationDetails {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  isActive: true;
  classificationLevel: ClassificationLevel;
  password: string;
  classifiedUsers: {
    id: string;
    name: string;
  }[];
}

export interface ClassificationCommand {
  id?: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  classificationLevel: ClassificationLevel;
  isActive: true;
  usersId?: string[];
  password: string;
}

export interface AllClassifications {
  data: Classification[];
  totalCount: number;
  groupCount: number;
}
