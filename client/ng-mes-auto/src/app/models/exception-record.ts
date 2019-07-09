import {LineMachine} from './line-machine';
import {Operator} from './operator';
import {Silk} from './silk';
import {SilkException} from './silk-exception';

export class ExceptionRecord {
  id: string;
  lineMachine: LineMachine;
  doffingNum: string;
  spindle: number;
  silk: Silk;
  exception: SilkException;
  creator: Operator;
  createDateTime: Date;
  handled: boolean;
  handler: Operator;
  handleDateTime: Date;

  static assign(...sources: any[]): ExceptionRecord {
    const result = Object.assign(new ExceptionRecord(), ...sources);
    return result;
  }

  static toEntities(os: ExceptionRecord[], entities?: { [id: string]: ExceptionRecord }): { [id: string]: ExceptionRecord } {
    return (os || []).reduce((acc, cur) => {
      acc[cur.id] = ExceptionRecord.assign(cur);
      return acc;
    }, {...(entities || {})});
  }
}
