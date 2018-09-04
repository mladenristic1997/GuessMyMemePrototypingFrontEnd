import { Component, OnInit } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  username: string;
  isUsernameTaken: any;
  isUsernameTakenBool: boolean;
  httpIsUserAvailable: Observable<HttpResponse<Object>>;
  isNameChosen: boolean = false;

  constructor(private http: HttpClient){}

  ngOnInit(){
    
  }

  checkAvailability(username: string){
    this.httpIsUserAvailable = this.isUsernameAvailable();
    this.httpIsUserAvailable.subscribe(data => {
      this.isUsernameTaken = data.body;
      if(this.isUsernameTaken == true) {
        this.isUsernameTakenBool = true;
      }
      else {
        this.isNameChosen = true;
      }
    });
    setTimeout(() => {}, 3000);
  }

  isUsernameAvailable(): Observable<HttpResponse<Object>> {
    let params = new HttpParams().set("username", this.username); //Create new HttpParams
    return this.http.get("http://localhost:8080/checkUsername", {
      params: params,
      observe: 'response'
    });
  }
}