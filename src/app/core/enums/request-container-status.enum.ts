export enum RequestContainerStatus {
  Open = 1, //مفتوحة
  Held = 2,
  Scheduled = 3, // مجدولة لاجتماع
  Reset = 4, //معادة
  Close = 5,
  ForceClose = 6, //مغلقة من الأدمن
}

export const statusTranslationMap = {
  [RequestContainerStatus.Open]:
    'TransactionsModule.TransactionsListComponent.open',
  [RequestContainerStatus.Held]: 'shared.held',
  [RequestContainerStatus.Scheduled]:
    'TransactionsModule.TransactionsListComponent.scheduled',
  [RequestContainerStatus.Reset]:
    'TransactionsModule.TransactionsListComponent.reset',
  [RequestContainerStatus.Close]:
    'TransactionsModule.TransactionsListComponent.close',
  [RequestContainerStatus.ForceClose]:
    'TransactionsModule.TransactionsListComponent.forceClose',
};
