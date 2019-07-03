import {animate, animateChild, animation, group, keyframes, query, style, transition, trigger} from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('HomePage <=> AboutPage', [
    style({position: 'relative'}),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ]),
    query(':enter', [
      style({left: '-100%'})
    ]),
    query(':leave', animateChild()),
    group([
      query(':leave', [
        animate('300ms ease-out', style({left: '100%'}))
      ]),
      query(':enter', [
        animate('300ms ease-out', style({left: '0%'}))
      ])
    ]),
    query(':enter', animateChild()),
  ]),
  transition('* <=> FilterPage', [
    style({position: 'relative'}),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ]),
    query(':enter', [
      style({left: '-100%'})
    ]),
    query(':leave', animateChild(), {optional: true}),
    group([
      query(':leave', [
        animate('200ms ease-out', style({left: '100%'}))
      ], {optional: true}),
      query(':enter', [
        animate('300ms ease-out', style({left: '0%'}))
      ])
    ]),
    query(':enter', animateChild()),
  ]),
]);

export const shake = animation(
  animate(
    '{{ timing }}s {{ delay }}s',
    keyframes([
      style({transform: 'translate3d(0, 0, 0)', offset: 0}),
      style({transform: 'translate3d(-10px, 0, 0)', offset: 0.1}),
      style({transform: 'translate3d(10px, 0, 0)', offset: 0.2}),
      style({transform: 'translate3d(-10px, 0, 0)', offset: 0.3}),
      style({transform: 'translate3d(10px, 0, 0)', offset: 0.4}),
      style({transform: 'translate3d(-10px, 0, 0)', offset: 0.5}),
      style({transform: 'translate3d(10px, 0, 0)', offset: 0.6}),
      style({transform: 'translate3d(-10px, 0, 0)', offset: 0.7}),
      style({transform: 'translate3d(10px, 0, 0)', offset: 0.8}),
      style({transform: 'translate3d(-10px, 0, 0)', offset: 0.9}),
      style({transform: 'translate3d(0, 0, 0)', offset: 1}),
    ])
  ),
  {params: {timing: 1, delay: 0}}
);

export const insertRemoveAnimation = trigger('insertRemove', [
  transition(':enter', [
    style({opacity: 0}),
    animate('.5s', style({opacity: 1})),
  ]),
  transition(':leave', [
    animate('.5s', style({opacity: 0}))
  ]),
]);
