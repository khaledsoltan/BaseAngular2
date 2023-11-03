import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-dialog-img',
  templateUrl: './dialog-images.component.html',
  styleUrls: ['./dialog-images.component.scss']
})
export class DailogImgComponent implements OnInit {
  @Input() src: string = '';
  @Input() imgCssClass: string = '';
  @Input() width: string = '';
  @Input() height: string = '';
  @Output() onError = new EventEmitter<any>();
  show: boolean = false;
  selectedEmployee: any;
  constructor(
  ) { }

  ngOnInit(): void {
  }
  showDialog(event) {
    this.show = true;
    setTimeout(() => {
      $('.profile-modal').addClass('show');
    }, 0);

  }
  hideDialog() {
    this.show = false;
    $('.profile-modal').removeClass('show');
  }
  onImgError(event) {
    if (this.onError) {
      this.onError.emit(event);
    }
  }
}
