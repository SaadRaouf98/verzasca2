import {RegularReportBoardType} from '@core/enums/regular-report-board-type.enum';

export interface RegularReport {
  id: string;
  title: string;
  parentId: string;
  isActive: boolean;
  boardType: RegularReportBoardType;
  children?:any[];
  hasChildren?:boolean;
  // fileUrl: string;
  thumbnailUrl: string;
  contentType: string; //".pdf"
  date:string;
  data?:string;
  periodType?:number;
}

export interface Report {
  id: string;
  title: string;
  parent: {
    id: string;
    title: string;
  };
  file: {
    "name": string,
    "extension": string
  }
  isActive: boolean;
  boardType: number;
  path: string;
  contentType: string | null;
  thumbnailPath: string;
  committees: CommitteeItemDto[] | null;
}

export interface HolderRegularReport extends RegularReport {
  isSelected?: boolean;
}

export interface AllRegularReports {
  data: RegularReport[];
  totalCount: number;
  groupCount: number;
}

export interface AddRegularReportCommand {
  title: string;
  parentId: string;
  boardType: RegularReportBoardType;
  fileId: string;
  thumbnailId: string;
  isActive: boolean;
  committeesIds?: string[]
periodType: number;
}

export interface CommitteeItemDto {
  id: string;
  title: string;
  symbol: string;
  committeeSymbol?:string;
}
