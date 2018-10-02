import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';
import { trigger, style, transition, state, animate } from '@angular/animations';

@Component({
  selector: 'app-my-card',
  templateUrl: './my-card.component.html',
  styleUrls: ['./my-card.component.css'],
  animations: [
    trigger('changeState', [
      state('true', style({
        transform: 'translate(0px, 46%) scaleY(0.1)',
        filter: 'brightness(5%)'
      })),
      transition('* => true', animate('0.3s'))
    ])
  ]
})
export class MyCardComponent implements OnInit {

  @Input() card;

  constructor() { }

  ngOnInit() {
  }

}
