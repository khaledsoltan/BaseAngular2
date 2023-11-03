import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertsService } from '../../services/alert/alerts.service';
import { Language, LanguageService } from '../../services/language-service/language.service';
import { MessagesService } from '../services/messages.service';
import { EntityNamesEnum } from '../../enums/enums';
import { SpinnerDirective } from '../../directives/spinner/spinner.directive';
import { SearchFieldVm, SearchModel } from '../../models/search-model/SearchModel';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { UserTypeEnum } from 'src/app/modules/operation/models/userType';
import { DateHelper } from 'src/app/modules/shared/helpers/date-helper';
import { environment } from 'src/environments/environment';
import { ImagesEnum } from 'src/app/modules/dentist/rfq/models/enums';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit {
  /* #region Constractor */
  constructor(
    private translate: TranslateService,
    private languagService: LanguageService,
    private messagesService: MessagesService,
    private _authService: AuthService,
    private alertService: AlertsService,
  ) { }

  /* #endregion */
  /* #region Properties */
  formSendMessage: FormGroup;
  formSubmitted = false;
  messages?: any;
  searchModel: SearchModel = {
    searchFields: []
  };
  currentUserType: UserTypeEnum;
  isMessagesNotLoaded: boolean = false;
  ImagesEnum = ImagesEnum;
  get UserTypeEnum() {
    return UserTypeEnum;
  }
  @Input('entityId') entityId: number;
  @Input('entityNameId') entityNameId: EntityNamesEnum;
  @Input('entityCode') entityCode: string;
  @Input('sentToUserId') sentToUserId: number;
  @Input('canDelete') canDelete: boolean = true;

  /* #endregion */
  /* #region View Children */
  @ViewChild(SpinnerDirective, { static: true }) spinnerDirective: SpinnerDirective;
  /* #endregion */
  /* #region Events */
  ngOnInit(): void {
    this.languagService.LangChanged.subscribe((value: Language) => {
      this.translate.use(value);
      if (this._authService.currentUser.usertype === UserTypeEnum.Dentist.toString()) {
        this.currentUserType = UserTypeEnum.Dentist;
      } else if (this._authService.currentUser.usertype === UserTypeEnum.Lab.toString()) {
        this.currentUserType = UserTypeEnum.Lab;
      }
      this.initMessages();
    });

  }

  /* #region Methods */
  initMessages() {
    var searchFields: SearchFieldVm[] = [
      {
        fieldName: 'entityId',
        value: this.entityId,
        operator: 'Equal'

      },
      {
        fieldName: 'entityNameId',
        value: this.entityNameId,
        operator: 'Equal'

      }
    ]
    this.searchModel.pageSize = 100;
    this.searchModel.searchFields = searchFields;

    this.showLoader();
    this.messagesService.getAll(this.searchModel).subscribe(res => {
      if (res.success) {
        this.messages = res.entities.filter(x => x.isDeleted === false);

        if (this.messages.length <= 0) {
          this.isMessagesNotLoaded = true;
        }
      }
      this.hideLoader()
    }, () => {
      this.hideLoader();
    });
  }
  getImagePath(message) {
    let imgSrc = '';
    if (message.userType === UserTypeEnum.Lab) {
      if (message.imagePath) {
        imgSrc = `${environment.apiUrl}/FileManager/GetProfileImage/${message.imagePath}/${ImagesEnum.labLogo}`;
      }
      else {
        imgSrc = '../../../../../assets/images/imgs/lab.png'
      }
    }
    else if (message.userType === UserTypeEnum.Dentist) {
      if (message.imagePath) {
        imgSrc = `${environment.apiUrl}/FileManager/GetProfileImage/${message.imagePath}/${ImagesEnum.DentistProfile}`;
      }
      else {
        imgSrc = '../../../../../assets/images/imgs/dentist.png'
      }
    }
    return imgSrc;
  }
  delete(message) {
    if (DateHelper.addMinutes(new Date(message.creationDate), environment.deleteMessageTimeInMinutes) < new Date()) {
      this.alertService.errorMessage(
        this.translate.instant('helpers.common.rejectDeleteMessage',
          { min: environment.deleteMessageTimeInMinutes })
      );
    }
    else {
      this.alertService.confirmMessage(
        this.translate.instant('helpers.messages.confirmDelete'),
        () => {
          this.showLoader();
          this.messagesService.delete(message.id).subscribe(res => {
            if (res.success) {
              this.hideLoader();
              // this.initMessages();
              this.messages.splice(this.messages.findIndex(n => n.id == message.id), 1)
            } else {
              this.hideLoader();

            }
          }, () => {
            this.hideLoader();
          })
        },
        this.translate.instant('helpers.messages.ok'),
        this.translate.instant('helpers.messages.cancel')
      )
    }
  }
  showLoader() {
    setTimeout(() => this.spinnerDirective.showSpinner(), 0);

  }

  hideLoader() {
    setTimeout(() => this.spinnerDirective.hideSpinner(), 0);
  }
  /* #endregion */

}
