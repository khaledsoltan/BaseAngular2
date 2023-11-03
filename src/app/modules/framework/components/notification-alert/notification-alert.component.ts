import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerDirective } from '../../directives/spinner/spinner.directive';
import { CommonUrls } from '../../models/common-urls';
import { NotificationLogs } from '../../models/push-notification/push-notification';
@Component({
  selector: 'app-notification-alert',
  templateUrl: './notification-alert.component.html',
  styleUrls: ['./notification-alert.component.scss']
})
export class NotificationAlertComponent implements OnInit {
  customerNotifications: NotificationLogs[] = [];
  @ViewChild(SpinnerDirective) spinnerDirective!: SpinnerDirective;
  constructor(
    private router: Router,
  ) { }
  ngOnInit() {
  }
  goToNotification() {
    this.router.navigate([CommonUrls.pushNotifications.list]);
  }
}
