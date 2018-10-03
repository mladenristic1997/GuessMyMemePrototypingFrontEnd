import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-invitation-dialog',
  templateUrl: './invitation-dialog.component.html',
  styleUrls: ['./invitation-dialog.component.css']
})
export class InvitationDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<InvitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any) { }

  ngOnInit() {
  }

  accept() {
    this.dialogRef.close('startGame');
  }

  refuse() {
    this.dialogRef.close();
  }
}
