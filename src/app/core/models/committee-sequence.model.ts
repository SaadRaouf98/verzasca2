import { CommitteeSequenceFormat } from '@core/enums/committee-sequence-format.enum';

export interface CommitteeSequence {
  id: string;
  title: string;
  lastResetDate: string;
  sequenceFormat: CommitteeSequenceFormat;
}

export interface AllCommitteeSequences {
  data: CommitteeSequence[];
  totalCount: number;
  groupCount: number;
}

export interface CommitteeSequenceCommand {
  id?: string;
  title: string;
  sequenceFormat: CommitteeSequenceFormat;
}
