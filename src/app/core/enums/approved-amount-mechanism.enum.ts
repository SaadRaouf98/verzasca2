export enum ApprovedAmountMechanism {
  WithinBudget = 1, //من داخل الميزانية
  Extrabudgetary = 2, //من خارج الميزانية
  Other = 3, //اخري
}
export const approvedAmountMechanismTranslationMap = {
  [ApprovedAmountMechanism.WithinBudget]: 'shared.withinBudget',
  [ApprovedAmountMechanism.Extrabudgetary]: 'shared.extrabudgetary',
  [ApprovedAmountMechanism.Other]: 'shared.other',
};
