import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';

export interface OrganizationUnit {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  parentId: string | null;
  parentName: string | null;
  parentNameEn: string | null;
  admin: {
    id: string;
    name: string;
  }; //المدير في حالة الامانات بيكون سعادة الامين- في حالة الادارات بيكون مدير الادارة
  hasChildren: boolean;
  committeeSymbol: string; //Only is returned incase of Committees
  committeeSequence: {
    id: string;
    title: string;
  };
  recordCompletionTimeInHours?: number;
  recordPhoneApprovalsLimit?: number;
}

export interface AllOrganizationUnits {
  data: OrganizationUnit[];
  totalCount: number;
  groupCount: number;
}

export interface AddOrganizationUnitCommand {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  adminId: string | null; //is null incase of adding a committee
  parentId: string | null;
  type: OrganizationUnitType;
  committeeSymbol?: string; //is optional incase of NOT adding a committee
  committeeSequenceId?: string; //is optional incase of NOT adding a committee
  recordCompletionTimeInHours?: number;
  recordPhoneApprovalsLimit?: number
}

export interface UpdateOrganizationUnitCommand {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  adminId: string | null;
  parentId: string | null;
  committeeSymbol?: string; //is optional incase of NOT adding a committee
  committeeSequenceId?: string; //is optional incase of NOT adding a committee
  recordCompletionTimeInHours?: number;
  recordPhoneApprovalsLimit?: number;
}

export interface OrganizationUnitForm {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  admin?: {
    id: string;
    name: string;
  };
  parentId: string | null;
  committeeSymbol?: string; //is optional incase of NOT adding a committee
}

export interface UpdateOrganizationUnitUsersCommand {
  id: string;
  membersId: string[];
}

export interface OganizationUnitMembers {
  id: string;
  title: string;
  titleEn: string;
  members: { id: string; name: string }[];
}

export interface OrganizationDepartmentLookUp {
  id: string;
  title: string;
  titleEn: string;
}

export interface HisExcellencyDepartments {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  members: { id: string; name: string }[];
  totalMembers: number;
}
