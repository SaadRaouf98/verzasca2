export interface DocumentLibrary {
  uniqueId: string;
  name: string;
  path: string;
  isDirectory: boolean;
  contentType: string;
  timeCreated: string;
  timeLastModified: string;
  authorName: string;
  subDirectoryCount: number;
  url: string;
}

export interface AllDocumentsLibrary {
  data: DocumentLibrary[];
  totalCount: number;
  groupCount: number;
}
