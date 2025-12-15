export interface Priority {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  duration: number;
}

export interface AllPriorities {
  data: Priority[];
  totalCount: number;
  groupCount: number;
}
