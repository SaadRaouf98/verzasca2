import { PermissionsObj } from '@core/constants/permissions.constant';

export class AddMenuTypeLookups {
  static getLookup() {
    return [
      {
        name:'shared.import',
        url:'/imports-exports/add',
        icon:'import',
        permissions:[PermissionsObj.CreateRequest],
      },
      {
        name:'shared.export',
        url:'/imports-exports/export',
        icon:'export',
        permissions: [PermissionsObj.CreateRequest],
      },
      {
        name:'shared.report',
        url:'',
        icon:'report',
        permissions: [PermissionsObj.CreateRegularReports],
      },
      {
        name:'shared.meeting',
        url:'',
        icon:'meeting',
        permissions: [PermissionsObj.ManageMeetingSettings],
      },
      {
        name:'shared.meetingItems',
        url:'',
        icon:'meetingItems',
        permissions: [PermissionsObj.ManageMeetingTopics],
      },
      {
        name:'shared.newNew',
        url:'/latest-news/add',
        icon:'new',
        permissions: [PermissionsObj.CreateNewsPost],
      },
      {
        name:'shared.policies',
        url:'/policies-admin/add',
        icon:'policies',
        permissions: [PermissionsObj.CreateRegulatoryDocuments],
      },
    ]
  }
}
