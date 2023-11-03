import { ActionTypeEnum } from "../../enums/enums";
import { ActionList } from "../action/actions";
import { AdvancedSearchConfig } from "../advanced-search/advanced-search";


export interface Actions {
  header?: ActionList;
  title?: ActionList;
  grid?: ActionList;
  hover?: ActionList;
}

export interface PageList {
  searchConfig?: AdvancedSearchConfig;
  tableData?: any;
  actions: Actions;
}

export interface PageListConfig {
  showAdvancedSearch?: boolean;
  hasAdvancedSearch?: boolean;

  hasCreateAction?: boolean;

  showCommonActions?: boolean;
  hasCommonActions?: boolean;

  enableAuth?: boolean;
  checkActionPermission?: (actionType: ActionTypeEnum) => boolean;
}
