import {Batch} from './batch';
import {Grade} from './grade';

export class TemporaryBox {
  id: string;
  code: string;
  batch: Batch;
  grade: Grade;
  count: number;

  static assign(...sources: any[]): TemporaryBox {
    const result = Object.assign(new TemporaryBox(), ...sources);
    return result;
  }

  static toEntities(os: TemporaryBox[], entities?: { [id: string]: TemporaryBox }): { [id: string]: TemporaryBox } {
    return (os || []).reduce((acc, cur) => {
      acc[cur.id] = TemporaryBox.assign(cur);
      return acc;
    }, {...(entities || {})});
  }

}
