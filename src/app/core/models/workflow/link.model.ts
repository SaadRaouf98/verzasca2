import { ActionType } from '@core/enums/action-type.enum';

export interface Link {
  id: string; //it was optional
  source: string;
  target: string;
  label?: string;
  color: string;
  actions: LinkAction[];
}

export interface LinkAction {
  id: string;
  title: string;
  titleEn: string;
  schemaStepActionId?: string;
  actionType: ActionType;
  isSelected?: boolean;
}
