import { ActionType } from '@core/enums/action-type.enum';
import { NodeType } from '@core/enums/node-type.enum';

export interface Node {
  id: string;
  isLeaf?: boolean;
  parentId?: string; //In case of the root node, We don't add this property to the node object
  position?: NodePosition;
  dimension?: NodeDimension;
  label: string;
  transform?: string;
  meta?: { forceDimensions: boolean };
  data: {
    id: string | null; //We depend on this value only when we user enters node's data nd clicks on submit button and we need to know if user creating the node for first time or he updates it
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    step?: { id: string; title: string; titleEn: string };
    committee?: {
      id: string;
      title: string;
      titleEn: string;
      committeeSymbol: string;
    };
    actor?: { id: string; title: string; titleEn: string };

    actions?: NodeAction[];
    category: NodeType;
    color: string;
  };
  layoutOptions?: any;
}

export interface NodePosition {
  x: number;
  y: number;
}
export interface NodeDimension {
  width: number;
  height: number;
}

export interface ClusterNode extends Node {
  childNodeIds?: string[];
}
export interface CompoundNode extends Node {
  childNodeIds?: string[];
}

export interface NodeAction {
  id: string;
  schemaStepActionId: string;
  title: string;
  titleEn: string;
  isSelected: boolean;
  actionType: ActionType;
}
