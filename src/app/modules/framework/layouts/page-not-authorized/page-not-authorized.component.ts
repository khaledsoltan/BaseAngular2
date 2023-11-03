import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppUrls } from 'src/app/modules/shared/helpers/app-urls';

@Component({
  selector: 'app-page-not-authorized',
  templateUrl: './page-not-authorized.component.html',
  styleUrls: ['./page-not-authorized.component.scss']
})
export class PageNotAuthorizedComponent {
  constructor(private router: Router) {

  }

  back() {
    this.router.navigate([AppUrls.home]);
  }
}
