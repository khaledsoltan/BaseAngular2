import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailogImgComponent } from './dialog-images.component';

describe('DailogImgComponent', () => {
  let component: DailogImgComponent;
  let fixture: ComponentFixture<DailogImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DailogImgComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DailogImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
