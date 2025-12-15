export enum ExportedDocumentType {
  Letter = 1, // خطاب
  Note = 2, // مذكرة
  Record = 3, // محضر
  Other = 4,
}

export const exportedDocumentTypeTranslationMap = {
  [ExportedDocumentType.Letter]:
    'TransactionsModule.ExportDocumentComponent.letter',
  [ExportedDocumentType.Note]:
    'TransactionsModule.ExportDocumentComponent.note',
  [ExportedDocumentType.Record]:
    'TransactionsModule.ExportDocumentComponent.record',
  [ExportedDocumentType.Other]:
    'TransactionsModule.ExportDocumentComponent.other',
};
