import {CheckSilkDTO} from './check-silk-dto';
import {Entity} from './entity';

export class SilkCarInfo extends Entity {
  code: string;
  row: number;
  col: number;
  batchNo: string;
}

export class SilkInfo extends CheckSilkDTO {
  /**
   * 抓取标识(1:抓取，2:不抓取)
   */
  grabFlage: '1' | '2';
  /**
   * 剔除标识(1:不剔除，2:剔除)
   */
  eliminateFlage: '1' | '2';
  sideType: 'A' | 'B';
  row: number;
  col: number;
  spec: string;
  batchNo: string;
  gradeName: string;
  doffingNum: string;
  doffingOperatorName: string;
  doffingType: string;
  doffingDateTime: string;
  otherInfo: string;
  exceptions: string[];
}

export class RiambFetchSilkCarRecordResultDTO {
  /**
   * 是否可以下自动包装线（1:不可以，2:可以）
   */
  packeFlage: '1' | '2';
  silkCarInfo: SilkCarInfo;
  silkCount: number;
  silkInfos: SilkInfo[];
}
