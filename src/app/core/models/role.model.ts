export interface Role {
  id: string;
  name: string;
  permissionsCount: number;
}

export interface DetailedRole extends Role {
  permissions: string[];
  permissionsCount: number;
}

export interface AllRoles {
  data: Role[];
  totalCount: number;
  groupCount: number;
}
