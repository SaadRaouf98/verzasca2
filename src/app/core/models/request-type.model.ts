export interface RequestType {
  id: string;
  title: string;
  titleEn: string;
  documentType: {
    id: string;
    title: string;
    titleEn: string;
  };
  uiForm: {
    id: string;
    title: string;
    titleEn: string;
  };
  schema: {
    id: string;
    title: string;
    titleEn: string;
  };
  classifications: {
    id: string;
    title: string;
    titleEn: string;
  }[];
  isTransaction: boolean;
}

export interface DetailedRequestType extends RequestType {
  description: string;
  descriptionEn: string;
}

export interface AllRequestTypes {
  data: RequestType[];
  totalCount: number;
  groupCount: number;
}

export interface RequestTypeCommand {
  id?: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  documentTypeId: string;
  uiFormId: string;
  schemaId: string;
  classifications: string[];
  isTransaction: boolean;
}

export interface RequestTypeForm {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  documentTypeId: string;
  uiFormId: string;
  schema: {
    id: string;
    title: string;
    titleEn: string;
  };
  classifications: {
    id: string;
    title: string;
    titleEn: string;
  }[];
  isTransaction: boolean;
}
