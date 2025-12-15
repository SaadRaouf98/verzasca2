export interface ItemTitleDto {
  id: string;
  title?: string;
}

export interface AttachmentInfoDto {
  id: string;
  name?: string;
  length: number;
  path?: string;
  contentType?: string;
}

export interface FoundationDto {
  id: string;
  title?: string;
  description?: string;
  titleEn?: string;
  descriptionEn?: string;
  sector: ItemTitleDto;
  subSector: ItemTitleDto;
  parentId?: string;
  hasChildren: boolean;
  isRC: boolean;
}

export interface FoundationDtoLoadResultDto {
  data: FoundationDto[];
  totalCount: number;
}

export interface RegulatoryDocumentsDto {
  id: string;
  title?: string;
  file: AttachmentInfoDto;
  thumbnail: AttachmentInfoDto;
  createdOn: string;
  isActive: boolean;
  category: ItemTitleDto;
}

export interface RegulatoryDocumentsDtoLoadResultDto {
  data: RegulatoryDocumentsDto[];
  totalCount: number;
}
