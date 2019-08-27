import {Batch} from './batch';
import {Grade} from './grade';
import {LineMachine} from './line-machine';
import {Operator} from './operator';

export class Silk {
  id: string;
  code: string;
  batch: Batch;
  lineMachine: LineMachine;
  spindle: number;
  doffingNum: string;
  doffingOperator: Operator;
  doffingType: 'AUTO' | 'MANUAL' | 'BIG_SILK_CAR';
  grade: Grade;
  weight: number;

  get spec(): string {
    return `${this.lineMachine.line.name}-${this.spindle}/${this.lineMachine.item}-${this.doffingNum}`;
  }

  static assign(...sources: any[]): Silk {
    const result = Object.assign(new Silk(), ...sources);
    return result;
  }

  static toEntities(os: Silk[], entities?: { [id: string]: Silk }): { [id: string]: Silk } {
    return (os || []).reduce((acc, cur) => {
      acc[cur.id] = Silk.assign(cur);
      return acc;
    }, {...(entities || {})});
  }

}
