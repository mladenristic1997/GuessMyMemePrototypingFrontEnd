import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefuseInvitationDialogComponent } from './refuse-invitation-dialog.component';

describe('RefuseInvitationDialogComponent', () => {
  let component: RefuseInvitationDialogComponent;
  let fixture: ComponentFixture<RefuseInvitationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefuseInvitationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefuseInvitationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
