export enum ActionType {
  /// GotoNextStep() - default for Operator بدأ
  Start = 1,

  /// GotoNextStep() -  تعميد
  Approve = 2,

  /// GotoBackStep() - Return the current request one step forward إعادة
  ChangeRequest = 3,

  /// GotoNextStep() - Move the request to Actor توجيه
  RedirectingRequest = 4,
  /// GotoNextStep() - Notify, and Send the request to the selected Users التوزيع | تحديد المستشارين

  /// GotoNextStep() - Move the current Request To Selected user  تفويض
  Delegate = 5,

  /// Not -> GotoNextStep(), إضافة مستخدمين إلى المعاملات السرية
  AddActorToClassifiedRequests = 6,

  /// Not -> GotoNextStep(), Just Popup to select the consultants - تحديد المستشارين
  SelectConsultants = 7,

  /// GotoDifferentSchema(), (A,B, or C) تحديد ألية المعالجة
  SelectProcessType = 8,

  /// GotoNextStep(), With one Of recommendations: Letter, Note, Record () - توصية
  //RecordRecommendation = 9,
  ExportTypeRecommendation = 9, //محتوي دراسة

  /// <summary>
  /// تحديد نوع المخرج
  /// </summary>
  RecordProducing = 10,
  LetterProducing = 11,
  NoteProducing = 12,

  /// <summary>
  /// GotoNextStep(), طلب إفادة
  /// </summary>
  RequestStatement = 13,
  /// <summary>
  /// GotoNextStep(), تصدير طلب الإفادة
  /// </summary>
  ExportRequestStatement = 14,

  /// نوع التوصية
  /// Select recommendation type from dynamic list
  SelectRecommendationType = 15,

  /// Select benefit type required from consultant
  SelectBenefitType = 16,

  /// GotoNextStep() - Notify, and Send the request to the selected Users التوزيع
  /// توزيع داخلى للاقسام
  InternalAssignment = 17,
  /// Hold request container until the meeting ends then GotoNextStep()
  Scheduling = 18,

  /// Waiting for more information
  Holding = 19,

  /// <summary>
  /// GotoNextStep() -  تحديد قالب التوقيعات
  /// </summary>
  SignatureFormat = 20,

  /// GotoNextStep() Signature Service توقيع
  Signature = 21,
  /// GotoNextStep() - Put my initiate on the recommended document تركين
  Initiate = 22,

  UploadForSignatures = 23, //رفع للتوقيع

  /// <summary>
  /// GotoNextStep() - Add background template, add barcode, add signatures, and save as pdf
  /// </summary>
  ExportTemplate = 24,

  SummarizeExportDocument = 25,

  /// <summary>
  /// update status as exported, End workflow with done status
  /// </summary>
  Export = 26,

  /// Update Request status to be Archived(), الأرشفة
  Archiving = 27,

  /// Update Request status to be Closed()
  Close = 28,

  /// GotoBackStep() -> Return, رفض
  Reject = 29,

  /// GotoBackStep() -> التدقيق اللغوي
  Proofreading = 30,
  /// GotoBackStep() -> التدقيق القانوني
  LegalAuditing = 31,

  ReUploadDocument = 32, //اعادة رفع المحضر
  UploadCommitteeApprovalDocument = 33, // رفع ملف الدراسة لخطوة لموافقة الاعضاء
}
