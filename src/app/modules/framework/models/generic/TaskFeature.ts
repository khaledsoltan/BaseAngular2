
export interface TaskFeature {
  id?: number;
  feature?: any;
  // featureCode?: FeatureEnum;
  featureId: number,
  dataTypeId: number;
  required: boolean;
  code: string,
  nameEn: string,
  nameAr: string,
  title?: string,
  name?: string
}

// export enum FeatureEnum {
//   Date = "date",
//   CustomDate = "customdate",
//   Time = "time",
//   CustomTime = "customtime",
//   Text = "text",
//   TextArea = "textarea",
//   Number = "number",
//   File = "file"
// }

