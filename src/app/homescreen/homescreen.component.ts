import { Component, OnInit, Input } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { HttpClient, HttpResponse,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isUndefined } from 'util';
import { MatDialog } from '@angular/material/dialog';
import { DonateDialogComponent } from '../donate-dialog/donate-dialog.component';

@Component({
  selector: 'app-homescreen',
  templateUrl: './homescreen.component.html',
  styleUrls: ['./homescreen.component.css']
})
export class HomescreenComponent implements OnInit {

  @Input() username: string;
  @Input() isDonateMessageShown = false;
  showConversation: boolean = false;
  ws: any;
  disabled: boolean;
  httpGetRoomId;
  roomId: any;
  game: any = null;
  otherPlayer = "";
  askOtherPlayerName = "";
  opponent: any;
  state: any;
  playerInLobby = false;
  askedSomeoneForMatch = false;

  constructor(private http: HttpClient, private dialog: MatDialog){}

  ngOnInit(){
    this.game = null;
    if(!this.ws){
      this.connectUser();
    }
    if(!this.isDonateMessageShown){
      //this.showDonateDialog();
    }
  }

  showDonateDialog(){
    let dialogRef = this.dialog.open(DonateDialogComponent, {
      height: '73vh',
      width: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isDonateMessageShown = true;
    });
  }

  getRoomId() {
    this.playerInLobby = true;
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
      let data = JSON.stringify(
        {
          "playerOne": this.username,
          "playerTwo": playerToStartGameWith
        }
      );
      this.playerInLobby = false;
      this.ws.send("/app/acceptInvitation", {}, data);
    }
    else{
      let data = JSON.stringify(
        {
          "otherPlayer": playerToStartGameWith
        }
      );
      this.ws.send("/app/refuseInvitation", {}, data);
    }
  }

  checkIfOtherPlayerAvailable(){
    this.askedSomeoneForMatch = true;
    if(this.otherPlayer === this.username){
      alert("You cannot play with yourself");
    }
    this.askOtherPlayerName = this.otherPlayer;
    this.otherPlayer = "";
    let data = JSON.stringify({
      "requestingPlayer": this.username,
      "otherPlayer": this.askOtherPlayerName
    });
    this.ws.send("/app/isOtherPlayerAvailable", {}, data);
  }

  askOtherPlayer(){
    let data = JSON.stringify(
      {
        "requestingPlayer": this.username,
        "otherPlayer": this.askOtherPlayerName
      }
    );
    this.askedSomeoneForMatch = true;
    this.ws.send("/app/sendInvitation", {}, data);
  }

  //this method will handle if some user sent a request to play or if server sent a roomId to the user
  handleServerMessage(game){
    if(game['refuseInvitation'] === true){
      this.askedSomeoneForMatch = false;
      alert("Player refused your invitation");
    }
    else if(game['playerAvailable'] === false){
      alert("Player not available");
      this.askedSomeoneForMatch = false;
    }
    else if(game['playerAvailable'] === true){
      this.askedSomeoneForMatch = true;
      this.askOtherPlayer();
    }
    else if(game['requestingPlayer']){
      this.startGameWithRequestingPlayer(game['requestingPlayer']);
    }
    else if(game){ //we know we are handling a game object
      this.game = game;
    }
  }

  connectUser() {
    if(!this.ws){
      //connect to stomp where stomp endpoint is exposed
      //let withWS = new SockJS("http://localhost:8080/connectUser");
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
          that.handleServerMessage(JSON.parse(game.body));
        });
        that.disabled = true;
      }, function(error) {
        alert("STOMP error " + error);
      });
    }
  }

  disconnect() {
    if (this.ws != null) {
      this.ws.ws.close();
    }
    console.log("Disconnected");
  }

}