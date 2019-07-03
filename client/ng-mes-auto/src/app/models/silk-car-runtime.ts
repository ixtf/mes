import {EventSource} from './event-source';
import {SilkCarRecord} from './silk-car-record';
import {SilkRuntime} from './silk-runtime';

export class SilkCarRuntime {
  silkCarRecord: SilkCarRecord;
  initSilkRuntimes: SilkRuntime[];
  initEventSource: EventSource;
  eventSources: EventSource[];
  silkRuntimes: SilkRuntime[];
  exceptions: SilkRuntime[];
  firstDyeingResultInfo: SilkRuntime[];

  get id(): string {
    return this.silkCarRecord && this.silkCarRecord.id;
  }

  static assign(...sources: any[]): SilkCarRuntime {
    const result = Object.assign(new SilkCarRuntime(), ...sources);
    return result;
  }

  static toEntities(os: SilkCarRuntime[], entities?: { [id: string]: SilkCarRuntime }): { [id: string]: SilkCarRuntime } {
    return (os || []).reduce((acc, cur) => {
      acc[cur.id] = SilkCarRuntime.assign(cur);
      return acc;
    }, {...(entities || {})});
  }
}
