import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppUrls } from 'src/app/modules/shared/helpers/app-urls';
@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {
  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate([AppUrls.home]);
  }

}
