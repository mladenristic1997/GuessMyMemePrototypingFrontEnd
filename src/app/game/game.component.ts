import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as $ from 'jquery';
import { ExitGameDialogComponent } from '../exit-game-dialog/exit-game-dialog.component';
import { EndGameDialogComponent } from '../end-game-dialog/end-game-dialog.component';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  @HostListener('window:beforeunload', ['$event'])
  public doSomething($event) {
    if(!this.gameOver){
      this.playerReloaded();
    }
    else{
      this.cleanMe();
    }
  }
  @ViewChild('panel') public panel:ElementRef;
  @Input() game: any;
  @Input() username: any;
  @Output() childGame = new EventEmitter();
  //todo stavi stateove da je key ime, a value broj statea
  player = {};
  gameState = "";
  gameOver: any;
  myMemePath: any;
  scroll: any;
  ws: any;
  myMove: any;
  chatHistory : Array<Object> = [];
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
    console.log("game", this.game);
    this.player = this.game;
    this.gameStateMessage();
    for(let i = 0; i < 24; i++){
      this.memes.push({'name': this.memeNames[i], 'id': i, 'path': '../../assets/memes/' + i + '.png', 'isFlipped': false});
    }
    this.connect(this.game['id'], this.username);
    this.myMemePath = '../../assets/memes/' + this.player['playerMeme'] + '.png';
  }

  //this tells the player what to do
  gameStateMessage(){
    /*
    *   Game states:
    *   0 - asking question
    *   1 - receiving answer
    *   2 - received answer
    *   3 - await question
    *   4 - got question
    *   5 - answered question
    */

    switch(this.player['playerState']){
      case 0: this.gameState = "Ask A Question"; break;
      case 1: this.gameState = "Awaiting Answer"; break;
      case 2: this.gameState = "Flip/Guess Memes"; break;
      case 3: this.gameState = "Awaiting Question"; break;
      case 4: this.gameState = "Answer The Question"; break;
      case 5: this.gameState = "Opponent Flipping Memes"; break;
      default: this.gameState = "Error parsing game state"; break;
    }
  }

  ngOnDestroy(){
    console.log("destroy");
    this.disconnect();
  }

  exitGame(){
    let dialogRef = this.dialog.open(ExitGameDialogComponent, {
      height: '150px',
      width: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === 'quit'){
        //if i return true from dialog then user clicked Exit and now send message to server to end game and return player to homescreen
        let data = JSON.stringify({
          'player' : this.player
        });
        this.ws.send("/app/quit", {}, data);
        //window.location.reload();
        this.cleanUp();
      }
    });
  }

  endGameDialog(endGameStatus, endGameMessage){
    let dialogRef = this.dialog.open(EndGameDialogComponent, {
      height: '170px',
      width: '450px',
      data: { 'endGameStatus': endGameStatus, 'endGameMessage': endGameMessage }
    });

    dialogRef.afterClosed().subscribe(result => {
      //window.location.reload();
      this.removeMeFromInGame();
      this.cleanUp();
    });
  }

  makeMove(){
    //checking if move is empty, cannot send empty string as a message
    if(this.myMove.trim()){
      this.player['playerState'] = ((this.player['playerState'] + 1) % 6);
      let messageJson = {
        'message': this.myMove,
        'isMyMessage': true
      }
      let data = JSON.stringify({
        'player' : this.player,
        'message' : this.myMove
      });
      this.ws.send("/app/makeAMove", {}, data);
      this.myMove = "";
      this.gameStateMessage();
      this.chatHistory.push(messageJson);
      this.scrollToChatBottom();
      document.getElementById('elementId').scrollTop = 0;
    }
    else this.myMove = "";
  }

  endTurn(){
    this.player['playerState'] = ((this.player['playerState'] + 1) % 6);
    let data = JSON.stringify({
      'player' : this.player
    });
    this.ws.send("/app/endTurn", {}, data);
    this.gameStateMessage();
  }

  handleMessage(move){
    if(move['gameOver']){
      this.gameOver = true;
      this.endGameDialog(move['gameOver']['endGameStatus'], move['gameOver']['endGameMessage']);
      return;
    }
    if(move['playerEndTurn']){
      this.player = move['playerEndTurn'];
      if(move['playerEndTurn']['opponentFlippedMemes']){
        this.flipCards(move['playerEndTurn']['opponentFlippedMemes']);
        this.gameStateMessage();
      }
      return;
    }
    //then it means it's a move
    this.player = move['player'];
    let messageJson = {
      'message': move['message'],
      'isMyMessage': false
    };
    this.chatHistory.push(messageJson);
    this.gameStateMessage();
    this.scrollToChatBottom();
  }

  flipCards(memes){
    console.log("memes", memes);
    for(let i of memes){
      if(i === -1) continue;
      switch(Math.floor(i / 8)){
        case 0: this.opponentCardsRow3[i % 8] = true; break;
        case 1: this.opponentCardsRow2[i % 8] = true; break;
        case 2: this.opponentCardsRow1[i % 8] = true; break;
      }
    }
    console.log(this.opponentCardsRow1, this.opponentCardsRow2, this.opponentCardsRow3);
  }

  connect(roomId, username){
    //connect to stomp where stomp endpoint is exposed
    //let withWS = new SockJS("http://localhost:8080/greeting");
    //if we want to use SockJS then in WebSocketConfig add withSockJS(); in Spring
    let subscribeUrl = "/topic/reply/" + roomId + "/" + username;
    let socket = new WebSocket("ws://46.101.208.178/ws");
    this.ws = Stomp.over(socket);
    let that = this;
    this.ws.connect({}, function(frame) {
      that.ws.subscribe("/errors", function(message) {
        alert("Error " + message.body);
      });
      that.ws.subscribe(subscribeUrl, function(move) {
        that.handleMessage(JSON.parse(move.body));
      });
    }, function(error) {
      alert("STOMP error " + error);
    });
  }

  disconnect() {
    if (this.ws != null) {
      this.ws.disconnect();
    }
    console.log("Disconnected");
  }

  openMemeCardDialog(meme): void {
    if(this.player['playerState'] !== 2) return;
    if(!meme['isFlipped']){
      let dialogRef = this.dialog.open(CardDialogComponent, {
        panelClass: 'card-dialog',
        data: meme,
        height: '560px',
        width: '430px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result === 'flip'){
          this.player['flippedMemes'].push(meme['id']);
        }
        if(result === 'guess'){
          this.guessMeme(meme['id']);
        }
      });
    }
  }

  guessMeme(memeId){
    let data = JSON.stringify({
      'player' : this.player,
      'guessedMemeId' : memeId
    });
    this.ws.send("/app/guessMeme", {}, data);
  }

  //scroll to bottom on every new message
  scrollToChatBottom(): void {
      $("#scroll-to-bottom").animate({ scrollTop: $('#scroll-to-bottom')[0].scrollHeight }, 1000);
  }

  cleanMe(){
    let data = JSON.stringify({
      'player' : this.player
    });
    this.ws.send("/app/cleanMe", {}, data);
  }

  cleanUp(){
    this.player = {};
    this.myMemePath = undefined;
    this.myMove = undefined;
    this.gameState = "";
    this.chatHistory = [];
    this.moveStatus = "";
    for(let i = 0; i < this.opponentCardsRow1.length; i++){
      this.opponentCardsRow1[i] = false;
      this.opponentCardsRow2[i] = false;
      this.opponentCardsRow3[i] = false;
    }
    this.memes = [];
    this.game = null;
    this.childGame.emit(this.game);
  }

  playerReloaded(){
    let data = JSON.stringify({
      'player' : this.player
    });
    this.ws.send("/app/playerReloaded", {}, data);
  }

  removeMeFromInGame(){
    let data = JSON.stringify({
      'player' : this.player
    });
    this.ws.send("/app/removeFromInGame", {}, data);
  }

}
