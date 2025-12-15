import { ActionType } from '@core/enums/action-type.enum';

export const actionTypes = [
  {
    id: ActionType.Approve,
    name: 'تعميد',
    nameAr: 'تعميد',
    nameEn: 'Approve',
  },
  {
    id: ActionType.ChangeRequest,
    name: 'إعادة توجية',
    nameAr: 'إعادة توجية',
    nameEn: 'Change request',
  },
  {
    id: ActionType.RedirectingRequest,
    name: 'توجية',
    nameAr: 'توجية',
    nameEn: 'Redirecting request',
  },
  {
    id: ActionType.Delegate,
    name: 'تفويض',
    nameAr: 'تفويض',
    nameEn: 'Delegate',
  },
  {
    id: ActionType.AddActorToClassifiedRequests,
    name: 'إضافة مستخدم لمعاملة سرية',
    nameAr: 'إضافة مستخدم لمعاملة سرية',
    nameEn: 'Add actor to classified requests',
  },
  {
    id: ActionType.SelectConsultants,
    name: 'تحديد المستشارين',
    nameAr: 'تحديد المستشارين',
    nameEn: 'Selecting consultants',
  },
  {
    id: ActionType.SelectProcessType,
    name: 'تحديد آلية المعالجة',
    nameAr: 'تحديد آلية المعالجة',
    nameEn: 'Select process type',
  },

  {
    id: ActionType.ExportTypeRecommendation,
    name: 'إنشاء محتوي دراسة',
    nameAr: 'إنشاء محتوي دراسة',
    nameEn: 'Export type recommendation',
  },
  {
    id: ActionType.Proofreading,
    name: 'اعتماد المراجعة اللغوية',
    nameAr: 'اعتماد المراجعة اللغوية',
    nameEn: 'Proofreading approval',
  },
  {
    id: ActionType.LegalAuditing,
    name: 'اعتماد المراجعة القانونية',
    nameAr: 'اعتماد المراجعة القانونية',
    nameEn: 'Legal auditing approval',
  },
  {
    id: ActionType.RecordProducing,
    name: 'اعتماد نوع المخرج كمحضر',
    nameAr: 'اعتماد نوع المخرج كمحضر',
    nameEn: 'Record producing',
  },
  {
    id: ActionType.LetterProducing,
    name: 'اعتماد نوع المخرج كخطاب',
    nameAr: 'اعتماد نوع المخرج كخطاب',
    nameEn: 'Letter producing',
  },
  {
    id: ActionType.NoteProducing,
    name: 'اعتماد نوع المخرج كمذكرة',
    nameAr: 'اعتماد نوع المخرج كمذكرة',
    nameEn: 'Note producing',
  },

  {
    id: ActionType.UploadCommitteeApprovalDocument,
    name: 'رفع مشروع الدراسة لموافقة الأعضاء',
    nameAr: 'رفع مشروع الدراسة لموافقة الأعضاء',
    nameEn: 'Upload project document for committee approvals',
  },
  {
    id: ActionType.RequestStatement,
    name: 'طلب الافادة',
    nameAr: 'طلب الافادة',
    nameEn: 'Request statement',
  },

  /*   {
    id: ActionType.ExportRequestStatement,
    name: 'تصدير طلب الافادة',
    nameAr: 'تصدير طلب الافادة',
    nameEn: 'Export request statement',
  }, */

  {
    id: ActionType.SelectRecommendationType,
    name: 'تحديد نوع التوصية',
    nameAr: 'تحديد نوع التوصية',
    nameEn: 'Select recommendation type',
  },
  {
    id: ActionType.SelectBenefitType,
    name: 'تحديد نوع الطلب',
    nameAr: 'تحديد نوع الطلب',
    nameEn: 'Select benefit type',
  },
  {
    id: ActionType.InternalAssignment,
    name: 'توزيع داخلي للأقسام',
    nameAr: 'توزيع داخلي للأقسام',
    nameEn: 'Internal distribution of departments',
  },
  {
    id: ActionType.Scheduling,
    name: 'جدولة للاجتماع',
    nameAr: 'جدولة للاجتماع',
    nameEn: 'Meeting scheduling',
  },
  {
    id: ActionType.Holding,
    name: 'تعليق المعاملة',
    nameAr: 'تعليق المعاملة',
    nameEn: 'Hold request',
  },

  {
    id: ActionType.SignatureFormat,
    name: 'تعديل قالب التوقيعات',
    nameAr: 'تعديل قالب التوقيعات',
    nameEn: 'Signature format',
  },

  {
    id: ActionType.UploadForSignatures,
    name: 'رفع للتوقيع',
    nameAr: 'رفع للتوقيع',
    nameEn: 'Upload for signatures',
  },
  {
    id: ActionType.Signature,
    name: 'توقيع',
    nameAr: 'توقيع',
    nameEn: 'Signature',
  },
  {
    id: ActionType.Initiate,
    name: 'تركين',
    nameAr: 'تركين',
    nameEn: 'Initiate',
  },
  {
    id: ActionType.ExportTemplate,
    name: 'اختيار قالب التصدير',
    nameAr: 'اختيار قالب التصدير',
    nameEn: 'Export template',
  },
  {
    id: ActionType.SummarizeExportDocument,
    name: 'تلخيص المخرج',
    nameAr: 'تلخيص المخرج',
    nameEn: 'Summarize Export',
  },
  {
    id: ActionType.ReUploadDocument,
    name: 'اعادة رفع مخرج',
    nameAr: 'اعادة رفع مخرج',
    nameEn: 'ReUpload document',
  },
  {
    id: ActionType.Export,
    name: 'تصدير',
    nameAr: 'تصدير',
    nameEn: 'Export',
  },

  {
    id: ActionType.Close,
    name: 'إغلاق',
    nameAr: 'إغلاق',
    nameEn: 'Close',
  },
  {
    id: ActionType.Reject,
    name: 'رفض',
    nameAr: 'رفض',
    nameEn: 'Reject',
  },
  {
    id: ActionType.Archiving,
    name: 'أرشفة',
    nameAr: 'أرشفة',
    nameEn: 'Archiving',
  },
];
