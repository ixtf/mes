export class SilkCarRecordDestination {
  id: string;
  name: string;

  static assign(...sources: any[]): SilkCarRecordDestination {
    const result = Object.assign(new SilkCarRecordDestination(), ...sources);
    return result;
  }

  static toEntities(os: SilkCarRecordDestination[], entities?: { [id: string]: SilkCarRecordDestination }): { [id: string]: SilkCarRecordDestination } {
    return (os || []).reduce((acc, cur) => {
      acc[cur.id] = SilkCarRecordDestination.assign(cur);
      return acc;
    }, {...(entities || {})});
  }

}
