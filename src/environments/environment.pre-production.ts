const domain = 'https://waemstage.fc.gov';
const apiUrl = `${domain}:6217`;
const ocrUrl = `${domain}:6218`;

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
    apiUrl +
    '/api/wopi/files/',
  editorToken: 'IBBmxOuxR2vFcYtA9gpY', //'aW9v7lHDn1q43spHcFVb', //'tZqGaql1Xk92R88Jlpp1',
  extendInvestigationId: '14838d9e-e41a-432c-81dc-08dc09dde200',
  committeeApprovalStepId: '1f15da3b-bcb3-4ee0-9a3e-7aea06154cb6',
};
