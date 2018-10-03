import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-refuse-invitation-dialog',
  templateUrl: './refuse-invitation-dialog.component.html',
  styleUrls: ['./refuse-invitation-dialog.component.css']
})
export class RefuseInvitationDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<RefuseInvitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any) { }

  ngOnInit() {
    console.log(this.data);
  }

  cancel(){
    this.dialogRef.close();
  }
}
