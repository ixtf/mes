import {AfterContentInit, ChangeDetectionStrategy, Component, ElementRef, Inject, NgModule} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {QRCodeModule} from 'angularx-qrcode';
import {NgxBarcodeModule} from 'ngx-barcode';
import {isArray} from 'util';
import {SilkCar} from '../../models/silk-car';
import {SharedModule} from '../../shared.module';

@Component({
  templateUrl: './silk-car-print.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SilkCarPrintComponent implements AfterContentInit {
  readonly silkCars: SilkCar[];

  constructor(private elementRef: ElementRef,
              private dialogRef: MatDialogRef<SilkCarPrintComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SilkCar[]) {
    this.silkCars = data;
  }

  static print(dialog: MatDialog, inputData: SilkCar | SilkCar[]) {
    const data = isArray(inputData) ? inputData : [inputData];
    dialog.open(SilkCarPrintComponent, {data});
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
      popupWin.document.open();
      popupWin.document.write(`<html>
<head>
<link rel="stylesheet" type="text/css" href="assets/print/normalize.css">
<link rel="stylesheet" type="text/css" href="assets/print/package-box.css">
</head>
<body onload="window.print();window.close()">${this.elementRef.nativeElement.innerHTML}</body>
</html>`);
      this.dialogRef.close();
      // popupWin.document.close();
    });
  }
}

@NgModule({
  declarations: [
    SilkCarPrintComponent,
  ],
  entryComponents: [
    SilkCarPrintComponent,
  ],
  imports: [
    SharedModule,
    NgxBarcodeModule,
    QRCodeModule,
  ]
})
export class SilkCarPrintComponentModule {
}
