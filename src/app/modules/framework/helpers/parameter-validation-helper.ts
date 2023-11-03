import { ValidatorFn, AbstractControl, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { FieldModeEnum } from "../enums/enums";
import { FieldValidator } from "../models/details/details";
import { AlertsService } from "../services/alert/alerts.service";
import { Reflection } from "../utilities/reflection";


export interface ParameterConfiguration {
  fieldKey: string;
  required: boolean;
  fieldName: string;
  fieldMode: FieldModeEnum;
  parentKey: string;
  parentName: string;
  defValue: string;
  fieldType: FieldTypeEnum;
  isHidden: boolean;
  color: string;
  width: number;
  fontSize: number;
}
export enum FieldTypeEnum {
  number = 1,
  text = 2,
  time = 3,
  boolean = 4,
  athers = 5,
  AutoComplete = 6,
  DropDownList = 7
}
export interface ControlsValidators {
  [controlName: string]: ValidatorFn[] | any;
}
export class ParameterValidationHelper {
  // constructor(private translate: TranslateService ) { }
  /* #region  Check Dynamic Parameter Configurations */
  public static isRequired(
    vm: any,
    configuration: ParameterConfiguration[],
    translate: TranslateService
  ) {
    // const alertService: AlertsService = new AlertsService();
    // configuration.forEach(
    //   x =>
    //     (x.fieldKey = x.fieldKey
    //       .split('.')
    //       .map(x => (x = x.charAt(0).toLowerCase() + x.slice(1)))
    //       .join('.'))
    // );
    // let counter = 0;

    // configuration.forEach(element => {
    //   const key = element.fieldKey
    //     .split('.')
    //     .map(x => (x = x.charAt(0).toLowerCase() + x.slice(1)))
    //     .join('.');
    //   ParameterValidationHelper.checkObjectValue(
    //     element,
    //     element.fieldKey,
    //     vm,
    //     translate,
    //     alertService,
    //     counter
    //   );
    // });
    // return counter;
    return 0;
  }

  private static checkObjectValue(
    config: ParameterConfiguration,
    propName: string,
    obj: any,
    translate: TranslateService,
    alertService: AlertsService,
    counter: number
  ) {
    const configKeys = propName.split('.');
    let i = 0;

    for (let index = 0; index < configKeys.length; index++) {
      i++;
      if (!obj) {
        break;
      }
      const key = configKeys[index];
      if (Object.keys(obj).includes(key)) {
        obj = obj[key];
        if (config.required && i === configKeys.length) {
          if (!obj) {
            alertService.errorMessage(
              translate
                .instant('helpers.validation.configValidation')
                .replace('#FieldName', config.fieldName)
            );
            counter++;
            return;
          } else if (Array.isArray(obj) && obj.length) {
            alertService.errorMessage(
              translate
                .instant('helpers.validation.configValidation')
                .replace('#FieldName', config.fieldName)
            );
            counter++;
            return;
          }
        } else if (Array.isArray(obj)) {
          for (const item of obj) {
            ParameterValidationHelper.checkObjectValue(
              config,
              configKeys.slice(index).join('.'),
              item,
              translate,
              alertService,
              counter
            );
          }
        }
      }
    }
  }

  public static SetValidators(
    form: AbstractControl,
    configuration: ParameterConfiguration[],
    controlsvalidators?: ControlsValidators
  ) {
    configuration.forEach(element => {
      let key = element.fieldKey
        .split('.')
        .map(x => (x = x.charAt(0).toLowerCase() + x.slice(1)))
        .join('.');
      let controler = form.get(key);
      if (!controler) {
        // remove id
        controler = form.get(key.slice(0, -2));
        key = key.slice(0, -2);
      }
      if (controler) {
        let validators;
        if (controlsvalidators) {
          validators = Reflection.GetValueByProbertyName(
            controlsvalidators,
            key
          ) as ValidatorFn[];
          if (!validators || !Array.isArray(validators)) {
            validators = [];
          }
        }
        if (element.required) {
          if (validators && Array.isArray(validators) && validators.push) {
            validators.push(Validators.required);
            controler.setValidators(validators);
          } else {
            controler.setValidators(Validators.required);
          }
        }
        if (element.fieldMode === FieldModeEnum.disabled) {
          controler.disable();
        }
        controler.updateValueAndValidity();
      }
    });
  }

  public static disableFieldCard(
    controler: AbstractControl,
    configuration: ParameterConfiguration
  ) {
    if (configuration) {
      const key = configuration.fieldKey
        .split('.')
        .map(x => (x = x.charAt(0).toLowerCase() + x.slice(1)))
        .join('.');
      if (
        controler.get('fieldKey').value === key ||
        controler.get('fieldKey').value + 'Id' === key
      ) {
        if (configuration.fieldMode === FieldModeEnum.disabled) {
          controler.get('fieldValue').disable();
        }
      }
    }
  }

  public static SetValidatorsForToCardField(
    validators: FieldValidator[],
    configuration: ParameterConfiguration
  ) {
    if (configuration) {
      const key = configuration.fieldKey
        .split('.')
        .map(x => (x = x.charAt(0).toLowerCase() + x.slice(1)))
        .join('.');
      if (configuration.required) {
        if (
          validators &&
          validators.findIndex(x => x.validator === Validators.required) === -1
        ) {
          validators.push({
            validator: Validators.required
          });
        } else {
          validators = [
            {
              validator: Validators.required
            }
          ];
        }
      }
    }
    return validators;
  }
  /* #endregion */
}
