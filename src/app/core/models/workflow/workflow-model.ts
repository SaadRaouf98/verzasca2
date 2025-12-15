import { NodeType } from '@core/enums/node-type.enum';
import { Link } from './link.model';
import { Node } from './node.model';

export interface WorkflowNodeForm {
  id?: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  step: { id: string; title: string; titleEn: string };
  committee?: {
    id: string;
    title: string;
    titleEn: string;
    committeeSymbol: string;
  };
  actor: { id: string; title: string; titleEn: string };
  actions: { id: string; title: string; titleEn: string }[];
}

export interface Workflow {
  nodes: Node[];
  links: Link[];
  title: string;
  titleEn: string;
}

export interface AddNodeCommand {
  schemaStepActionsIds: string[];
  node: {
    id: string;
    parentId?: string;
    position?: {
      x: number;
      y: number;
    };
    dimension?: {
      width: number;
      height: number;
    };
    label: string;
    transform?: string;
    meta?: {
      forceDimensions: boolean;
    };
    data: {
      id: string | null;
      title: string;
      titleEn: string;
      description: string;
      descriptionEn: string;
      stepId: string;
      committeeId: string | null;
      actorId: string;
      actions: {
        id: string;
        title: string;
        titleEn: string;
        schemaStepActionId: string;
        isSelected: boolean;
      }[];
      category: NodeType;
      color: string;
    };
  };
}

export interface UpdateNodeCommand {
  id: string;
  parentId?: string;
  position?: {
    x: number;
    y: number;
  };
  dimension?: {
    width: number;
    height: number;
  };
  label: string;
  transform?: string;
  meta?: {
    forceDimensions: boolean;
  };
  data: {
    id: string | null;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    stepId: string;
    committeeId: string | null;
    actorId: string;
    actions: {
      id: string;
      title: string;
      titleEn: string;
      schemaStepActionId: string;
      isSelected: boolean;
    }[];
    category: NodeType;
    color: string;
  };
}

export interface BridgeTwoNodesCommand {
  sourceId: string;
  destinationId: string;
  actionsIds: string[];
}
