import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-exit-game-dialog',
  templateUrl: './exit-game-dialog.component.html',
  styleUrls: ['./exit-game-dialog.component.css']
})
export class ExitGameDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ExitGameDialogComponent>) { }

  ngOnInit() {
  }

  cancel(){
    this.dialogRef.close();
  }

  exit(){
    this.dialogRef.close(true);
  }

}
