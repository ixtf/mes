import {DyeingPrepare} from './dyeing-prepare';
import {FormConfig} from './form-config';
import {Operator} from './operator';
import {PackageBox} from './package-box';
import {ProductProcess} from './product-process';
import {SilkCarRecord} from './silk-car-record';
import {SilkException} from './silk-exception';
import {SilkNote} from './silk-note';
import {SilkRuntime} from './silk-runtime';

export class EventSource {
  type: string;
  eventId: string;
  operator: Operator;
  fireDateTime: Date;
  deleted: boolean;
}

export class ProductProcessSubmitEvent extends EventSource {
  silkRuntimes: SilkRuntime[];
  productProcess: ProductProcess;
  silkExceptions: SilkException[];
  silkNotes: SilkNote[];
  formConfig: FormConfig;
  formConfigValueData: { [id: string]: any };
}

export class DyeingSampleSilkSubmitEvent extends EventSource {
  silkCarRecord: SilkCarRecord;
  silkRuntimes: SilkRuntime[];
}

export class SilkRuntimeDetachEvent extends EventSource {
  silkRuntimes: SilkRuntime[];
}

export class SilkNoteFeedbackEvent extends EventSource {
  silkNote: SilkNote;
}

export class PackageBoxEvent extends EventSource {
  packageBox: PackageBox;
}

export class DyeingPrepareEvent extends EventSource {
  dyeingPrepare: DyeingPrepare;
}

export class JikonAdapterSilkDetachEvent extends EventSource {
  command: { silkcarCode: string; spindleCode: string };
  result: any;
}

export class RiambSilkDetachEvent extends EventSource {
  command: any;
  result: any;
}

export class JikonAdapterSilkCarInfoFetchEvent extends EventSource {
  command: any;
  result: any;
}

export class RiambSilkCarInfoFetchEvent extends EventSource {
  command: any;
  result: any;
}
