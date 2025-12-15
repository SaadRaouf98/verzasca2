export interface Actor {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  usersCount: number;
  rolesCount: number;
  departmentsCount: number;
  totalUsers: number;
  isEditable: boolean;
}

export interface ActorDetails {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  users: {
    id: string;
    name: string;
  }[];

  roles: {
    id: string;
    name: string;
  }[];
  departments: {
    id: string;
    title: string;
    titleEn: string;
  }[];

  isEditable: boolean;
}

export interface AllActors {
  data: Actor[];
  totalCount: number;
  groupCount: number;
}

export interface ActorCommand {
  id?: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  userIds: string[];
  roleIds: string[];
  departmentIds: string[];
}

export interface ActorForm {
  id?: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  userIds: {
    id: string;
    name: string;
  }[];
  roleIds: {
    id: string;
    name: string;
  }[];
  departmentIds: {
    id: string;
    title: string;
    titleEn: string;
  }[];
  isEditable: boolean;
}
