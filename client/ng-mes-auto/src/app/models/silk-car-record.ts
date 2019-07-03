import {Batch} from './batch';
import {EventSource} from './event-source';
import {Grade} from './grade';
import {Operator} from './operator';
import {SilkCar} from './silk-car';
import {SilkRuntime} from './silk-runtime';

export class SilkCarRecord {
  id: string;
  silkCar: SilkCar;
  batch: Batch;
  grade: Grade;
  doffingOperator: Operator;
  doffingType: string;
  doffingDateTime: Date;
  carpoolOperator: Operator;
  carpoolDateTime: Date;
  initSilks: SilkRuntime[];
  initEventSource: EventSource;
  eventSources: EventSource[];

  static assign(...sources: any[]): SilkCarRecord {
    const result = Object.assign(new SilkCarRecord(), ...sources);
    return result;
  }

  static toEntities(os: SilkCarRecord[], entities?: { [id: string]: SilkCarRecord }): { [id: string]: SilkCarRecord } {
    return (os || []).reduce((acc, cur) => {
      acc[cur.id] = SilkCarRecord.assign(cur);
      return acc;
    }, {...(entities || {})});
  }

  get initTypeString(): string {
    return this.doffingOperator ? 'DoffingType.' + this.doffingType : 'Common.carpool';
  }

  get initOperator(): Operator {
    return this.doffingOperator || this.carpoolOperator;
  }

  get initDateTime(): Date {
    return this.doffingDateTime || this.carpoolDateTime;
  }

}
