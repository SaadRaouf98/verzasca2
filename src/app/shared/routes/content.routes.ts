import { Routes } from '@angular/router';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { RouteConstants } from '@core/enums/routes.enum';
import { HomeComponent } from '@pages/home/home/home.page';
import { PostDetailsComponent } from '@pages/home/pages/post-details/post-details.component';
import { PostsListComponent } from '@pages/home/pages/posts-list/posts-list.component';
import { StatisticsDetailedComponent } from '@pages/home/pages/statistics-detailed/statistics-detailed.component';
import { ngxPermissionsGuard } from 'ngx-permissions';

export const content: Routes = [
  {
    path: 'home/statistics',
    component: StatisticsDetailedComponent,
    data: { breadcrumb: 'shared.home' },
    loadChildren: () => import('../../pages/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'home/posts',
    component: PostsListComponent,
    data: { breadcrumb: 'shared.home' },
    loadChildren: () => import('../../pages/home/home.module').then((m) => m.HomeModule),
  },
  // Calendar Scheduler - standalone component route
  {
    path: 'calendar-scheduler',
    data: { breadcrumb: 'shared.calendarScheduler' },
    loadComponent: () =>
      import('../new-components/calendar-scheduler/calendar-scheduler.component').then(
        (m) => m.CalendarSchedulerComponent
      ),
  },
  {
    path: 'home/post/:id',
    component: PostDetailsComponent,
    data: { breadcrumb: 'shared.home' },
    loadChildren: () => import('../../pages/home/home.module').then((m) => m.HomeModule),
  },

  {
    path: 'home',
    component: HomeComponent,
    data: { breadcrumb: 'shared.home' },
    loadChildren: () => import('../../pages/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'policies',
    data: { breadcrumb: 'shared.policies' },

    loadComponent: () =>
      import(
        '../../pages/home/components/home-policies/policies-list/policies-list.component'
      ).then((m) => m.PoliciesListComponent),
  },

  {
    path: 'my-profile',
    data: { breadcrumb: 'shared.profile' },
    loadChildren: () =>
      import('../../pages/my-profile/my-profile.module').then((m) => m.MyProfileModule),
  },
  {
    path: 'ocr',
    loadChildren: () => import('../../pages/ocr/ocr.module').then((m) => m.OcrModule),
  },

  {
    path: 'manage-services',
    loadChildren: () =>
      import('../../pages/manage-services/manage-services.module').then(
        (m) => m.ManageServicesModule
      ),
  },
  {
    path: 'system-management/users-roles/roles',
    loadChildren: () =>
      import('../../pages/permissions-settings/permissions-settings.module').then(
        (m) => m.PermissionsSettingsModule
      ),

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewRoles,
        redirectTo: '/home',
      },
    },
  },

  {
    path: 'system-management/system-settings',
    loadChildren: () =>
      import('../../pages/system-settings/system-settings.module').then(
        (m) => m.SystemSettingsModule
      ),
  },
  {
    path: 'system-management/workflow-design/actors',
    loadChildren: () => import('../../pages/actors/actors.module').then((m) => m.ActorsModule),

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewActors,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'system-management/users-roles/users',
    loadChildren: () => import('../../pages/users/users.module').then((m) => m.UsersModule),

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewUsers,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'system-management/secretarial-structure',
    loadChildren: () =>
      import('../../pages/secretariats/secretariats.module').then((m) => m.SecretariatsModule),
  },
  {
    path: 'system-management/committees',
    loadChildren: () =>
      import('../../pages/committees/committees.module').then((m) => m.CommitteesModule),

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewOrganizationsStructure,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'system-management/workflow-design/workflows',
    loadChildren: () =>
      import('../../pages/workflows/workflows.module').then((m) => m.WorkflowsModule),
  },
  {
    path: 'system-management/users-roles',
    loadChildren: () =>
      import('../../pages/users-roles/users-roles.module').then((m) => m.UsersRolesModule),
  },
  {
    path: 'system-management/workflow-design',
    loadChildren: () =>
      import('../../pages/workflow-design/workflow-design.module').then(
        (m) => m.WorkflowDesignModule
      ),
  },
  {
    path: 'system-management/application-settings',
    loadChildren: () =>
      import('../../pages/application-settings/application-settings.module').then(
        (m) => m.ApplicationSettingsModule
      ),
  },
  {
    path: 'system-management',
    loadChildren: () =>
      import('../../pages/system-management/system-management.module').then(
        (m) => m.SystemManagementModule
      ),

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewSettings,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'theme',
    loadChildren: () =>
      import('../../pages/theme-customizer/theme-customizer.module').then(
        (m) => m.ThemeCustomizerModule
      ),

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewSettings,
        redirectTo: '/home',
      },
    },
  },
  /*
  {
    path: 'files-documents',
    loadChildren: () =>
      import('../../pages/files-documents/files-documents.module').then(
        (m) => m.FilesDocumentsModule
      ),

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewDocumentsLibrary,
        redirectTo: '/home',
      },
    },
  }, */
  {
    path: 'transactions',
    data: { breadcrumb: 'shared.transactions' },
    loadChildren: () =>
      import('../../pages/transactions/transactions.module').then((m) => m.TransactionsModule),
  },
  {
    path: RouteConstants.PendingRequest,
    data: { breadcrumb: 'shared.pendingRequests' },
    loadChildren: () =>
      import('../../pages/pending-transactions/pending-transactions.module').then(
        (m) => m.PendingTransactionsModule
      ),
  },
  {
    path: 'system-management/workflow-design/request-types',
    loadChildren: () =>
      import('../../pages/request-types/request-types.module').then((m) => m.RequestTypesModule),

    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'shared.requestTypes',
      permissions: {
        only: PermissionsObj.ViewRequestTypes,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'imports-exports',
    data: { breadcrumb: 'shared.importsExports' },
    loadChildren: () =>
      import('../../pages/imports-exports/imports-exports.module').then(
        (m) => m.ImportsExportsModule
      ),
  },
  {
    path: 'manage-meetings',
    data: { breadcrumb: 'shared.meetings' },
    loadChildren: () =>
      import('../../pages/manage-meetings/manage-meetings.module').then(
        (m) => m.ManageMeetingsModule
      ),

    /* canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewMeetings,
        redirectTo: '/home',
      },
    }, */
  },

  {
    path: 'policies-admin',
    data: {
      breadcrumb: 'shared.policies',
      permissions: {
        only: PermissionsObj.ViewRegulatoryDocuments,
        redirectTo: '/home',
      },
    },
    canActivate: [ngxPermissionsGuard],
    loadComponent: () =>
      import(
        '../../pages/home/components/home-policies/policies-admin-list/policies-admin-list.component'
      ).then((m) => m.PoliciesAdminListComponent),
  },

  {
    path: 'policies-admin/:id/edit',
    data: {
      breadcrumb: 'shared.policies',
      permissions: {
        only: PermissionsObj.UpdateRegulatoryDocuments,
        redirectTo: '/home',
      },
    },
    canActivate: [ngxPermissionsGuard],

    loadComponent: () =>
      import('../../pages/home/components/home-policies/add-policy/add-policy.component').then(
        (m) => m.AddPolicyComponent
      ),
  },
  {
    path: 'policies-admin/add',
    data: {
      breadcrumb: 'shared.policies',
      permissions: {
        only: PermissionsObj.CreateRegulatoryDocuments,
        redirectTo: '/home',
      },
    },
    canActivate: [ngxPermissionsGuard],

    loadComponent: () =>
      import('../../pages/home/components/home-policies/add-policy/add-policy.component').then(
        (m) => m.AddPolicyComponent
      ),
  },
  {
    path: 'latest-news',
    loadChildren: () =>
      import('../../pages/latest-news/latest-news.module').then((m) => m.LatestNewsModule),

    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'shared.news',
      permissions: {
        only: PermissionsObj.ViewNewsPost,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'time-attendance',
    data: { breadcrumb: 'shared.timeAttendance' },
    loadChildren: () =>
      import('../../pages/time-attendance/time-attendance.module').then(
        (m) => m.TimeAttendanceModule
      ),
  },
  {
    path: 'manage-records',
    loadChildren: () =>
      import('../../pages/manage-records/manage-records.module').then((m) => m.ManageRecordsModule),

    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'shared.records',
      permissions: {
        only: PermissionsObj.ViewRecords,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'manage-notes',
    loadChildren: () =>
      import('../../pages/manage-notes/manage-notes.module').then((m) => m.ManageNotesModule),

    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'shared.documents',
      permissions: {
        only: PermissionsObj.ViewNotes,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('../../pages/regular-reports/regular-reports.module').then(
        (m) => m.RegularReportsModule
      ),

    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'shared.reports',
      permissions: {
        only: PermissionsObj.ViewRegularReports,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'notifications',
    data: { breadcrumb: 'shared.notifications' },
    loadChildren: () =>
      import('../../pages/notifications/notifications.module').then((m) => m.NotificationsModule),
  },
];
