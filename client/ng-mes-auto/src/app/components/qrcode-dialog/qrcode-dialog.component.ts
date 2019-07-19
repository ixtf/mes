import {ChangeDetectionStrategy, Component, Inject, NgModule} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {QRCodeModule} from 'angularx-qrcode';
import {SharedModule} from '../../shared.module';

export class QrcodeOptions {
  qrdata: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  usesvg?: boolean;
  displayValue?: boolean;

  static assign(data: QrcodeOptions): QrcodeOptions {
    return Object.assign(new QrcodeOptions(), {
      size: 256,
      level: 'M',
      usesvg: true,
      displayValue: true,
    }, data);
  }
}

@Component({
  templateUrl: './qrcode-dialog.component.html',
  styleUrls: ['./qrcode-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrcodeDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: QrcodeOptions) {
  }

  static open(dialog: MatDialog, options: QrcodeOptions) {
    const data = QrcodeOptions.assign(options);
    dialog.open(QrcodeDialogComponent, {data});
  }
}

@NgModule({
  declarations: [
    QrcodeDialogComponent,
  ],
  entryComponents: [
    QrcodeDialogComponent,
  ],
  imports: [
    SharedModule,
    QRCodeModule,
  ],
  exports: [
    QRCodeModule,
  ],
})
export class QrcodeDialogComponentModule {
}
