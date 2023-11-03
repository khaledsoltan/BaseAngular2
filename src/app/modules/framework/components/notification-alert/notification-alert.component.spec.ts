import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NotificationAlertComponent } from './notification-alert.component';
describe('NotificationAlertComponent', () => {
  let component: NotificationAlertComponent;
  let fixture: ComponentFixture<NotificationAlertComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationAlertComponent]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
