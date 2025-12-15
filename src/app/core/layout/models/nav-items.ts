import { StatisticsSummary } from '@core/models/statistics-summary.model';
import { PermissionsObj } from '@core/constants/permissions.constant';

export interface NavItem {
  labelKey: string;
  route: string;
  icon: string;
  iconFill?: string;
  isFooterItem?: boolean;
  queryParamsMerge?: boolean;
  countProp?: keyof StatisticsSummary;
  permission?: keyof typeof PermissionsObj;
  width?: string;
  height?: string;
  marginBottom?: string;
  hasSubMenu?: boolean;
  subRoutes?: Array<{
    labelKey: string;
    route: string;
    icon: string;
    iconFill?: string;
    width?: string;
    height?: string;
  }>;
}

export const NAV_ITEMS: NavItem[] = [
  {
    labelKey: 'shared.main',
    route: '/home',
    icon: 'nav-home',
    iconFill: 'nav-home-fill',
    width: '1.25rem',
    height: '1.25rem',
  },
  {
    labelKey: 'shared.transactions',
    route: '/transactions',
    icon: 'nav-operations',
    iconFill: 'nav-operations',
    queryParamsMerge: true,
    width: '1.25rem',
    height: '1.25rem',
  },
  {
    labelKey: 'LayoutModule.ContainerComponent.pending',
    route: '/pending-transactions',
    icon: 'nav-pending',
    iconFill: 'nav-pending-fill',
    countProp: 'PendingRequests',
    permission: 'ViewPendingRequests',
    width: '1.25rem',
    height: '1.25rem',
  },
  {
    labelKey: 'shared.records',
    // route: '/manage-records',
    route: '/manage-records/active',
    icon: 'nav-records',
    iconFill: 'nav-records-fill',
    countProp: 'ActiveRecords',
    permission: 'ViewRecords',
    queryParamsMerge: true,
    width: '1.25rem',
    height: '1.25rem',
    hasSubMenu: true,
    subRoutes: [
      {
        labelKey: 'shared.activeRecords',
        route: '/manage-records/active',
        icon: 'nav-records',
        iconFill: 'nav-records-fill',
        width: '1.25rem',
        height: '1.25rem',
      },
      {
        labelKey: 'shared.allRecords',
        route: '/manage-records',
        icon: 'nav-records',
        iconFill: 'nav-records-fill',
        width: '1.25rem',
        height: '1.25rem',
      },
    ],
  },
  {
    labelKey: 'shared.files',
    route: '/manage-notes',
    icon: 'nav-notes',
    iconFill: 'nav-notes-fill',
    // countProp: 'UnSignedDocuments',
    permission: 'ViewNotes',
    width: '1.25rem',
    height: '1.25rem',
  },
  {
    labelKey: 'shared.importsExports',
    route: '/imports-exports',
    icon: 'nav-import-export',
    iconFill: 'nav-import-export-fill',
    queryParamsMerge: true,
    width: '1.25rem',
    height: '1.25rem',
  },
  {
    labelKey: 'shared.reports',
    route: '/reports',
    icon: 'nav-reports',
    iconFill: 'nav-reports',
    permission: 'ViewRegularReports',
    queryParamsMerge: true,
    width: '1.25rem',
    height: '1.25rem',
  },
  {
    labelKey: 'shared.meetingManagement',
    route: '/manage-meetings',
    icon: 'nav-meetings',
    iconFill: 'nav-meetings-fill',
    isFooterItem: true,
    countProp: 'CurrentMeetings',
    permission: 'ViewMeetings',
    width: '1.25rem',
    height: '1.25rem',
    marginBottom: '300px',
  },
  {
    labelKey: 'shared.systemManagement',
    route: '/system-management',
    icon: 'nav-system',
    iconFill: 'nav-system-fill',
    isFooterItem: true,
    permission: 'ViewSettings',
    width: '1.25rem',
    height: '1.25rem',
  },

  {
    labelKey: 'shared.signOut',
    route: '',
    icon: 'nav-logout',
    isFooterItem: true,
    width: '1.25rem',
    height: '1.25rem',
  },
];
