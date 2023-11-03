import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { FinanceSearchModel } from '../../time-sheet/models/finance-search-model';
import { FinanceSearchCondition } from '../../time-sheet/models/finance-search-condition';
import { SearchModel } from '../models/search-model/SearchModel';
@Injectable({
  providedIn: 'root'
})
export class SearchModelConverter {
  dateTime: Date;
  constructor(private datePipe: DatePipe) {
  }
  setOperator(operator: string): string {
    switch (operator) {
      case 'GreaterThan':
        operator = '>';
        break;
      case 'GreaterThanOrEqual':
        operator = '<=';
        break;
      case 'LessThan':
        operator = '<';
        break;
      case 'LessThanOrEqual':
        operator = '<=';
        break;
      case 'Equal':
        operator = '==';
        break;
      case 'NotEqual':
        operator = '!=';
        break;
      case 'Contain':
        operator = 'Contains';
        break;
      case 'NotContain':
        operator = 'NotContains';
        break;
      default:
        operator = 'Contains';
        break;
    }
    return operator;
  }
  isDate(fieldName: string, dateFields: string[]): boolean {
    return dateFields.find(field => field === fieldName) ? true : false;
  }
  ConvertToFinanceSearchModel = (model: SearchModel, dateFields: string[]): FinanceSearchModel => {
    return model ? {
      Pagging: {
        PageNo: model.pageNumber,
        PageSize: model.pageSize
      },
      SortOrder: {
        direction: model.sortOrder === 'desc' ? 1 : 0,
        field: model.searchFields.length > 0 ? model.searchFields[0].fieldName : model.orderBy
      },
      Where: model.searchFields ? model.searchFields.map(f => <FinanceSearchCondition>{
        Field: f.fieldName,
        // Operator: f.operator,
        Operator: this.setOperator(f.operator),
        TableAlias: '',
        // Value: f.value
        Value: this.isDate(f.fieldName, dateFields) ? this.datePipe.transform(f.value, 'yyyy/MM/dd') : f.value
        // Value: "2020-12-29"
      }) : []
    } : null;
  };
  FitIndianSearchModel = (model: SearchModel, dateFields: string[], multiSelectLists: any = null): FinanceSearchModel => {
    let result = model ? {
      Pagging: {
        PageNo: model.pageNumber,
        PageSize: model.pageSize
      },
      Where: model.searchFields ? model.searchFields.map(f => <FinanceSearchCondition>{
        Field: f.fieldName,
        TableAlias: "",
        Operator: this.setOperator(f.operator),
        Value: this.isDate(f.fieldName, dateFields) ? this.datePipe.transform(f.value, 'yyyy/dd/MM') : f.value
      }) : [],
      SortOrder: {

        field: (model.searchFields.length > 0 && !model.orderBy) ? model.searchFields[0].fieldName : model.orderBy,
        direction: model.sortOrder === 'desc' ? 1 : 0
      }
    } : null;
    let returnResult: FinanceSearchModel = {
      Pagging: result.Pagging,
      SortOrder: result.SortOrder,
      Where: []
    };
    result.Where.forEach(element => {
      if (Array.isArray(element.Value)) {
        if (multiSelectLists[element.Field] !== null && multiSelectLists[element.Field].values.length > 0
          && element.Value.length > 0) {
          for (let j = 0; j < multiSelectLists[element.Field].values.length; j++) {
            let isExist = false;
            for (let i = 0; i < element.Value.length; i++) {
              isExist = (multiSelectLists[element.Field].values[j][multiSelectLists[element.Field].Id] === element.Value[i][multiSelectLists[element.Field].Id]) || isExist;
            }
            if (!isExist) {
              let searchField: FinanceSearchCondition = {
                Field: element.Field,
                Operator: 'NotEquals',
                TableAlias: '',
                Value: multiSelectLists[element.Field].values[j][multiSelectLists[element.Field].Id]
              };
              returnResult.Where.push(searchField);
            }
          }
        }
      }
      else {
        returnResult.Where.push(element);
      }
    });
    return returnResult;
  };
}