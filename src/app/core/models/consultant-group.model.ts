import { ConsultantType } from "@pages/system-settings/modals/consultant-types.modal.enum";

export interface ConsultantGroup {
  id: string;
  title: string;
  description: string;
}

export interface ConsultantGroupDetails {
  id: string;
  title: string;
  description: string;
  consultants: {
    id: string;
    name: string;
    isMain: true;
  }[];
}

export interface ConsultantGroupCommand {
  id?: string;
  title: string;
  description: string;
  consultants: {
    id: string;
    type: ConsultantType;
  }[];
}

export interface AllConsultantGroups {
  data: ConsultantGroup[];
  totalCount: number;
  groupCount: number;
}
