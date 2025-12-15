export enum RequestStatus {
  Initiated = 1,
  InProgress = 2,
  Scheduled = 3,
  Held = 4,
  Signing = 5, // Sing/initiate actions
  CommitteeApproval = 6, // Committee review and decision before processing the document
  // Reserved range for future progress statuses
  // (Gap: 7–14)
  Exported = 15,
  Archived = 16,
  Rejected = 17,
  Done = 18,
  Closed = 19,
  ForceClosed = 20,
  Reset = 103,
}

export const RequestStatusArray: { id: number; title: string }[] = [
  { id: RequestStatus.Initiated, title: 'shared.initiated' },
  { id: RequestStatus.InProgress, title: 'shared.inProgress' },
  {
    id: RequestStatus.Scheduled,
    title: 'TransactionsModule.TransactionsListComponent.scheduled',
  },
  { id: RequestStatus.Held, title: 'shared.held' },
  { id: RequestStatus.Signing, title: 'shared.signing' },
  { id: RequestStatus.CommitteeApproval, title: 'shared.committeeApproval' },
  { id: RequestStatus.Exported, title: 'shared.exported' },
  { id: RequestStatus.Archived, title: 'shared.archived' },
  { id: RequestStatus.Rejected, title: 'shared.rejected' },
  { id: RequestStatus.Done, title: 'shared.isDone' },
  { id: RequestStatus.Closed, title: 'shared.closed' },
  { id: RequestStatus.ForceClosed, title: 'shared.forceClosed' },
  { id: RequestStatus.Reset, title: 'shared.reset' },
];

export const RequestStatusTranslationMap: { [key in RequestStatus]: string } = {
  [RequestStatus.Initiated]: 'shared.initiated',
  [RequestStatus.InProgress]: 'shared.inProgress',
  [RequestStatus.Scheduled]:
    'TransactionsModule.TransactionsListComponent.scheduled',
  [RequestStatus.Held]: 'shared.held',
  [RequestStatus.Signing]: 'shared.signing',
  [RequestStatus.CommitteeApproval]: 'shared.committeeApproval',
  [RequestStatus.Exported]: 'shared.exported',
  [RequestStatus.Archived]: 'shared.archived',
  [RequestStatus.Rejected]: 'shared.rejected',
  [RequestStatus.Done]: 'shared.isDone',
  [RequestStatus.Closed]: 'shared.closed',
  [RequestStatus.ForceClosed]: 'shared.forceClosed',
  [RequestStatus.Reset]: 'shared.reset',
};
