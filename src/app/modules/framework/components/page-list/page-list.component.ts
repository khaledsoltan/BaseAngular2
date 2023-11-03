import { SearchFieldVm } from '../../models/search-model/SearchModel';
import { ActionData } from '../../models/action/actions';
import {
  DataListConfig,
  WorkflowProcessStage,
  Column,
  StaticTab
} from '../../models/data-list/data-list';
import { AdvancedSearchConfig, SearchField } from '../../models/advanced-search/advanced-search';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { PageListConfig } from '../../models/page-list/page-list';
import {
  ActionList,
  ActionListType,
} from '../../models/action/actions';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search.component';
import { DataListComponent } from '../data-list/data-list.component';
import { TranslateService } from '@ngx-translate/core';
import { ActionTypeEnum } from '../../enums/action/action-type-tnum';
import { Language, LanguageService } from '../../services/language-service/language.service';


@Component({
  selector: 'page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.scss']
})
export class PageListComponent implements OnInit {
  /* #region  Fields & Props & Parameters */

  // child components
  @ViewChild(AdvancedSearchComponent)
  advancedSearchComponent: AdvancedSearchComponent;
  @ViewChild(DataListComponent, { static: true }) dataListComponent: DataListComponent;
  // config for page-list
  @Input('config') config: PageListConfig;

  // common actions
  @Input('commonActions') commonActions: ActionList;

  // advanced search
  @Input('advancedSearchConfig') advancedSearchConfig: AdvancedSearchConfig;

  // data-list actions
  @Input('titleActions') titleActions: ActionList;
  @Input('hoverActions') hoverActions: ActionList;
  @Input('rowActions') rowActions: ActionList;

  // data-list properties
  @Input('itemsList') itemsList: any[];
  @Input('stages') stages: WorkflowProcessStage[];

  @Input('columns') columns: Column[];
  @Input('constFilters') constFilters: SearchFieldVm[];
  @Input('dataListConfig') dataListConfig: DataListConfig;

  @Output('onCreateClick') onCreateClick = new EventEmitter<ActionData>();
  @Output('onUpdateClick') onUpdateClick = new EventEmitter<ActionData>();
  @Output('onDetailsClick') onDetailsClick = new EventEmitter<ActionData>();
  @Output('onStageChanged') onStageChanged = new EventEmitter<WorkflowProcessStage>();
  @Output('onTabChanged') onTabChanged = new EventEmitter<StaticTab>();
  @Output('onUploadClick') onUploadClick = new EventEmitter<ActionData>();


  private currentLang: Language;


  /* #endregion */

  /* #region  Constractor */
  constructor(
    private translate: TranslateService,
    private _language: LanguageService) { }
  /* #endregion */

  /* #region  Events */
  ngOnInit() {
    this.handleDefaultConfig();
    this.handleCommonActions();
    this.handleConstFilterForAdvancedSearch();
    this._language.LangChanged.subscribe(value => {
      this.currentLang = value;
      this.translate.use(this.currentLang);

    });
  }

  // action events
  onToggleCol(event: { col: Column; columns: Column[]; }) {
    const index = event.columns.findIndex(col => col.field === event.col.field);
    event.columns[index].hidden = event.columns[index].hidden;
    this.columns = [...event.columns];
  }

  hideAction = (action) => {
    if (this.config && this.config.checkActionPermission && action) {
      return !this.config.checkActionPermission(action);
    } else {
      return false;
    }
  };
  onShowAllColumns(cols: Column[]) {
    this.columns = [...cols];
  }

  // advanced-search events
  onAdvancedSearch(searchFields: any[]) {
    if (searchFields) {
      this.dataListComponent.search(searchFields);
    }
  }

  onAdvancedResetSearch() {
    this.advancedSearchComponent.resetForm();
    this.dataListComponent.resetForm();
    this.dataListComponent.loadData();
  }

  onDataListSearch() {
    if (this.advancedSearchComponent !== null
      && this.advancedSearchComponent !== undefined) {
      this.advancedSearchComponent.resetForm();
    }
  }

