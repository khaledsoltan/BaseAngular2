export interface Result<T = any> {
  entity?: T;
  success: boolean;
  message: string;
  hideErrorMsg?: boolean;
  reloadDataOnFailed?: boolean;
}
