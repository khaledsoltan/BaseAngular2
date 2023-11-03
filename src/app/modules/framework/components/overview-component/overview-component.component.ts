import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language-service/language.service';

@Component({
  selector: 'app-overview-component',
  templateUrl: './overview-component.component.html',
  styleUrls: ['./overview-component.component.scss']
})
export class OverviewComponentComponent implements OnInit {
  @Input() overviewCols: number[] = [];
  @Input() entity: [] = [];

  constructor(
    private translate: TranslateService,
    private languagService: LanguageService,
  ) { }

  ngOnInit(): void {
  }

}
