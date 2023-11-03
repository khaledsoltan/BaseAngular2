import { Directive, ElementRef, Input, OnChanges } from '@angular/core';
import { AlertsService } from '../../services/alert/alerts.service';
import { Subject } from 'rxjs';
declare let $: any;

@Directive({
  selector: '[appSpinner]',
})
export class SpinnerDirective {

  constructor(
    private el: ElementRef
  ) { }

  showSpinner() {
    const oldTemplate = $(this.el.nativeElement).find('.spinner-component');
    if (oldTemplate.length === 0) {
      const spinnerTemplate = $(document)
        .find('.spinner-component')
        .first()
        .clone();
      $(this.el.nativeElement).prepend(spinnerTemplate);

      if (!$(this.el.nativeElement).hasClass('position-relative')) {
        $(this.el.nativeElement).addClass('position-relative');
      }
    }
  }

  hideSpinner() {
    $(this.el.nativeElement).find('.spinner-component').first().remove();
  }

}
