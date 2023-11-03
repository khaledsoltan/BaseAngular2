import { Injectable, Optional } from '@angular/core';
import * as toastr from 'toastr';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  isLoaderShown = false;

  constructor() {
    toastr.options.closeButton = true;
    toastr.options.debug = false;
    toastr.options.newestOnTop = true;
    toastr.options.progressBar = true;
    toastr.options.positionClass = 'toast-top-center';
    toastr.options.preventDuplicates = false;
    toastr.options.onclick = undefined;
    toastr.options.showDuration = 300;
    toastr.options.hideDuration = 1000;
    toastr.options.timeOut = 5000;
    toastr.options.extendedTimeOut = 1000;
    toastr.options.showEasing = 'swing';
    toastr.options.hideEasing = 'linear';
    toastr.options.showMethod = 'fadeIn';
    toastr.options.hideMethod = 'fadeOut';
  }

  public successMessage(Message: string, isSwal: boolean = false, closeButtonText?: string) {
    if (isSwal) {
      Swal.fire({
        icon: 'success',
        title: Message,
        confirmButtonText: closeButtonText || 'Close'
      });
    } else {
      toastr.success(Message);
    }
  }


  public infoMessage(Message: string, isSwal: boolean = false, closeButtonText?: string) {
    if (isSwal) {
      Swal.fire({
        icon: 'info',
        title: Message,
        confirmButtonText: closeButtonText || 'Close'
      });
    } else {
      toastr.info(Message);
    }

  }

  public warningMessage(Message: string, isSwal: boolean = false, closeButtonText?: string) {
    if (isSwal) {
      Swal.fire({
        icon: 'warning',
        title: Message,
        confirmButtonText: closeButtonText || 'Close'
      });
    } else {
      toastr.warning(Message);
    }
  }

  public errorMessage(Message: string, isSwal: boolean = false, closeButtonText?: string) {
    if (isSwal) {
      Swal.fire({
        icon: 'error',
        title: Message,
        confirmButtonText: closeButtonText || 'Close'
      });
    } else {
      toastr.error(Message);
    }
  }

  public confirmMessage(title: string, onConfirm: Function, confirmButtonText?: string, cancelButtonText?: string) {
    Swal.fire({
      title: title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmButtonText || 'Ok',
      cancelButtonText: cancelButtonText || 'Cancel'
    }).then((result: any) => {
      if (result.value) {
        onConfirm();
      }
    });
  }
  public confirm(title: string, onConfirm: Function, onCancel: Function, confirmButtonText?: string, cancelButtonText?: string) {
    Swal.fire({
      title: title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmButtonText || 'Ok',
      cancelButtonText: cancelButtonText || 'Cancel',
      allowOutsideClick: false
    }).then((result: any) => {
      if (result.value) {
        if (onConfirm) {
          onConfirm();
        }
      } else {
        if (onCancel) {
          onCancel();
        }
      }
    });
  }

  public errorHandler(data: { reason: string; status?: number }) {
    Swal.fire({
      title: data.reason,
      icon: 'error'
    });
  }

  public showLoader() {
    setTimeout(() => {
      this.isLoaderShown = true;
    }, 0);
  }

  public hideLoader() {
    setTimeout(() => {
      this.isLoaderShown = false;
    }, 0);
  }
}
