
import { Component, Input, OnInit } from '@angular/core';

export interface Breadcrumb {
  title: string;
  path: string;
  disabled?: boolean;
  icon?: string;
}

@Component({
  selector: 'breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.less']
})

export class BreadcrumbComponent implements OnInit {

  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input() hidden = false;

  constructor() {

    // this.router.events.pipe(
    //   filter(value => value instanceof NavigationEnd)).subscribe(
    //     (value: any) => {
    //       if (value.url.indexOf('dashboard') === -1) {
    //         this.hidden = false;

    //       } else {
    //         this.hidden = true;
    //       }
    //       this.breadcrumbs = [];
    //       let urlsLength = 0;
    //       const urlSplits: string[] = value.url.split('/').splice(1);
    //       let fullPath = '';
    //       for (let i = 0; i < urlSplits.length; i++) {
    //         fullPath += '/' + urlSplits[i];
    //         if (!isNaN(+urlSplits[i])) {
    //           urlsLength++;
    //           continue;
    //         }

    //         if (urlSplits[i].indexOf('%') > -1) {
    //           break;
    //         }

    //         const translatedRouted =
    //           urlSplits[i] && urlSplits[i].indexOf('?') > -1 ? urlSplits[i].substring(0, urlSplits[i].indexOf('?')) : urlSplits[i];

    //         this.breadcrumbs.push({
    //           key: this.translateService.instant(`routes.${translatedRouted}`),
    //           path: fullPath.toLowerCase() === '/main' ? fullPath + '/dashboard' : fullPath
    //         });

    //         urlsLength++;
    //         // if (urlsLength === 3) { break; } // allow only first three urls
    //       }
    //     });
  }

  ngOnInit() { }
}
