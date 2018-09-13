import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { HttpClient, HttpResponse,HttpParams } from '@angular/common/http';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  @Input() game: any;
  @Input() username: any;
  @Input() state: any;
  opponentName: any;
  myMeme: any;
  opponentMeme: any;
  ws: any;
  myMove: any;
  opponentQuestion: any;
  opponentAnswer: any;
  chatHistory: string[] = [];


  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.connect(this.game['roomId']);
    this.setGameUp(this.game);

  }

  ngOnDestroy(){
    this.disconnect();
  }

  setGameUp(game){
    if(this.username == game['playerOneName']){
      this.myMeme = game['playerOneMeme'];
      this.opponentName = game['playerTwoName'];
      this.opponentMeme = game['playerTwoMeme'];
    }
    if(this.username == game['playerTwoName']){
      this.myMeme = game['playerTwoMeme'];
      this.opponentName = game['playerOneName'];
      this.opponentMeme = game['playerOneMeme'];    
    }
  }

  makeMove(){
    let params = new HttpParams().set("opponent", this.opponentName).set("move", this.myMove);
    this.http.get("http://localhost:8080/makeAMove", {params: params, observe: 'response'});
    this.state = (this.state + 1) % 6;
    this.chatHistory.push(this.myMove);
  }

  handleMove(move){
    //tempState is used because the logic is more intuitive that way
    //and we must increment state at the end because logic of the move should happen before it
    let tempState = this.state;
    /*
    *   Game states:
    *   0 - asking question
    *   1 - receiving answer
    *   2 - received answer
    *   3 - await question
    *   4 - got question
    *   5 - answered question
    */

    switch(tempState){
      case 1:
        this.chatHistory.push(move);
        break;
      case 3:
        this.chatHistory.push(move);
        break;
      default: console.log("Error while handling move");
    }

    this.state = (this.state + 1) % 6;  
  }

  connect(id){
    //connect to stomp where stomp endpoint is exposed
    //let withWS = new SockJS("http://localhost:8080/greeting");
    //if we want to use SockJS then in WebSocketConfig add withSockJS(); in Spring
    let subscribeUrl = "/topic/reply/" + id;
    let socket = new WebSocket("ws://localhost:8080/connectUser");
    this.ws = Stomp.over(socket);
    let that = this;
    this.ws.connect({}, function(frame) {
      that.ws.subscribe("/errors", function(message) {
        alert("Error " + message.body);
      });
      that.ws.subscribe(subscribeUrl, function(move) {
        this.handleMove(move);
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

}