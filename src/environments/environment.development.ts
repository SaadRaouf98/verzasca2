// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// const domain = 'http://192.167.120.85';
const domain = 'https://waemstage.fc.gov';

const apiUrl = `${domain}:6017`;
// const apiUrl = 'http://192.167.120.85:5017';
const ocrUrl = `${domain}:6018`;

export const environment = {
  production: false,
  apiUrl,
  notificationHubUrl: `${apiUrl}/notifications`,
  ocrAndSolarApi: ocrUrl,
  financeCommitteeId: 'bfb23c24-c443-43c5-b411-aa5140273e06',
  preparatoryCommitteeId: '74dff495-588c-409e-b7c4-dbd31b9ea9a9',
  coordinatingCommitteeId: '5284e50a-ecf2-456d-9483-470beeddb8ea',
  editoUrl:
    'http://172.16.11.141/browser/d5ebff5/cool.html?WOPISrc=' +
    'http://172.16.11.10:5017' +
    '/api/wopi/files/',
  editorToken: 'IBBmxOuxR2vFcYtA9gpY', //'aW9v7lHDn1q43spHcFVb', //'tZqGaql1Xk92R88Jlpp1',
  extendInvestigationId: '14838d9e-e41a-432c-81dc-08dc09dde200',
  committeeApprovalStepId: '1f15da3b-bcb3-4ee0-9a3e-7aea06154cb6',
};

//email for account on TXTextcontrol: test202452@outlook.com
//Server https://172.16.11.10:6017

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
