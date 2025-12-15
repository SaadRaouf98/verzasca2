export interface IOSVersion {
  id: string;
  version: string;
  link: string;
  isForceUpdate: boolean;
}

export interface AllIOSVersions {
  data: IOSVersion[];
  totalCount: number;
  groupCount: number;
}

export interface AddIOSVersionCommand {
  version: string;
  link: string;
  isForceUpdate: boolean;
  app: string;
}
