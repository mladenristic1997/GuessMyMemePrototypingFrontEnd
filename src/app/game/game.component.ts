import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { HttpClient, HttpResponse,HttpParams } from '@angular/common/http';
import { trigger, animate, style, state, transition } from '@angular/animations';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as $ from 'jquery';
import { ExitGameDialogComponent } from '../exit-game-dialog/exit-game-dialog.component';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  @ViewChild('panel') public panel:ElementRef;
  @Input() game: any;
  @Input() username: any;
  @Input() state: any;
  scroll: any;
  opponentName: any;
  myMeme: any;
  opponentMeme: any;
  ws: any;
  myMove: any;
  opponentQuestion: any;
  opponentAnswer: any;
  chatHistory = [
    {
      'message': 'You are on this council but we do not grant you the rank of master',
      'isMyMessage': true
    },
    {
      'message': 'Vat',
      'isMyMessage': false
    }
  ];
  moveStatus: string;
  opponentCardsRow1 = [
    false, false, false, false, false, false, false, false
  ];
  opponentCardsRow2 = [
    false, false, false, false, false, false, false, false
  ];
  opponentCardsRow3 = [
    false, false, false, false, false, false, false, false
  ];
  memes = [];
  memeNames = ['Bongo Cat', 'Doge', 'Harambe', 'Etruscan Boar', 'Slaps Roof', 'Ugandan Knuckles', 'Dat Boi', 'Pepe', 'Dickbutt', 'Bike Cuck', 'Monkey Haircut', 'Ben Swolo', 'Just Right', 'Circle Game', 'Somebody touch my spaghet', 'Omae wa mou shindeiru', 'Skidaddle Skidoodle', 'Distracted Boyfriend', 'Zucc', 'Change my mind', 'Evil Patrick', 'American Chopper', 'Is this a pidgeon', 'Rick Astley'];
  myCardsRow1 = [0, 1, 2, 3, 4, 5, 6, 7];
  myCardsRow2 = [8, 9, 10, 11, 12, 13, 14, 15];
  myCardsRow3 = [16, 17, 18, 19, 20, 21, 22, 23];

  constructor(private http: HttpClient, private dialog: MatDialog) { }

  ngOnInit() {
    //commented out for now
    //this.setGameUp(this.game);
    for(let i = 0; i < 24; i++){
      this.memes.push({'name': this.memeNames[i], 'id': i, 'path': '../../assets/memes/' + i + '.png', 'isFlipped': false});
    }
    this.myMeme = {'name': this.memeNames[14], 'id': 14, 'path': '../../assets/memes/14.png', 'isFlipped': false};
  }

  ngOnDestroy(){
    this.disconnect();
  }

  exitGame(){
    let dialogRef = this.dialog.open(ExitGameDialogComponent, {
      height: '150px',
      width: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        //if i return true from dialog then user clicked Exit and now send message to server to end game and return player to homescreen
        this.game = undefined;
      }
    });
  }

  endGameDialog(endGameStatus, endGameMessage){
    let dialogRef = this.dialog.open(ExitGameDialogComponent, {
      height: '250px',
      width: '450px',
      data: {'endGameStatus': endGameStatus, 'endGameMessage': endGameMessage}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.game = undefined;
    });
  }

  setGameUp(game){
    if(this.username == game['playerOneName']){
      this.myMeme = game['playerOneMeme'];
      this.opponentName = game['playerTwoName'];
      this.opponentMeme = game['playerTwoMeme'];
      this.connect(game['roomId'], game['playerTwoName']);
    }
    if(this.username == game['playerTwoName']){
      this.myMeme = game['playerTwoMeme'];
      this.opponentName = game['playerOneName'];
      this.opponentMeme = game['playerOneMeme'];
      this.connect(game['roomId'], game['playerOneName']);
    }
  }

  makeMove(){
    /*let data = JSON.stringify(
      {
        "username": this.username,
        "move": this.myMove,
        "roomId": this.game['roomId']
      }
    );
    this.ws.send("/app/makeAMove", {}, data);
    this.state = (this.state + 1) % 6;*/
    if(this.myMove){
      let messageJson = {
        'message': this.myMove,
        'isMyMessage': true
      }
      this.chatHistory.push(messageJson);
      this.myMove = "";
      this.scrollToChatBottom();
      document.getElementById('elementId').scrollTop = 0;
    }
  }

  handleMove(move){
    //tempState is used because the logic is more intuitive that way
    //and we must increment state at the end because logic of the move should happen before it
    let tempState = this.state;
    let messageJson = {
      'message': move,
      'isMyMessage': false
    }
    this.chatHistory.push(messageJson);
    this.scrollToChatBottom();

    /*
    *   Game states:
    *   0 - asking question
    *   1 - receiving answer
    *   2 - received answer
    *   3 - await question
    *   4 - got question
    *   5 - answered question
    */
    /*
    switch(tempState){
      case 1:
        this.chatHistory.push(move);
        break;
      case 3:
        this.chatHistory.push(move);
        break;
      default: console.log("Error while handling move");
    }

    this.state = (this.state + 1) % 6;*/
  }

  connect(roomId, id){
    //connect to stomp where stomp endpoint is exposed
    //let withWS = new SockJS("http://localhost:8080/greeting");
    //if we want to use SockJS then in WebSocketConfig add withSockJS(); in Spring
    let subscribeUrl = "/topic/reply/" + roomId + "/" + id;
    let socket = new WebSocket("ws://localhost:8080/connectUser");
    this.ws = Stomp.over(socket);
    let that = this;
    this.ws.connect({}, function(frame) {
      that.ws.subscribe("/errors", function(message) {
        alert("Error " + message.body);
      });
      that.ws.subscribe(subscribeUrl, function(move) {
        that.handleMove(move.body);
      });
    }, function(error) {
      alert("STOMP error " + error);
    });
  }

  disconnect() {
    if (this.ws != null) {
      this.ws.ws.close();
    }

    console.log("Disconnected");
  }

  openDialog(meme): void {
    if(!meme['isFlipped']){
      let dialogRef = this.dialog.open(CardDialogComponent, {
        panelClass: 'card-dialog',
        data: meme,
        height: '560px',
        width: '430px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result){
          //this means the player has made a guess, send it now to server and check if this meme is the correct meme
        }
      });
    }
  }

  //scroll to bottom on every new message
  scrollToChatBottom(): void {
      $("#scroll-to-bottom").animate({ scrollTop: $('#scroll-to-bottom')[0].scrollHeight }, 1000);
  }

}
