import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import {
  ActionList,
  ActionTypes,
  ActionIcon,
  ActionOption
} from '../../models/action/actions';
import { Column } from '../../models/data-list/data-list';
import { TranslateService } from '@ngx-translate/core';
import {
  Language,
  LanguageService
} from '../../services/language-service/language.service';
import { isObservable } from 'rxjs';
import { ActionTypeEnum } from '../../enums/action/action-type-tnum';

@Component({
  selector: 'actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent implements OnInit, OnChanges {
  /* #region  Fields & Properties */
  // currentLang: Language;
  @Input('actions') actions: ActionList;
  @Input('params') params: any;
  @Input('additionalParams') additionalParams: any;
  @Input('rowIndex') rowIndex: number;
  @Input('moreActionType') moreActionType?: ActionTypeEnum;
  @Input('hideAction') hideAction?: (action) => boolean;
  @Output('onToggleCol') onToggleCol = new EventEmitter<{
    col: Column;
    columns: Column[];
  }>();
  @Output('onShowAllColumns') onShowAllColumns = new EventEmitter<Column[]>();
  actionTypes: any = ActionTypes;
  show_list = false;
  changeLang: Language;
  moreActionsMenuItems: any[] = [];
  isMoreActionObservableCalled = false;

  get sortedActionsList() {
    this.actions.list = this.actions.list || [];
    return this.actions.list.sort((a, b) => {

      if (
        b.type &&
        a.type &&
        ActionTypes[b.type].priority &&
        ActionTypes[a.type].priority
      ) {
        return ActionTypes[b.type].priority - ActionTypes[a.type].priority;
      } else if (b.type && ActionTypes[b.type].priority) {
        return -1;
      } else if (a.type && ActionTypes[a.type].priority) {
        return 1;
      } else {
        return 0;
      }
    }) || [];
  }

  get sortedMoreActionsList() {
    this.actions.moreActions = this.actions.moreActions || [];
    return this.actions.moreActions.sort((a, b) => {
      if (a.sortOrder != null && b.sortOrder != null) {
        return a.sortOrder(this.params) - b.sortOrder(this.params);

      }
      else {
        if (
          b.type &&
          a.type &&
          ActionTypes[b.type].priority &&
          ActionTypes[a.type].priority
        ) {
          return ActionTypes[a.type].priority - ActionTypes[b.type].priority;
        } else if (b.type && ActionTypes[b.type].priority) {
          return 1;
        } else if (a.type && ActionTypes[a.type].priority) {
          return -1;
        } else {
          return 0;
        }
      }

    });
  }

  get moreActionsMenuItemssss() {
    const moreActionsItems = this.sortedMoreActionsList || [];

    return moreActionsItems && moreActionsItems.length > 0
      ? moreActionsItems.map(action => {
        const lebel = action.title
          ? this.translate.instant(action.title)
          : this.translate.instant(action.getTitle(this.params));

        const result = action.disable(this.params);
        let mappedDisabledResult = true;
        if (result === true || result === false) {
          mappedDisabledResult = result;
        }
        if (isObservable(result)) {
          mappedDisabledResult = true;
        }

        return {
          label: lebel,
          disabled: mappedDisabledResult,
          url:
            action.href ||
            (action.getHref ? action.getHref(this.params) : null),
          icon:
            action.options === ActionOption.icon ||
              action.options === ActionOption.all
              ? this.getActionIconClass(action)
              : '',
          command: eve => this.onMenuItmeClick(eve, action),
          visible: !this.isHidden(action)
        };
      })
      : [];
  }
  isHidden(action) {
    if (this.hideAction) {
      if (this.hideAction(action)) {
        return true;
      } else {
        return action.hidden ? (action.hidden(this.params, this.rowIndex)) : false;
      }
    } else {
      return action.hidden ? (action.hidden(this.params, this.rowIndex)) : false;
    }
  }
  checkDisable(action: ActionIcon, isObservableCall: boolean) {
    if (action.disable) {
      const result = action.disable(this.params);

      if (result === true || result === false) {
        action.disabledResult = result;
        return result;
      }
      if (isObservable(result) && isObservableCall === false) {
        result.subscribe(response => {
          action.disabledResult = response;
          action = { ...action };
          return response;
        });
        return action.disabledResult;
      } else if (isObservable(result) && isObservableCall === true) {
        if (isObservable(result)) {
          return false;
        }
      }
    }
    return false;
  }

  onMenuItmeClick(ev, action: ActionIcon) {
    if (action && action.onClick && this.canClickAction(action)) {
      action.onClick({
        event: ev,
        params: this.params,
        additionalParams: this.additionalParams,
        rowIndex: this.rowIndex
      });
    }
  }
  /* #endregion */

  /* #region  constructor */
  constructor(
    private translate: TranslateService,
    private _language: LanguageService
  ) {
  }
  /* #endregion */

  /* #region  Events */
  ngOnInit() {
    this._language.LangChanged.subscribe(value => {
      this.changeLang = value;
      this.translate.use(this.changeLang);
      this.setMoreActionsMenuItems(this.isMoreActionObservableCalled);
    });
    this.handleActionsDefaultValues();
    this.setMoreActionsMenuItems(this.isMoreActionObservableCalled);
  }

  ngOnChanges(changes) {
    if (changes.actions
      || changes.moreActionType
      || changes.params
      || changes.additionalParams
    ) {
      this.handleActionsDefaultValues();
      this.setMoreActionsMenuItems(this.isMoreActionObservableCalled);
    }
  }

  onClickMoreAction() {
    if (!this.isMoreActionObservableCalled) {
      this.setMoreActionsMenuItems(true);
    }
  }

  toggle_selection() {
    this.show_list = !this.show_list;
  }

  toggleCol(column: Column, event: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const index = this.actions.toggleCols.findIndex(
      col => col.field === column.field
    );
    this.actions.toggleCols[index].hidden = !this.actions.toggleCols[index]
      .hidden;
    if (this.onToggleCol) {
      this.onToggleCol.emit({
        col: this.actions.toggleCols[index],
        columns: this.actions.toggleCols
      });
    }
  }
  get ActionTypeEnum() {
    return ActionTypeEnum;
  }
  getActionIconClass(action: ActionIcon) {
    if (action && action.type) {
      if (action.type === ActionTypeEnum.custom) {
        return action.icon || '';
      } else {
        return ActionTypes[action.type].icon || '';
      }
    }
    return '';
  }

  showAllColumns() {
    this.actions.toggleCols.map(col => (col.hidden = false));
    this.onShowAllColumns.emit(this.actions.toggleCols);
  }
  /* #endregion */

  /* #region  Methods */

  handleActionsDefaultValues() {
    if (this.actions) {
      if (this.actions.type === 'hover' || this.actions.type === 'on-grid') {
        this.actions.transparent = true;
      }
    }

    if (!this.moreActionType) {
      this.moreActionType = ActionTypeEnum.dotsMoreActions;
    }
  }

  canClickAction(action: ActionIcon): boolean {
    if (action.onClick) {
      return !this.checkDisable(action, this.isMoreActionObservableCalled);
      // if (action.disable && action.disable(this.params)) {
      //   return false;
      // } else {
      //   return true;
      // }
    } else {
      return false;
    }
  }

  hiddenActionsLength(params: any): number {
    let length = 0;
    this.actions.moreActions.forEach(a => {
      if (a.hidden && a.hidden(params, this.rowIndex)) {
        length++;
      } else if (this.hideAction && this.hideAction(a)) {
        length++;
      }
    });
    return length;
  }

  setMoreActionsMenuItems(isObservableCall: boolean) {
    this.isMoreActionObservableCalled = isObservableCall;

    const moreActionsItems = this.sortedMoreActionsList || [];

    this.moreActionsMenuItems =
      moreActionsItems && moreActionsItems.length > 0
        ? moreActionsItems.map(action => {
          const lebel = action.title
            ? this.translate.instant(action.title)
            : this.translate.instant(action.getTitle(this.params));

          return {
            label: lebel,
            disabled: this.checkDisable(action, isObservableCall),
            // disabled: this.checkDisable(action),
            url:
              action.href ||
              (action.getHref ? action.getHref(this.params) : null),
            icon:
              action.options === ActionOption.icon ||
                action.options === ActionOption.all
                ? this.getActionIconClass(action)
                : '',
            type: action.type,
            priority: action.type && ActionTypes[action.type] ? ActionTypes[action.type].priority : 1,
            command: eve => this.onMenuItmeClick(eve, action),
            visible: !this.isHidden(action)
          };
        })
        : [];
    // const actions = this.moreActionsMenuItems;
    // if (actions && actions.length > 0) {
    //   this.moreActionsMenuItems = [];

    //   if (actions.filter(item => item.priority !== 29 && item.visible).length > 0) {
    //     this.moreActionsMenuItems.push({
    //       label: this.translate.instant('helpers.buttons.system'),
    //       items: actions.filter(item => item.priority !== 29)
    //     });
    //   }

    //   if (actions.filter(item => item.priority === 29).length > 0) {
    //     this.moreActionsMenuItems.push({
    //       label: this.translate.instant('helpers.buttons.workFlow'),
    //       items: actions.filter(item => item.priority === 29)
    //     });
    //   }

    //   this.moreActionsMenuItems = [...this.moreActionsMenuItems];
    // }
  }

  preventClose(event) {
    event.stopPropagation();
  }
  /* #endregion */
}
