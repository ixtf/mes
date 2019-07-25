import {animate, transition, trigger, useAnimation} from '@angular/animations';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Dispatch} from '@ngxs-labs/dispatch-decorator';
import {Select} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {shake} from '../../../services/animations';
import {AppState, LoginAction} from '../../../store/app.state';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('shake', [
      transition('void <=> *', [animate(0)]),
      transition('* <=> *', [useAnimation(shake)]),
    ]),
  ]
})
export class LoginPageComponent implements OnInit {
  @Select(AppState.isShake)
  readonly shake$: Observable<boolean>;
  hide = true;
  readonly form = this.fb.group({
    loginId: [null, Validators.required],
    loginPassword: [null, Validators.required],
    returnUrl: null
  });

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      map(it => it.get('returnUrl'))
    ).subscribe(returnUrl => {
      this.form.patchValue({returnUrl});
    });
  }

  @Dispatch()
  login() {
    return new LoginAction(this.form.value);
  }
}
