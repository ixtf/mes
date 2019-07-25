export class SapT001l {
  id: string;
  lgort: string;
  lgobe: string;

  static assign(...sources: any[]): SapT001l {
    const result = Object.assign(new SapT001l(), ...sources);
    return result;
  }

  static toEntities(os: SapT001l[], entities?: { [id: string]: SapT001l }): { [id: string]: SapT001l } {
    return (os || []).reduce((acc, cur) => {
      acc[cur.id] = SapT001l.assign(cur);
      return acc;
    }, {...(entities || {})});
  }
}
