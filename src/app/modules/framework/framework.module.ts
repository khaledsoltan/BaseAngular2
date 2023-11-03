import { AppPrimengModule } from './app-primeng/app-primeng.module';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { NgModule } from '@angular/core';
import { DataListComponent } from './components/data-list/data-list.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslatePipe } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SpinnerDirective } from './directives/spinner/spinner.directive';
import { PageNotFoundComponent } from './layouts/page-not-found/page-not-found.component';
import { NotificationAlertComponent } from './components/notification-alert/notification-alert.component';
import { DetailsComponent } from './components/details/details.component';
import { OverviewComponentComponent } from './components/overview-component/overview-component.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActionsComponent } from './components/actions/actions.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { DimensionCardComponent } from './components/dimension-card/dimension-card.component';
import { AdvancedSearchComponent } from './components/advanced-search/advanced-search.component'; import { PageListComponent } from './components/page-list/page-list.component';
import { GeneralSearchComponent } from './components/general-search/general-search.component';
import { FileSizePipe } from './helpers/pipes/file-size.pipe';
import { DailogImgComponent } from './components/dialog-images/dialog-images.component';
import { LayoutModule } from '@angular/cdk/layout';
import { EntityAttachmentFilesComponent } from './components/entity-attachment/entity-attachment-files/entity-attachment-files.component';
import { EntityAttachmentFilesGridComponent } from './components/entity-attachment/entity-attachment-files-grid/entity-attachment-files-grid.component';
import { EntityAttachmentsComponent } from './components/entity-attachment/entity-attachments/entity-attachments.component';
import { PageNotAuthorizedComponent } from './layouts/page-not-authorized/page-not-authorized.component';
import { CodeTemplateComponent } from './components/code-template/code-template.component';
import { SendMessageComponent } from './messages/send-message/send-message.component';
import { UploaderComponent } from './components/uploader/uploader.component';
import { MessageListComponent } from './messages/message-list/message-list.component';
import { TimestampPipe } from './pipes/timestamp/timestamp.pipe';
import { NumberOnlyDirective } from './directives/numberOnly.directive';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    BreadcrumbComponent,
    DataListComponent,
    DetailsComponent,
    OverviewComponentComponent,
    SpinnerComponent,
    SpinnerDirective,
    NumberOnlyDirective,
    PageNotFoundComponent,
    NotificationAlertComponent,
    ActionsComponent,
    DynamicFormComponent,
    DimensionCardComponent,
    GeneralSearchComponent,
    AdvancedSearchComponent,
    ActionsComponent,
    PageListComponent,
    FileSizePipe,
    DailogImgComponent,
    EntityAttachmentFilesComponent,
    EntityAttachmentFilesGridComponent,
    EntityAttachmentsComponent,
    PageNotAuthorizedComponent,
    CodeTemplateComponent,
    SendMessageComponent,
    UploaderComponent,
    MessageListComponent,
    TimestampPipe
  ],
  imports: [
    // DataViewModule,
    CommonModule,
    // BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppPrimengModule,
    LayoutModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })

  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule,
    DetailsComponent,
    BreadcrumbComponent,
    DataListComponent,
    AppPrimengModule,
    SpinnerComponent,
    SpinnerDirective,
    NumberOnlyDirective,
    NotificationAlertComponent,
    ActionsComponent,
    GeneralSearchComponent,
    DynamicFormComponent,
    FileSizePipe,
    DailogImgComponent,
    EntityAttachmentFilesComponent,
    EntityAttachmentFilesGridComponent,
    EntityAttachmentsComponent,
    CodeTemplateComponent,
    UploaderComponent,
    MessageListComponent
  ],
  providers: [
    TranslatePipe,
    FileSizePipe
  ]
})
export class FrameworkModule { }
