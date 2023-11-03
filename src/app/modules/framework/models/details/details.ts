import { TemplateRef } from "@angular/core";
import { ValidatorFn } from "@angular/forms";

export interface DetailsTab {
    title: string;
    tabTemplate?: TemplateRef<any> | any;
}
export interface FieldValidator {
    validator: ValidatorFn;
    message?: string;
}