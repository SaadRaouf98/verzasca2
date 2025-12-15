export interface ExportStatement {
  foundations: {
    id: string;
    title: string;
    titleEn: string;
  }[];

  file: {
    id: string;
    name: string;
    length: number;
    path: string;
    contentType: string;
  } | null;
  comment: string | null;
}
