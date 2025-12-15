export interface User {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber: string;
  department: {
    id: string;
    title: string;
    titleEn: string;
  };
}

export interface AllUsers {
  data: User[];
  totalCount: number;
  groupCount: number;
}

export interface DetailedUser extends User {
  permissions: string[];

}

export interface UserPermissions extends User {

  /** Unique identifier */
  id: string;
  /** Full Arabic name */
  name: string;
  /** Login username */
  userName: string;
  /** Email address */
  email: string;
  /** E.164-formatted phone number */
  phoneNumber: string;
  /** AD/LDAP account name */
  samAccountName: string;
  /** Whether the user is a committee member */
  isCommitteeMember: boolean;
  permissions: string[];
  permissionsCount: number;
}
