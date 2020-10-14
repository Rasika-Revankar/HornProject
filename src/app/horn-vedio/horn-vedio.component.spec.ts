import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HornVedioComponent } from './horn-vedio.component';

describe('HornVedioComponent', () => {
  let component: HornVedioComponent;
  let fixture: ComponentFixture<HornVedioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HornVedioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HornVedioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
