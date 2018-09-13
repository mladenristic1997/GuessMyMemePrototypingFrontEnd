import { Component, OnInit, Input } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { HttpClient, HttpResponse,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-homescreen',
  templateUrl: './homescreen.component.html',
  styleUrls: ['./homescreen.component.css']
})
export class HomescreenComponent implements OnInit {

  @Input() username: string;
  greetings: string[] = [];
  showConversation: boolean = false;
  message: string;
  ws: any;
  disabled: boolean;
  httpGetRoomId;
  roomId: any;
  game: any;
  otherPlayer = "";
  opponent: any;
  state: any;

  constructor(private http: HttpClient){}

  ngOnInit(){
    this.connectUser();
  }

  getRoomId() {
    let data = JSON.stringify(
      {
        "username" : this.username
      }
    );

    this.ws.send("/app/getRoomId", {}, data);
    /*
    let params = new HttpParams().set("username", this.username); //Create new HttpParams
    this.http.get("http://localhost:8080/getRoomId", {params: params, observe: 'response'});
    console.log("sent");*/
  }


  startGameWithRequestingPlayer(playerToStartGameWith){
    if(window.confirm("Do you accept game invitation from player " + playerToStartGameWith)){
      let params = new HttpParams().set("playerOne", this.username).set("playerTwo", playerToStartGameWith); //Create new HttpParams
      this.http.get("http://localhost:8080/acceptInvitation", {
        params: params,
        observe: 'response'
      });
    }
  }

  askOtherPlayer(){
    //implement this method here and on the backend
    let params = new HttpParams().set("requestingPlayer", this.username).set("otherPlayer", this.otherPlayer); //Create new HttpParams
    this.otherPlayer = "";
    this.http.get("http://localhost:8080/sendInvitation", {
      params: params,
      observe: 'response'
    });
  }


  //this method will handle if some user sent a request to play or if server sent a roomId to the user
  handleServerMessage(game){
    //it is a game invitation
    /*if(game['requestingPlayer']){
      //trigger the game request modal
      this.startGameWithRequestingPlayer(game['requestingPlayer'])
    }*/
    //it is a game session object
    if(false){
      //placehold, figure out how to deal with undefined values
    }
    else{
      if(game['playerOneName'] == this.username){
        this.state = 0;
      }
      if(game['playerTwoName'] == this.username){
        this.state = 3;
      }
      this.game = game;
    }
  }

  connectUser() {
    //connect to stomp where stomp endpoint is exposed
    //let withWS = new SockJS("http://localhost:8080/greeting");
    //if we want to use SockJS then in WebSocketConfig add withSockJS(); in Spring
    let subscribeUrl = "/topic/reply/" + this.username;
    let socket = new WebSocket("ws://localhost:8080/connectUser");
    this.ws = Stomp.over(socket);
    let that = this;
    this.ws.connect({}, function(frame) {
      that.ws.subscribe("/errors", function(message) {
        alert("Error " + message.body);
      });
      that.ws.subscribe(subscribeUrl, function(game) {
        //we need this subscription if someone wants to play with this player
        //so we will write a method that will trigger a message that asks to join
        console.log(game);
        this.handleServerMessage(game.body);
      });
      that.disabled = true;
    }, function(error) {
      alert("STOMP error " + error);
    });
  }

  disconnect() {
    if (this.ws != null) {
      this.ws.ws.close();
    }
    this.setConnected(false);
    console.log("Disconnected");
  }

  sendMessage() {
    let data = JSON.stringify({
      'message' : this.message,
      'id' : "" + this.roomId
    })
    this.ws.send("/app/message", {}, data);
  }

  showGreeting(message) {
    this.showConversation = true;
    this.greetings.push(message)
  }

  setConnected(connected) {
    this.disabled = connected;
    this.showConversation = connected;
    this.greetings = [];
  }
}