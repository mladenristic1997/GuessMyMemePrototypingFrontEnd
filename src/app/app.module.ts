import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'

import { AppComponent } from './app.component';
import { HomescreenComponent } from './homescreen/homescreen.component';
import { GameComponent } from './game/game.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OpponentCardComponent } from './opponent-card/opponent-card.component';
import { MyCardComponent } from './my-card/my-card.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CardDialogComponent } from './card-dialog/card-dialog.component';
import { DonateDialogComponent } from './donate-dialog/donate-dialog.component';
import { ExitGameDialogComponent } from './exit-game-dialog/exit-game-dialog.component';
import { EndGameDialogComponent } from './end-game-dialog/end-game-dialog.component';
import { InvitationDialogComponent } from './invitation-dialog/invitation-dialog.component';
import { RefuseInvitationDialogComponent } from './refuse-invitation-dialog/refuse-invitation-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomescreenComponent,
    GameComponent,
    OpponentCardComponent,
    MyCardComponent,
    CardDialogComponent,
    DonateDialogComponent,
    ExitGameDialogComponent,
    EndGameDialogComponent,
    InvitationDialogComponent,
    RefuseInvitationDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule
  ],
  entryComponents: [
    CardDialogComponent,
    DonateDialogComponent,
    ExitGameDialogComponent,
    EndGameDialogComponent,
    InvitationDialogComponent,
    RefuseInvitationDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
