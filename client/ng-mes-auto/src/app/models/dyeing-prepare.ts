import {DyeingResult} from './dyeing-result';
import {Operator} from './operator';
import {Silk} from './silk';
import {SilkCarRecord} from './silk-car-record';

export class DyeingPrepare {
  id: string;
  type: string;
  silkCarRecord: SilkCarRecord;
  silks: Silk[];
  silkCarRecord1: SilkCarRecord;
  silks1: Silk[];
  silkCarRecord2: SilkCarRecord;
  silks2: Silk[];
  creator: Operator;
  createDateTime: Date;
  submitter: Operator;
  submitDateTime: Date;
  submitted: boolean;
  dyeingResults: DyeingResult[];
}
