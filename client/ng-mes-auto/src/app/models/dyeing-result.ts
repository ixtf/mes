import {DyeingPrepare} from './dyeing-prepare';
import {Grade} from './grade';
import {LineMachine} from './line-machine';
import {Silk} from './silk';
import {SilkException} from './silk-exception';
import {SilkNote} from './silk-note';

export class DyeingResult {
  id: string;
  dyeingPrepare: DyeingPrepare;
  silk: Silk;
  lineMachine: LineMachine;
  spindle: number;
  dateTime: Date;
  hasException: boolean;
  grade: Grade;
  silkExceptions: SilkException[];
  silkNotes: SilkNote[];
  formConfig: any;
  formConfigValueData: any;
  submitted: boolean;
}
