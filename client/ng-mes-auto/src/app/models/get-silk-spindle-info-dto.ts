export class Item {
  spindleCode: string;
  grabFlage: string;
  eliminateFlage: string;
  batchNo: string;
  actualPosition: string;
  grade: string;
}

export class GetSilkSpindleInfoDTO {
  bindNum: string;
  spec: string;
  /**
   * 是否可以下自动包装线（1:不可以，2:可以）
   */
    // tslint:disable-next-line:variable-name
  AutomaticPackeFlage: '1' | '2';
  list: Item[];
}
