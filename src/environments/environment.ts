const apiUrl = 'http://172.16.11.10:5017';

export const environment = {
  production: false,
  apiUrl, //'Http Server:: http://172.16.11.10:5017', //Ahmed adawy:: http://192.167.120.73:5017  //Helbawy:: http://192.167.120.65:5017  ,
  notificationHubUrl: 'http://172.16.11.10:5017/notifications',
  editorToken: 'IBBmxOuxR2vFcYtA9gpY', //'aW9v7lHDn1q43spHcFVb', //'tZqGaql1Xk92R88Jlpp1',
  ocrAndSolarApi: 'http://172.16.11.10:5018', //'http://172.16.11.10:5018',
  financeCommitteeId: 'bfb23c24-c443-43c5-b411-aa5140273e06',
  preparatoryCommitteeId: '74dff495-588c-409e-b7c4-dbd31b9ea9a9',
  coordinatingCommitteeId: '5284e50a-ecf2-456d-9483-470beeddb8ea',
  editoUrl:
    'http://172.16.11.141/browser/d5ebff5/cool.html?WOPISrc=' +
    // apiUrl +
    '172.16.11.10:5017' +
    '/api/wopi/files/',

  extendInvestigationId: '14838d9e-e41a-432c-81dc-08dc09dde200',
  committeeApprovalStepId: '1f15da3b-bcb3-4ee0-9a3e-7aea06154cb6',
};
