import {AfterContentInit, ChangeDetectionStrategy, Component, ElementRef, Inject, NgModule} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {QRCodeModule} from 'angularx-qrcode';
import {isArray} from 'util';
import {PackageBox} from '../../models/package-box';
import {SharedModule} from '../../shared.module';

@Component({
  templateUrl: './package-box-print.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageBoxPrintComponent implements AfterContentInit {
  readonly packageBoxes: PackageBox[];

  constructor(private elementRef: ElementRef,
              private dialogRef: MatDialogRef<PackageBoxPrintComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PackageBox[]) {
    this.packageBoxes = data;
  }

  static print(dialog: MatDialog, data: PackageBox | PackageBox[]) {
    if (!isArray(data)) {
      data = [data] as PackageBox[];
    }
    dialog.open(PackageBoxPrintComponent, {data});
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
      popupWin.document.close();
      this.dialogRef.close();
    });
  }
}

@NgModule({
  declarations: [
    PackageBoxPrintComponent,
  ],
  entryComponents: [
    PackageBoxPrintComponent,
  ],
  imports: [
    SharedModule,
    QRCodeModule,
  ],
})
export class PackageBoxPrintComponentModule {
}
