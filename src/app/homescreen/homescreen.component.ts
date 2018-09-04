import { Component, OnInit, Input } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { HttpClient, HttpResponse,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { resolve, reject } from 'q';

@Component({
  selector: 'app-homescreen',
  templateUrl: './homescreen.component.html',
  styleUrls: ['./homescreen.component.css']
})
export class HomescreenComponent implements OnInit {

  @Input() username: string;
  greetings: string[] = [];
  showConversation: boolean = false;
  name: string;
  ws: any;
  disabled: boolean;
  httpGetRoomId;
  roomId: any;

  constructor(private http: HttpClient){}

  ngOnInit(){
  }

  getRoomId() {
    let params = new HttpParams().set("username", this.username); //Create new HttpParams
    return this.http.get("http://localhost:8080/getRoomId", {params: params, observe: 'response'});
  }

  assignRoomId(){
    this.httpGetRoomId = this.getRoomId();
    this.httpGetRoomId.subscribe(data => {
      this.roomId = data.body;
      this.connect();
    });
  }

  connect() {
    //connect to stomp where stomp endpoint is exposed
    //let withWS = new SockJS("http://localhost:8080/greeting");
    //if we want to use SockJS then in WebSocketConfig add withSockJS(); in Spring
    console.log(this.roomId);
    let subscribeUrl = "/topic/reply/" + this.roomId;
    let socket = new WebSocket("ws://localhost:8080/greeting");
    this.ws = Stomp.over(socket);
    let that = this;
    this.ws.connect({}, function(frame) {
      that.ws.subscribe("/errors", function(message) {
        alert("Error " + message.body);
      });
      that.ws.subscribe(subscribeUrl, function(message) {
        console.log(message)
        that.showGreeting(message.body);
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

  sendName() {
    let data = JSON.stringify({
      'name' : this.name,
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