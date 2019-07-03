import {Grade} from './grade';
import {Silk} from './silk';
import {SilkException} from './silk-exception';

export class SilkRuntime {
  silk: Silk;
  sideType: string;
  row: number;
  col: number;
  grade: Grade;
  exceptions: SilkException[];

  static assign(...sources: any[]): SilkRuntime {
    const result = Object.assign(new SilkRuntime(), ...sources);
    return result;
  }

  static toEntities(os: SilkRuntime[], entities?: { [id: string]: SilkRuntime }): { [id: string]: SilkRuntime } {
    return (os || []).reduce((acc, cur) => {
      acc[cur.silk.id] = SilkRuntime.assign(cur);
      return acc;
    }, {...(entities || {})});
  }
}
