import { Component, OnInit, Input, HostListener } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { HttpClient, HttpResponse,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isUndefined } from 'util';
import { MatDialog } from '@angular/material/dialog';
import { DonateDialogComponent } from '../donate-dialog/donate-dialog.component';
import { InvitationDialogComponent } from '../invitation-dialog/invitation-dialog.component';
import { RefuseInvitationDialogComponent } from '../refuse-invitation-dialog/refuse-invitation-dialog.component';

@Component({
  selector: 'app-homescreen',
  templateUrl: './homescreen.component.html',
  styleUrls: ['./homescreen.component.css']
})
export class HomescreenComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  public doSomething($event) {
      this.playerReloaded();
  }
  @Input() username: string;
  @Input() isDonateMessageShown = false;
  showConversation: boolean = false;
  ws: any;
  childGame;
  disabled: boolean;
  httpGetRoomId;
  roomId: any;
  game: any = null;
  otherPlayer = "";
  askOtherPlayerName = "";
  playerInLobby = false;
  askedSomeoneForMatch = false;

  constructor(private http: HttpClient, private dialog: MatDialog){}

  ngOnInit(){
    this.game = null;
    if(!this.ws){
      this.connectUser();
    }
    if(!this.isDonateMessageShown){
      this.showDonateDialog();
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

  showInvitationDialog(playerToStartGameWith){
    let dialogRef = this.dialog.open(InvitationDialogComponent, {
      height: '150px',
      width: '450px',
      data: { 'playerToStartGameWith' : playerToStartGameWith }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === 'startGame'){
        this.confirmRequest(playerToStartGameWith);
      }
      else{
        this.refuseRequest(playerToStartGameWith);
      }
    });
  }

  showRefusalDialog(playerToStartGameWith){
    let dialogRef = this.dialog.open(RefuseInvitationDialogComponent, {
      height: '150px',
      width: '450px',
      data: { 'playerToStartGameWith' : playerToStartGameWith }
    });
  }

  confirmRequest(playerToStartGameWith){
    let data = JSON.stringify(
      {
        "playerOne": this.username,
        "playerTwo": playerToStartGameWith
      }
    );
    this.playerInLobby = false;
    this.ws.send("/app/acceptInvitation", {}, data);
  }

  refuseRequest(playerToStartGameWith){
    let data = JSON.stringify(
      {
        "otherPlayer": playerToStartGameWith
      }
    );
    this.ws.send("/app/refuseInvitation", {}, data);
  }

  checkIfOtherPlayerAvailable(){
    if(!this.otherPlayer){
      alert("Enter a real name");
      return;
    }
    if(this.otherPlayer === this.username){
      alert("You cannot play with yourself");
      return;
    }
    this.askedSomeoneForMatch = true;
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
      this.showRefusalDialog(game['requestingPlayer']);
    }
    else if(game['playerExists'] === false) {
      alert("Player you searched for doesn't exist");
      this.askedSomeoneForMatch = false;
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
      this.showInvitationDialog(game['requestingPlayer']);
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

  playerReloaded(){
    let data = JSON.stringify({
      'player' : this.username
    });
    this.ws.send("/app/removePlayer", {}, data);
  }

  resetGame(game){
    this.game = game;
  }
}