import { Component, Input, OnInit, TemplateRef, ContentChild, ViewChild, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { SpinnerDirective } from '../../directives/spinner/spinner.directive';
import { WorkflowProcessStage } from '../../models/data-list/data-list';
import { DetailsTab } from '../../models/details/details';
import { StageEntryData, StageEntryHistory } from '../../models/generic/StageEntryData';
import { EntityInfo, EntityResult } from '../../models/result/EntityResult';
import { AlertsService } from '../../services/alert/alerts.service';
import { Language, LanguageService } from '../../services/language-service/language.service';
import { Reflection } from '../../utilities/reflection';
import { Breadcrumb } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  activeIndex: number = 0;
  private _id: any;
  private isLoading: boolean | any;
  private currentStage: WorkflowProcessStage | any;
  private entityInfo: EntityInfo | any;
  private tabsConfig: DetailsTab[] | any;
  private _tabs: DetailsTab[] | any;

  _field: string | any;
  currentLang: Language | any;
  slickSlideToShowLimit = 6;
  slickConfig = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: this.slickSlideToShowLimit,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };
  detailsStages: StageEntryData[] | any;
  historyDetails: StageEntryHistory[] = [];
  selectedStage: StageEntryData | any;
  mainCardEntityArray: any[] | any;
  entity: any;
  value: number = 0;
  activePads: string | any;
  @Input() tabs: DetailsTab[] = [];
  // @Input() tabs: string[] = [];
  @Input() overviewCols: number[] = [];
  @Input() hasTabs: boolean = true;
  @Input() title: string | any;
  @Input() subTitle: string | any;
  @Input() getDetails?: (id: any) => Observable<EntityResult<any>>;
  @Input() onLoadData?: (entity?: any) => void;
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input("id") set id(value: any) {
    if (value > 0 || value.length > 0) {
      this._id = value;
      this.loadData();
    }
  }
  @ContentChild('cardRegionTitles') cardRegionTitles: TemplateRef<any> | any;
  @ContentChild('pageTitles') pageTitles: TemplateRef<any> | any;
  @ContentChild('mainCard') mainCard: TemplateRef<any> | any;
  @ContentChild('spreadedCards') spreadedCards: TemplateRef<any> | any;
  @ContentChild('pageListTab') pageListTab: TemplateRef<any> | any;
  @ContentChild('customerDetails') customerDetails: TemplateRef<any> | any;
  @ViewChild(SpinnerDirective, { static: false })
  spinnerDirective: SpinnerDirective | any;
  @Output("onSelectCurrentStage") onSelectCurrentStage = new EventEmitter<
    WorkflowProcessStage>();


  get id() {
    return this._id;
  }
  get field() {
    return this._field;
  }
  private setTabsConfig() {
    this.tabsConfig = this._tabs.map((tab: DetailsTab) => {
      let newTab: DetailsTab;
      newTab = {
        title: tab.title,
        tabTemplate: tab.tabTemplate,
      };
      return newTab;
    });

  }
  constructor(
    private translate: TranslateService,
    private _language: LanguageService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertsService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if (params && params["id"]) {
        this.id = params["id"];
      } else {
        if (this.field) {
          this.id = Number(this.route.snapshot.queryParamMap.get(this.field));
        }
      }
    });
    this._language.LangChanged.subscribe((value) => {
      this.translate.use(value);
      if (this.currentLang !== value) {
        if (!this.isLoading) {
          this.loadData();
        }
      }
      this.currentLang = value;
      // this.slickConfig.rtl = this.currentLang === "ar";
      this.slickConfig = { ...this.slickConfig };
    });
  }

  showLoader() {
    setTimeout(() => this.spinnerDirective.showSpinner(), 0);
  }

  hideLoader() {
    setTimeout(() => this.spinnerDirective.hideSpinner(), 0);
  }

  onError(error: any) {
    this.hideLoader();
    this.alertService.errorMessage(error);
  }

  getDataObjectByKey(dataKey: string) {
    return Reflection.GetValueByProbertyName(this.entity, dataKey);
  }
  loadData() {
    if (this.getDetails && !this.isLoading && this.id) {

      this.showLoader();
      this.isLoading = true;
      this.getDetails(this.id).subscribe(
        (response) => {
          this.isLoading = false;
          this.hideLoader();
          if (response && response.success) {
            this.entity = response.entity;
            this.entityInfo = response.entityInfo;

            if (response.entityInfo && response.entityInfo.currentStageInfo) {
              this.currentStage = response.entityInfo.currentStageInfo || null;
            }
            if (
              response.entityInfo &&
              response.entityInfo.stageEntryDetails &&
              response.entityInfo.stageEntryDetails.stageEntryDataVMs
            ) {

              this.selectedStage =
                response.entityInfo.stageEntryDetails.stageEntryDataVMs.find(
                  (stage: { isHead: any; }) => stage.isHead
                ) || null;

              this.detailsStages =
                response.entityInfo.stageEntryDetails.stageEntryDataVMs;
            }
            else {
              this.selectedStage = null;
              this.detailsStages = null;
            }

            this.mainCardEntityArray = this.mainCard
              ? Reflection.ObjectToKeyValueArray(
                this.getDataObjectByKey(this.mainCard.dataKey)
              )
              : null;
            // this.onSelectCurrentStage.emit(this.currentStage);
            // this.hideLoader();

            if (this.onLoadData) {
              this.onLoadData(this.entity);
              this.hideLoader();
            }
          } else {
            this.onError(response.message);
          }
        },
        (response) => {
          this.isLoading = false;
          this.hideLoader();
          this.onError(response);
        },
        () => this.hideLoader()
      );
    }
  }


}



