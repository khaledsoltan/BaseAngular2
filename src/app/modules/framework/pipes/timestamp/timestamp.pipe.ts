import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, NgZone, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '../../services/language-service/language.service';

@Pipe({
  name: 'timestamp'
})
export class TimestampPipe implements PipeTransform, OnDestroy {


  private timer: number;
  constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone,
    private translateService: TranslateService,
    private datePipe: DatePipe
  ) { }
  transform(value: string) {
    this.removeTimer();
    let d = new Date(value);
    let now = new Date();
    let seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
    let timeToUpdate = (Number.isNaN(seconds)) ? 1000 : this.getSecondsUntilUpdate(seconds) * 1000;
    this.timer = this.ngZone.runOutsideAngular(() => {
      if (typeof window !== 'undefined') {
        return window.setTimeout(() => {
          this.ngZone.run(() => this.changeDetectorRef.markForCheck());
        }, timeToUpdate);
      }
      return null;
    });
    let minutes = Math.round(Math.abs(seconds / 60));
    let hours = Math.round(Math.abs(minutes / 60));
    let days = Math.round(Math.abs(hours / 24));
    let months = Math.round(Math.abs(days / 30.416));
    let years = Math.round(Math.abs(days / 365));
    if (Number.isNaN(seconds)) {
      return '';
    } else if (seconds <= 45) {
      return this.translateService.instant('chat.aFewSecondsAgo');
    } else if (seconds <= 90) {
      return this.translateService.instant('chat.aMinuteAgo');
    } else if (minutes <= 45) {
      return this.translateService.instant('chat.minutesAgo', { min: minutes });
    } else if (minutes <= 90) {
      return this.translateService.instant('chat.anHourAgo');
    } else if (hours <= 22) {
      return this.translateService.instant('chat.hoursAgo', { hour: hours });
    } else if (hours <= 36) {
      return this.translateService.instant('chat.yesterday');
    } else if (days <= 25) {
      var lang = this.translateService.currentLang;
      if (lang === Language.Arabic) {
        return this.datePipe.transform(value, 'yyyy-MM-dd, h:mm a').replace("AM", "ص").replace("PM", "م");
      }
      return this.datePipe.transform(value, 'yyyy-MM-dd, h:mm a');

    }
    else if (days <= 545) {
      return this.translateService.instant('chat.aYearAgo');
    }
    else {
      return this.translateService.instant('chat.yearsAgo', { year: years });
    }
  }
  ngOnDestroy(): void {
    this.removeTimer();
  }
  private removeTimer() {
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }
  private getSecondsUntilUpdate(seconds: number) {
    let min = 60;
    let hr = min * 60;
    let day = hr * 24;
    if (seconds < min) { // less than 1 min, update every 2 secs
      return 2;
    } else if (seconds < hr) { // less than an hour, update every 30 secs
      return 30;
    } else if (seconds < day) { // less then a day, update every 5 mins
      return 300;
    } else { // update every hour
      return 3600;
    }
  }
}
