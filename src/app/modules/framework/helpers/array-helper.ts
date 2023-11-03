import { Operators } from './../models/advanced-search/advanced-search';
import { SortOrderEnum } from './../models/data-list/data-list';
import { SearchFieldVm, SearchModel } from '../models/search-model/SearchModel';
import { of } from 'rxjs';
export class ArrayHelper {

  public static paginate(array: any[], pageSize, pageNumber) {
    if (array && array.length > 0 && pageSize > 0 && pageNumber > 0) {
      return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    } else {
      return array;
    }
  }

  public static sortBy(array: any[], field: string, order: SortOrderEnum = SortOrderEnum.Asc) {
    if (array && array.length > 0 && field && field.trim()) {
      try {
        return array.sort((a, b) => {
          if (a[field] === b[field] || (!a[field] && !b[field])) {
            return 0;
          }
          if (order === SortOrderEnum.Desc) {
            return (a[field] > b[field]) ? 1 : -1;
          } else {
            return (a[field] > b[field]) ? -1 : 1;
          }
        });
      } catch {
        return array.sort();
      }
    } else {
      return array;
    }
  }

  public static checkFilter(item: object, searchField: SearchFieldVm) {
    if (item && searchField && searchField.fieldName) {

      if (item[searchField.fieldName] === undefined) {
        return true;
      }
      const value = item[searchField.fieldName] ? (item[searchField.fieldName] as string).toString().trim().toLowerCase() : '';
      const fieldValue = searchField.value ? searchField.value.toString().trim().toLocaleLowerCase() : '';

      switch (searchField.operator) {
        case Operators.equal.code: {
          return value === fieldValue;
        }
        case Operators.notEqual.code: {
          return value !== fieldValue;

        }
        case Operators.greaterThan.code: {
          return value > fieldValue;
        }
        case Operators.greaterThanOrEqual.code: {
          return value >= fieldValue;
        }
        case Operators.lessThan.code: {
          return value < fieldValue;
        }
        case Operators.lessThanOrEqual.code: {
          return value <= fieldValue;
        }
        case Operators.notContain.code: {
          return value.indexOf(fieldValue) === -1;
        }
        case Operators.contain.code: {
          return value.indexOf(fieldValue) > -1;
        }

        default:
          return false;
      }
    } else {
      return false;
    }
  }

  public static checkFilters(item: object, searchFields: SearchFieldVm[]) {
    if (searchFields && searchFields.length > 0) {
      if (item) {
        for (let index = 0; index < searchFields.length; index++) {
          return ArrayHelper.checkFilter(item, searchFields[index]);
        }
      }
    } else if (item) {
      return true;
    }
    return false;
  }

  public static filter(array: any[], searchFields: SearchFieldVm[]) {
    if (array && array.length > 0 && searchFields && searchFields.length > 0) {
      return array.filter((value: any, index: number) => ArrayHelper.checkFilters(value, searchFields));
    } else {
      return array;
    }
  }
  public static getMany(array: any[], searchModel?: SearchModel) {
    if (array && array.length > 0 && searchModel) {
      const filtered = ArrayHelper.filter(array, searchModel.searchFields);
      const sorted = ArrayHelper.sortBy(filtered, searchModel.orderBy, searchModel.sortOrder as SortOrderEnum);
      return ArrayHelper.paginate(sorted, searchModel.pageSize, searchModel.pageNumber);
    } else {
      return array;
    }
  }
  public static getManyPaginated(array: any[], searchModel?: SearchModel) {
    if (array && array.length > 0 && searchModel) {
      const filtered = ArrayHelper.filter(array, searchModel.searchFields);
      const sorted = ArrayHelper.sortBy(filtered, searchModel.orderBy, searchModel.sortOrder as SortOrderEnum);
      const page = ArrayHelper.paginate(sorted, searchModel.pageSize, searchModel.pageNumber);
      return {
        entities: page,
        metadata: {
          pageNumber: sorted.length > 0 ? searchModel.pageNumber : 0,
          pageSize: searchModel.pageSize,
          pageCount: Math.ceil(sorted.length / searchModel.pageSize),
          totalItemCount: sorted.length,
          firstItemOnPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: true,
          isLastPage: false,
          lastItemOnPage: 1,
        },
        entityInfo: null,
        success: true,
        message: ''
      }
    } else {
      return {
        entities: [],
        metadata: {
          pageNumber: searchModel.pageNumber,
          pageSize: searchModel.pageSize,
          pageCount: 0,
          totalItemCount: 0,
          firstItemOnPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: true,
          isLastPage: false,
          lastItemOnPage: 1,
        },
        entityInfo: null,
        success: true,
        message: ''
      }
    }
  }
  public static getManyObservable(array: any[], searchModel?: SearchModel) {
    return of(ArrayHelper.getManyPaginated(array, searchModel));
  }
}
