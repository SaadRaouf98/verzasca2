export enum RecordType {
  MeetingRecord = 1, // محضر إجتماع
  HandoverRecord = 2, // محضر تمرير
}

export const recordTypeTranslationMap = {
  [RecordType.MeetingRecord]: 'shared.meetingRecord',
  [RecordType.HandoverRecord]: 'shared.handoverRecord',
};
