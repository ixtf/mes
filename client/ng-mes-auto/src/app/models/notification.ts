import {CodeCompare, LineCompare} from '../services/util.service';
import {Line} from './line';
import {Operator} from './operator';
import {Workshop} from './workshop';

export class Notification {
  id: string;
  workshops: Workshop[];
  lines: Line[];
  note: string;
  creator: Operator;
  createDateTime: Operator;
  deleted: boolean;

  static assign(...sources: any[]): Notification {
    const result = Object.assign(new Notification(), ...sources);
    return result;
  }

  static toEntities(os: Notification[], entities?: { [id: string]: Notification }): { [id: string]: Notification } {
    return (os || []).reduce((acc, cur) => {
      acc[cur.id] = Notification.assign(cur);
      return acc;
    }, {...(entities || {})});
  }

  get linesSpec(): string {
    if (this.lines && this.lines.length > 0) {
      return this.lines.sort(LineCompare).map(it => it.name).join(',');
    }
    return '';
  }

  get workshopsSpec(): string {
    if (this.workshops && this.workshops.length > 0) {
      return this.workshops.sort(CodeCompare).map(it => it.name).join(',');
    }
    return '';
  }

}
