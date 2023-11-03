import { SelectFieldProps } from '../advanced-search/advanced-search';

export interface QuickFilter {
  title: string;
  key: string;
  value?: any;
  selectFieldProps?: SelectFieldProps;
  hidden?: boolean;
}
