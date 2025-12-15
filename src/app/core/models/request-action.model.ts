import { ActionType } from '@core/enums/action-type.enum';
import { Attachment } from './request.model';
import { RequestProgressType } from '@core/enums/request-progress-type.enum';

export interface RequestAction {
  id: string;
  requestId: string;
  title: string;
  description: string;
  titleEn: string;
  descriptionEn: string;
  durationInMinutes?: number;
  actionType: ActionType;
  user: {
    id: string;
    name: string;
  };
  date: string;
  hijriDate: string;
  comment: string | null;
  consultants: { id: string; name: string }[];
  studyingFile: Attachment | null;
  attachments: Attachment[];
  hasCommitteeApprovals: boolean;
  progressType: RequestProgressType;
}
