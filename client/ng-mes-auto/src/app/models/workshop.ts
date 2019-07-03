import {Corporation} from './corporation';
import {LoggableEntity} from './loggable-entity';
import {SapT001l} from './sapT001l';

export class Workshop extends LoggableEntity {
  id: string;
  name: string;
  code: string;
  note: string;
  corporation: Corporation;
  sapT001ls: SapT001l[];
  sapT001lsForeign: SapT001l[];
  sapT001lsPallet: SapT001l[];

  static assign(...sources: any[]): Workshop {
    const result = Object.assign(new Workshop(), ...sources);
    return result;
  }

  static toEntities(os: Workshop[], entities?: { [id: string]: Workshop }): { [id: string]: Workshop } {
    return (os || []).reduce((acc, cur) => {
      acc[cur.id] = Workshop.assign(cur);
      return acc;
    }, {...(entities || {})});
  }
}
