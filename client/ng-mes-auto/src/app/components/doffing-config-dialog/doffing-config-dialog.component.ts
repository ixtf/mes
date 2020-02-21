import {CdkDragDrop, DragDropModule} from '@angular/cdk/drag-drop';
import {ChangeDetectionStrategy, Component, Inject, NgModule} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject, merge} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, takeUntil, tap} from 'rxjs/operators';
import {SEARCH_DEBOUNCE_TIME} from '../../services/util.service';
import {SharedModule} from '../../shared.module';

export class Tile {
  sideType: string;
  row: number;
  col: number;
  silk: SilkModel;
}

export class RowTile {
  row: number;
  tiles: Tile[] = [];
}

export class SilkModel {
  orderBy: number;
  spindle: number;
  color: string;
}

export class LineMachineModel {
  orderBy: number;
  silks: SilkModel[] = [];
}

@Component({
  templateUrl: './doffing-config-dialog.component.html',
  styleUrls: ['./doffing-config-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoffingConfigDialogComponent {
  readonly title;
  readonly rowTiles$ = new BehaviorSubject<RowTile[]>([]);
  readonly lineMachines$ = new BehaviorSubject<LineMachineModel[]>([]);
  readonly form: FormGroup;

  constructor(private fb: FormBuilder,
              private dialogRef: MatDialogRef<DoffingConfigDialogComponent, boolean>,
              @Inject(MAT_DIALOG_DATA) data: { spindleNum: number }) {
    this.form = this.fb.group({
      lineMachineCount: [1, [Validators.required, Validators.min(1)]],
      spindleNum: [data.spindleNum, [Validators.required, Validators.min(1)]],
      row: [1, [Validators.required, Validators.min(3), Validators.max(4)]],
      col: [6, [Validators.required, Validators.min(4), Validators.max(6)]],

      // lineMachineCount: [1, [Validators.required, Validators.min(1)]],
      // spindleNum: [data.spindleNum, [Validators.required, Validators.min(1)]],
      // row: [3, [Validators.required, Validators.min(3), Validators.max(4)]],
      // col: [4, [Validators.required, Validators.min(4), Validators.max(6)]],
    });

    this.nextRowTiles();
    merge(this.rowCtrl.valueChanges, this.colCtrl.valueChanges).pipe(
      takeUntil(dialogRef.afterClosed()),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      filter(() => this.form.valid),
      tap(() => this.nextRowTiles()),
    ).subscribe();

    this.nextLineMachines();
    merge(this.lineMachineCountCtrl.valueChanges, this.spindleNumCtrl.valueChanges).pipe(
      takeUntil(dialogRef.afterClosed()),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      filter(() => this.form.valid),
      tap(() => this.nextLineMachines()),
    ).subscribe();
  }

  get lineMachineCountCtrl() {
    return this.form.get('lineMachineCount');
  }

  get spindleNumCtrl() {
    return this.form.get('spindleNum');
  }

  get rowCtrl() {
    return this.form.get('row');
  }

  get colCtrl() {
    return this.form.get('col');
  }

  static open(dialog: MatDialog, data: { spindleNum: number; }) {
    return dialog.open(DoffingConfigDialogComponent, {data, width: '90vw'})
      .afterClosed().pipe(filter(it => it));
  }

  dropTile(ev: CdkDragDrop<string[], any>) {
    console.log('dropTile', ev);
  }

  dropSilk(ev: CdkDragDrop<string[], any>) {
    console.log('dropTile', ev);
  }

  private nextRowTiles() {
    const rows = this.rowCtrl.value;
    const cols = this.colCtrl.value;
    const rowTiles: RowTile[] = [];
    for (let row = 1; row <= rows; row++) {
      const rowTile = new RowTile();
      rowTile.row = row;
      rowTiles.push(rowTile);
      ['A', 'B'].forEach(sideType => {
        for (let col = 1; col <= cols; col++) {
          const tile = new Tile();
          tile.sideType = sideType;
          tile.row = row;
          tile.col = col;
          rowTile.tiles.push(tile);
        }
      });
    }
    this.rowTiles$.next(rowTiles);
  }

  private nextLineMachines() {
    const lineMachineCount = this.lineMachineCountCtrl.value;
    const spindleNum = this.spindleNumCtrl.value;
    const lineMachines: LineMachineModel[] = [];
    for (let orderBy = 1; orderBy <= lineMachineCount; orderBy++) {
      const lineMachine = new LineMachineModel();
      lineMachine.orderBy = orderBy;
      lineMachines.push(lineMachine);
      for (let spindle = 1; spindle <= spindleNum; spindle++) {
        const silk = new SilkModel();
        silk.orderBy = orderBy;
        silk.spindle = spindle;
        lineMachine.silks.push(silk);
      }
    }
    this.lineMachines$.next(lineMachines);
  }
}


@NgModule({
  declarations: [
    DoffingConfigDialogComponent,
  ],
  entryComponents: [
    DoffingConfigDialogComponent,
  ],
  imports: [
    SharedModule,
    DragDropModule,
  ],
  exports: [
    DoffingConfigDialogComponent,
  ],
})
export class DoffingConfigDialogComponentModule {
}
