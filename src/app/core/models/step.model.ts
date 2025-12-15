export interface Step {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: {
    id: string;
    title: string;
    titleEn: string;
  };
}

export interface StepCommand {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  categoryId?: string;
}

export interface AllSteps {
  data: Step[];
  totalCount: number;
  groupCount: number;
}
