import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material';

export class BarcodeOptions {
  value: string;
  format?: '' | 'CODE128' | 'CODE128A' | 'CODE128B' | 'CODE128C' | 'EAN' | 'UPC' | 'EAN8' | 'EAN5' | 'EAN2' | 'CODE39' | 'ITF14' | 'MSI' | 'MSI10' | 'MSI11' | 'MSI1010' | 'MSI1110' | 'pharmacode' | 'codabar';
  elementType?: 'svg' | 'img' | 'canvas';
  displayValue?: boolean;
  textPosition?: 'bottom';
  bcHeight?: number;
  bcWidth?: number;

  static assign(data: BarcodeOptions): BarcodeOptions {
    return Object.assign(new BarcodeOptions(), {
      format: 'CODE128',
      elementType: 'svg',
      displayValue: true,
      textPosition: 'bottom',
      bcHeight: 100,
      bcWidth: 2,
    }, data);
  }
}

@Component({
  templateUrl: './barcode-dialog.component.html',
  styleUrls: ['./barcode-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarcodeDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) private data: BarcodeOptions) {
  }

  static open(dialog: MatDialog, options: BarcodeOptions) {
    const data = BarcodeOptions.assign(options);
    dialog.open(BarcodeDialogComponent, {data});
  }
}
