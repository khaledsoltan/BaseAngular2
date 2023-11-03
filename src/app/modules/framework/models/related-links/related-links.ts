import { RelatedLinksTypeEnum } from '../../enums/enums';

export interface RelatedLinksVM {
  title: string;
  name: string;
  type: RelatedLinksTypeEnum;
  id: number | null;
  url?: string;
  class: string;
  icon: string;
}
