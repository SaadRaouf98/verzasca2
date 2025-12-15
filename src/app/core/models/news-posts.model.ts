import { SafeHtml } from '@angular/platform-browser';

export interface NewsPost {
  id: string;
  title: string;
  definition: string;
  content: string;
  imagePath: string;
  creator: string;
  isVisible: boolean;
  createdOn: string;
}

export interface LatestNewsDetails {
  id: string;
  title: string;
  definition: string;
  content: string;
  imagePath: string;
  isVisible: boolean;
  creator: string;
}

export interface LatestNewsCommand {
  id?: string;
  title: string;
  definition: string;
  content: string;
  image?: File;
  isVisible: boolean;
}

export interface AllLatestNews {
  data: NewsPost[];
  totalCount: number;
  groupCount: number;
}

export interface VisibleNewsPost {
  id: string;
  title: string;
  definition: string;
  content: string;
  imagePath: string;
  createdOn: string;
}

export interface AllVisibleLatestNews {
  data: VisibleNewsPost[];
  totalCount: number;
  groupCount: number;
}
