export enum ExportedDocumentStatus {
  Draft = 1,
  /// <summary>
  /// Committee signatures
  /// </summary>
  InProgress = 2,
  Exported = 3,
  /// <summary>
  /// Remove export number and archive uncompleted document
  /// </summary>
  Deleted = 4,
  /// <summary>
  /// Keep export number reserved and archive document
  /// </summary>
  Archived = 5,
}

export const ExportedDocumentStatusArray: { id: number; title: string }[] = [
  { id: ExportedDocumentStatus.Draft, title: 'shared.draft' },
  { id: ExportedDocumentStatus.InProgress, title: 'shared.inProgress' },
  { id: ExportedDocumentStatus.Exported, title: 'shared.exported' },
  { id: ExportedDocumentStatus.Deleted, title: 'shared.deleted' },
  { id: ExportedDocumentStatus.Archived, title: 'shared.archived' },
];

export const ExportedDocumentStatusTranslationMap: { [key in ExportedDocumentStatus]: string } = {
  [ExportedDocumentStatus.Draft]: 'shared.draft',
  [ExportedDocumentStatus.InProgress]: 'shared.inProgress',
  [ExportedDocumentStatus.Exported]: 'shared.exported',
  [ExportedDocumentStatus.Deleted]: 'shared.deleted',
  [ExportedDocumentStatus.Archived]: 'shared.archived',
};
