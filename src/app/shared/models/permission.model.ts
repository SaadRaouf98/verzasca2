export interface Permission {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  checked: boolean;
  pages?: Permission[];
}
