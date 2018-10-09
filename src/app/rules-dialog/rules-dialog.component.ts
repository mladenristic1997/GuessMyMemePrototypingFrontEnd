import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DonateDialogComponent } from '../donate-dialog/donate-dialog.component';

@Component({
  selector: 'app-rules-dialog',
  templateUrl: './rules-dialog.component.html',
  styleUrls: ['./rules-dialog.component.css']
})
export class RulesDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DonateDialogComponent>) { }

  ngOnInit() {
  }

  exit() {
    this.dialogRef.close();
  }

}
