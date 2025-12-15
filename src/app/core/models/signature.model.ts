import { SignatureStatus } from '@core/enums/signature-status.enum';

export interface Signature {
  id: string;
  title: string;
  committee: {
    id: string;
    title: string;
  };
  membersCount: number;
  status: SignatureStatus;
}

export interface DetailedSignature {
  id: string;
  title: string;
  memberCount: number;
  status: SignatureStatus;
  description: string;
  committee: {
    id: string;
    title: string;
    members: { id: string; name: string }[];
  };
  signatureSettings: {
    id: string;
    row: number;
    size: number;
    start: number;
    end: number;
    memberTitle: string;
    userId: string;
    name: string;
  }[];
}

export interface SignatureForm {
  id: string;
  title: string;
  status: SignatureStatus;
  description: string;
  committee: {
    id: string;
    title: string;
  };
  signatureSettings: {
    id: string;
    row: number;
    size: number; //عدد الأعمدة للمستطيل
    start: number; // باديء عند عمود رقم كام
    end: number; // انتهي عند عمود رقم كام
    memberTitle: string;
    userId: string;
    name: string;
  }[];
}

export interface SignatureCommand {
  id?: string;
  title: string;
  status: SignatureStatus;
  description: string;
  committeeId: string;
  signatureSettings: {
    id?: string;
    row: number;
    size: number; //عدد الأعمدة للمستطيل
    start: number; // باديء عند عمود رقم كام
    end: number; // انتهي عند عمود رقم كام
    memberTitle: string;
    userId: string;
    name: string;
  }[];
}

export interface AllSignatures {
  data: Signature[];
  totalCount: number;
  groupCount: number;
}
