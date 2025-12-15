import { Actions } from '@core/enums/actions.enum';

export interface ActionModel {
  action: Actions;
  onClick?: (element: any) => {};
  onHover?:(element: any) => {};
  actionName?: string;
  isHidden?: boolean;
}
