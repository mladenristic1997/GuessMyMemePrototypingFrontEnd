import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-card-dialog',
  templateUrl: './card-dialog.component.html',
  styleUrls: ['./card-dialog.component.css']
})
export class CardDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any) { }

  ngOnInit() {
  }

  guess(){
    this.dialogRef.close(this.data);
  }

  flip(){
    this.data['isFlipped'] = true;
    this.dialogRef.close();
  }

  exit(){
    this.dialogRef.close();
  }

}
