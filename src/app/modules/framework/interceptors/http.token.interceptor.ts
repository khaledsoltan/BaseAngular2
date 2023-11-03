
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertsService } from '../services/alert/alerts.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { finalize, tap } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(
    private alertsService: AlertsService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headersConfig: any = {};
    const token = this.authService.getToken();
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }
    const request = req.clone({ setHeaders: headersConfig });

    // if GetById method
    if (request.url.indexOf('/Get/') !== -1) {
      // this.alertsService.showLoader();
      return next.handle(request).pipe(
        finalize(() => {
          // this.alertsService.hideLoader();
        }));
    }


    if (request.method === 'POST' || request.method === 'PUT') {
      // this.alertsService.showLoader();
      return next.handle(request).pipe(
        tap({
          next: (event) => {
            if (event instanceof HttpResponse) {
              if (event && event.body && event.url
                && event.url.toLowerCase().indexOf('createcustomerticketapi') === -1) {
                this.translate.get('helpers.messages').subscribe((key: any) => {
                  if (event.body && event.body.message !== null &&
                    event.body.message !== undefined &&
                    event.body.message !== "") {
                    if (event.body.success) {
                      this.alertsService.successMessage(
                        event.body.message || key['successAdd']
                      );
                    } else {
                      if (event.url.toLowerCase().indexOf('changepassword') === -1) {
                        this.alertsService.errorMessage(
                          event.body.message || key['errroMessage']
                        );
                      }
                    }
                  }
                });
              }
            }
          },
          error: (error: any) => {
            if (error && error.error && error.error.errors) {
              let errMsg = '';
              for (const key in error.error.errors) {
                if (Object.prototype.hasOwnProperty.call(error.error.errors, key)) {
                  const e = error.error.errors[key];
                  if (Array.isArray(e)) {
                    for (let index = 0; index < e.length; index++) {
                      const msg = e[index];
                      if (msg) {
                        errMsg += errMsg ? '</br> * ' + msg : '* ' + msg;
                      }
                    }
                  }

                }
              }
              if (errMsg) {
                this.alertsService.errorMessage(errMsg);
              }
            }
            else {
              this.translate.get('helpers.messages').subscribe((key: any) => {
                this.alertsService.errorMessage(
                  key['errroMessage']
                );
              });
            }

            console.log("found error in interceptor");
          },
          complete: () => {
            // this.alertsService.hideLoader();
          }
        })
      );
    } else {
      return next.handle(request);
    }
  }
}

