export interface ManagedDepartment {
  id: string;
  title: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  directManager: User | null;
  managedDepartment: ManagedDepartment | null;
  department: string | null;
}
export interface UserStats {
  transactionsCount: number;
  initiationsCount: number;
  actionsCount: number;
  totalActions: number;
}
