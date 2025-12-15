export interface SubOrganizationUnit {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  parentId: string | null;
  parentName: string | null;
  parentNameEn: string | null;
  admin?: {
    id: string;
    name: string;
  };
  hasChildren: boolean;
}

export interface AllSubOrganizationUnits {
  data: SubOrganizationUnit[];
  totalCount: number;
  groupCount: number;
}
