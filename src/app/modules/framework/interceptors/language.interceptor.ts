import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LanguageService } from '../services/language-service/language.service';
@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  data: any = {};
  constructor(
    private languageService: LanguageService
  ) { }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const headersConfig = {
      'Accept-Language': 'ar-SA'
    };
    if (this.languageService.Lang === 'ar') {
      return next.handle(req.clone({ setHeaders: headersConfig }));
    } else {
      return next.handle(req);
    }
  }
}
