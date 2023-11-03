import { TableModule } from 'primeng/table';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { CalendarModule } from 'primeng/calendar';
import { SlideMenuModule } from 'primeng/slidemenu';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { KnobModule } from 'primeng/knob';
import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { PaginatorModule } from 'primeng/paginator';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MenuModule } from 'primeng/menu';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ImageModule } from 'primeng/image';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TableModule,
    TabViewModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    FileUploadModule,
    ImageModule,
    CalendarModule,
    SlideMenuModule,
    AutoCompleteModule,
    KnobModule,
    AccordionModule,
    ToastModule,
    OverlayPanelModule,
    ProgressBarModule,
    BadgeModule,
    PaginatorModule,
    RadioButtonModule,
    MenuModule,
    CheckboxModule,
    MultiSelectModule,
    InputSwitchModule
  ],
  exports: [
    TableModule,
    TabViewModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    FileUploadModule,
    ImageModule,
    CalendarModule,
    SlideMenuModule,
    AutoCompleteModule,
    KnobModule,
    AccordionModule,
    ToastModule,
    OverlayPanelModule,
    ProgressBarModule,
    BadgeModule,
    PaginatorModule,
    RadioButtonModule,
    MenuModule,
    CheckboxModule,
    MultiSelectModule,
    InputSwitchModule
  ]
})
export class AppPrimengModule { }
