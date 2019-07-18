import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AbstractControl, ValidationErrors} from '@angular/forms';
import {MatDialog, MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {interval} from 'rxjs';
import {share} from 'rxjs/operators';
import {isArray, isNullOrUndefined, isObject} from 'util';
import {EventSource} from '../models/event-source';
import {Line} from '../models/line';
import {LineMachine} from '../models/line-machine';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor(private http: HttpClient,
              private translate: TranslateService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) {
  }

  showSuccess(message?: string, action?: string, config?: MatSnackBarConfig) {
    config = config || {duration: 3000};
    message = message || 'Toast.success';
    this.translate.get(message).subscribe(res => this.snackBar.open(res, action, config));
  }

  barcode(ev: MouseEvent, s: string) {
  }

  qrcode(ev: MouseEvent, s: string) {
  }

}

export const FULL_SCREEN = (element) => {
  try {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullScreen();
    }
  } catch (e) {
    console.log(e);
  }
};

export const COPY = (s: string) => {
  const el = document.createElement('textarea');
  el.value = s;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};
export const upEle = (array: any[], ele: any): any[] => {
  if (!array || !ele || !isArray(array)) {
    return array;
  }
  array = [...(array || [])];
  const i = array.findIndex(it => {
    if (it === ele) {
      return true;
    }
    if (isObject(it)) {
      return (it && it.id) === ele.id;
    }
    return false;
  });
  if (i <= 0) {
    return array;
  }
  array[i] = array[i - 1];
  array[i - 1] = ele;
  return array;
};
export const downEle = (array: any[], ele: any): any[] => {
  if (!array || !ele || !isArray(array)) {
    return array;
  }
  array = [...(array || [])];
  const i = array.findIndex(it => {
    if (it === ele) {
      return true;
    }
    if (isObject(it)) {
      return (it && it.id) === ele.id;
    }
    return false;
  });
  if (i < 0 || i === (array.length - 1)) {
    return array;
  }
  array[i] = array[i + 1];
  array[i + 1] = ele;
  return array;
};
export const CheckQ = (sV: string, qV: string): boolean => {
  let s = sV || '';
  let q = qV || '';
  s = s.toLocaleLowerCase();
  q = q.toLocaleLowerCase();
  return s.includes(q);
};

export const INTERVAL$ = interval(1000).pipe(share());
export const SEARCH_DEBOUNCE_TIME = 500;
export const PAGE_SIZE_OPTIONS = [50, 100, 1000];
export const entityValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = control && control.value;
  if (value && !value.id) {
    return {entity: true};
  }
  return null;
};
export const displayWithLine = (line: Line) => line && line.name;
export const compareWithId = (o1: any, o2: any) => {
  if (o1 === o2) {
    return true;
  }
  if (isNullOrUndefined(o1) || isNullOrUndefined(o2)) {
    return false;
  }
  return o1.id === o2.id;
};

export const DefaultCompare = (o1: any, o2: any): number => {
  if (o1.id === '0') {
    return -1;
  }
  if (o2.id === '0') {
    return 1;
  }
  return moment(o1.modifyDateTime).isAfter(o2.modifyDateTime) ? -1 : 1;
};
export const SortByCompare = (o1: any, o2: any): number => {
  if (o1 && o2) {
    return (o1 === o2 || o1.id === o2.id) ? 0 : o1.sortBy - o2.sortBy;
  }
  return o1 ? 1 : -1;
};
export const CodeCompare = (o1: any, o2: any): number => {
  if (o1 && o2) {
    return (o1 === o2 || o1.id === o2.id) ? 0 : o1.code.localeCompare(o2.code);
  }
  return o1 ? 1 : -1;
};
export const EventSourceCompare = (o1: EventSource, o2: EventSource): number => {
  if (o1 && o2) {
    return (o1 === o2 || o1.eventId === o2.eventId) ? 0 :
      (moment(o1.fireDateTime).isAfter(o2.fireDateTime) ? -1 : 1);
  }
  return o1 ? 1 : -1;
};
export const LineCompare = (o1: Line, o2: Line): number => {
  if (o1 && o2) {
    return (o1 === o2 || o1.id === o2.id) ? 0 : o1.name.localeCompare(o2.name);
  }
  return o1 ? 1 : -1;
};
export const LineMachineCompare = (o1: LineMachine, o2: LineMachine): number => {
  if (o1 && o2) {
    if ((o1 === o2 || o1.id === o2.id)) {
      return 0;
    }
    const lineCompare = LineCompare(o1.line, o2.line);
    return lineCompare !== 0 ? lineCompare : (o1.item - o2.item);
  }
  return o1 ? 1 : -1;
};
