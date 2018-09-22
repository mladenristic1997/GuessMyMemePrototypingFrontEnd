import { Component, OnInit, Input } from '@angular/core';
import { trigger, style, transition, state, animate } from '@angular/animations';

@Component({
  selector: 'app-opponent-card',
  templateUrl: './opponent-card.component.html',
  styleUrls: ['./opponent-card.component.css'],
  animations: [
    trigger('changeState', [
      state('true', style({
        transform: 'translate(0px, 46%) scaleY(0.1)',
      })),
      transition('* => true', animate('0.3s'))
    ])
  ]
})
export class OpponentCardComponent implements OnInit {

  @Input() cardHeight;
  @Input() cardWidth;
  @Input() isFlipped;

  constructor() { }

  ngOnInit() {
  }

}
