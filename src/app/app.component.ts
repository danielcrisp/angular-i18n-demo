import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable, timer, of, Subscription } from 'rxjs';
import { switchMap, startWith, share } from 'rxjs/operators';

type Trend = 'up' | 'down' | 'stable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  // Different data streams
  now$: Observable<number>;
  change$: Observable<number>;
  value$: Observable<number>;
  trend$: Observable<Trend>;
  transactions$: Observable<number>;

  // Non-observable data
  watchers = 0;
  closingValue = Math.floor(Math.random() * 10000);

  private subscription = Subscription.EMPTY;

  ngOnInit () {

    //
    // DATES
    //

    // Account for slight millisecond offset when starting
    const offset = 1000 - (Date.now() % 1000);

    this.now$ = timer(offset, 1000)
    .pipe(
        startWith(Date.now()),
        switchMap(() => {
          return of(Date.now());
        }),
        // Share this Observable because it is reused
        share()
      );

    //
    // CHANGE IN VALUE
    //

    // Reuse the date timer
    this.change$ = this.now$.pipe(
      startWith(0),
      switchMap(() => {
        return of((Math.random() * 100) * (Math.random() > .5 ? 1 : -1));
      }),
      // Share this Observable because it is reused
      share()
    );

    //
    // THE VALUE
    //

    let startValue = Math.random() * 9999;

    // Piggyback off change$
    this.value$ = this.change$.pipe(
      switchMap((change) => {
        // Change can be positive or negative
        return of(startValue += change);
      }),
      startWith(startValue)
    );

    // Piggyback off change$
    this.trend$ = this.change$.pipe(
      switchMap((change) => {
        let trend: Trend = 'stable';
        if (change > 0) {
          trend = 'up';
        } else if (change < 0) {
          trend = 'down';
        }
        return of(trend);
      })
    );

    //
    // TRANSACTIONS
    //

    let startTransactions = Math.floor(Math.random() * 100);

    // Reuse the date timer
    this.transactions$ = this.now$.pipe(
      startWith(startTransactions),
      switchMap(() => {
        return of(startTransactions += Math.floor(Math.random() * 100));
      })
    );

    //
    // WATCHERS
    //

    this.subscription = this.now$
      .subscribe(() => {
        this.watchers = Math.floor(Math.random() * 15);
      });

  }

  ngOnDestroy () {
    this.subscription.unsubscribe();
  }

}
