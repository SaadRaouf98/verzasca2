export interface ExportedAttachmentType {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  isRequiredNumber: boolean;
}

export interface ExportedAttachmentTypeCommand {
  id?: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  isRequiredNumber: boolean;
}

export interface AllExportedAttachmentTypes {
  data: ExportedAttachmentType[];
  totalCount: number;
  groupCount: number;
}
