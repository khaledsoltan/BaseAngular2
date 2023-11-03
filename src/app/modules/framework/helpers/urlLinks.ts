import { RelatedLinksTypeEnum } from '../enums/enums';
import { CommonUrls } from '../models/common-urls';
import { RelatedLinksVM } from '../models/related-links/related-links';

export class UrlHelper {
  static getUrlOfRelatedLink(relatedLinks: RelatedLinksVM[]) {
    if (relatedLinks && relatedLinks.length > 0) {
      relatedLinks.forEach(element => {
        for (const key in CommonUrls) {
          if (CommonUrls[key].props && CommonUrls[key].props.name === element.name) {
            if (element.type === RelatedLinksTypeEnum.list) {
              element.url = CommonUrls[key].list;
            } else {
              element.url = CommonUrls[key].details && element.id ? (CommonUrls[key].details + '/' + element.id)
                : null;
            }
          }
        }
      });
    }
  }
}
