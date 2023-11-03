import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertsService } from '../../services/alert/alerts.service';
import { Language, LanguageService } from '../../services/language-service/language.service';
import { SpinnerDirective } from '../../directives/spinner/spinner.directive';
import { MessagesService } from '../services/messages.service';
import { EntityNamesEnum } from '../../enums/enums';
import { UserTypeEnum } from 'src/app/modules/operation/models/userType';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit {

  /* #region Constractor */
  constructor(
    private translate: TranslateService,
    private languagService: LanguageService,
    private alertService: AlertsService,
    private formbuilder: FormBuilder,
    private messagesService: MessagesService,
    private _authService: AuthService,

  ) { }

  /* #endregion */
  /* #region Properties */
  formSendMessage: FormGroup;
  formSubmitted = false;
  currentUserType: UserTypeEnum;
  @Input('entityId') entityId: number;
  @Input('entityNameId') entityNameId: EntityNamesEnum;
  @Input('entityCode') entityCode: string;
  @Input('sentToUserId') sentToUserId: number;

  @Output() onSaved = new EventEmitter<boolean>();
  @Output() onCanceled = new EventEmitter<boolean>();

  /* #endregion */
  /* #region View Children */
  @ViewChild(SpinnerDirective, { static: false }) spinnerDirective: SpinnerDirective;
  /* #endregion */
  /* #region Events */
  ngOnInit(): void {
    this.languagService.LangChanged.subscribe((value: Language) => {
      this.translate.use(value);
      this.initSendMessageForm();
      if (this._authService.currentUser.usertype === UserTypeEnum.Dentist.toString()) {
        this.currentUserType = UserTypeEnum.Dentist;
      } else if (this._authService.currentUser.usertype === UserTypeEnum.Lab.toString()) {
        this.currentUserType = UserTypeEnum.Lab;
      }
    });

  }

  /* #endregion */
  /* #region Methods */

  initSendMessageForm() {
    this.formSendMessage = this.formbuilder.group({
      message: ['', [Validators.required, Validators.pattern(/[\S]/)]]
    })
  }
  sendMessage() {
    if (!this.formSendMessage.valid) {
      this.formSubmitted = true;
      return
    } else {
      this.showLoader();
      let postVm = {
        entityId: this.entityId,
        entityNameId: this.entityNameId,
        message: this.formSendMessage.value.message,
        entityCode: this.entityCode,
        sentToUserId: this.sentToUserId
      }
      this.messagesService.sendMessage(postVm).subscribe((res: any) => {
        if (res.success) {
          if (this.onSaved) {
            this.onSaved.emit();
          }
        }
        this.hideLoader();
      }, () => {
        this.hideLoader();
      })
    }

  }
  cancel() {
    if (this.onCanceled) {
      this.onCanceled.emit();
    }
    this.formSendMessage.reset();
    this.formSendMessage.updateValueAndValidity();
    this.formSubmitted = false;
  }
  showLoader() {
    setTimeout(() => this.spinnerDirective.showSpinner(), 0);
  }

  hideLoader() {
    setTimeout(() => this.spinnerDirective.hideSpinner(), 0);
  }
  /* #endregion */


}