  // data-list events
  handleStageChanged(currentStage) {
    if (this.onStageChanged) {
      this.onStageChanged.emit(currentStage);
    }
  }

  handleTabChanged(currentTab: StaticTab) {
    if (this.onStageChanged) {
      this.onTabChanged.emit(currentTab);
    }
  }


  handleUpdateClick($event) {
    if (this.onUpdateClick) {
      this.onUpdateClick.emit($event);
    }
  }
  handleCreateClick($event) {
    if (this.onCreateClick) {
      this.onCreateClick.emit($event);
    }
  }
  handleDetailsClick($event) {
    if (this.onDetailsClick) {
      this.onDetailsClick.emit($event);
    }
  }

  /* #endregion */

  /* #region  Methods */
  handleDefaultConfig() {
    this.config = this.config || {};

    if (
      this.config.hasAdvancedSearch == null ||
      this.config.hasAdvancedSearch === undefined
    ) {
      this.config.hasAdvancedSearch = true;
    }
    if (
      this.config.hasCreateAction == null ||
      this.config.hasCreateAction === undefined
    ) {
      this.config.hasCreateAction = true;
    }
    if (
      this.config.showAdvancedSearch == null ||
      this.config.showAdvancedSearch === undefined
    ) {
      this.config.showAdvancedSearch = false;
    }
    // handle commonActions default
    if (
      this.config.hasCommonActions == null ||
      this.config.hasCommonActions === undefined
    ) {
      this.config.hasCommonActions = false;
    }
    if (
      this.config.showCommonActions == null ||
      this.config.showCommonActions === undefined
    ) {
      this.config.showCommonActions = true;
    }
    if (this.dataListConfig) {
      this.dataListConfig.enableAuth = this.config.enableAuth;
      this.dataListConfig.checkActionPermission = this.config.checkActionPermission;
    }
  }

  handleCommonActions() {
    // handle common actions
    this.commonActions = this.commonActions || { type: ActionListType.default };
    this.commonActions.list = this.commonActions.list || [];

    if (this.config.hasCreateAction) {
      this.commonActions.list.push({
        type: ActionTypeEnum.create,
        title: 'helpers.buttons.createNewButton',
        hidden: () => {
          if (this.config.enableAuth && this.config.checkActionPermission) {
            return !(this.config.hasCreateAction && this.config.checkActionPermission(ActionTypeEnum.create));
          } else {
            return !this.config.hasCreateAction;
          }
        },
        onClick: (data: ActionData) => {
          if (this.onCreateClick) {
            this.onCreateClick.emit(data);
          }
        }
      });
    }
    // if advancedSearch is initialized then add search icon
    if (this.advancedSearchConfig && this.config.hasAdvancedSearch) {
      this.commonActions.list.push({
        type: ActionTypeEnum.search,
        title: 'helpers.buttons.searchButton',
        onClick: () =>
          (this.config.showAdvancedSearch = !this.config.showAdvancedSearch)
      });
    }
  }
  handleConstFilterForAdvancedSearch() {
    if (this.advancedSearchConfig && this.advancedSearchConfig.searchFields && this.advancedSearchConfig.searchFields.length > 0) {
      for (let index = 0; index < this.advancedSearchConfig.searchFields.length; index++) {
        const searchField = this.advancedSearchConfig.searchFields[index];
        searchField.hidden = this.isConstFilter(searchField);
      }
    }
  }
  isConstFilter(searchField: SearchField) {
    if (searchField && this.constFilters && this.constFilters.length > 0) {
      return Boolean(this.constFilters.find(f => f.fieldName.toLowerCase() === searchField.key.toLocaleLowerCase()
        || (searchField.secondKey && f.fieldName.toLowerCase() === searchField.secondKey.toLocaleLowerCase())));
    }
    return false;
  }
  handleonUploadClick() {
    if (this.onUploadClick) {
      this.onUploadClick.emit();
    }

  }

  /* #endregion */
}
