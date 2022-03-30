import { Component, HostListener, OnInit } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import {catchError, concatMap, share, switchMap, tap} from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import makeWebSocketObservable, {
  GetWebSocketResponses,
  normalClosureMessage
} from 'rxjs-websockets';
import WebSocketPayload from 'rxjs-websockets';
import { QueueingSubject } from 'queueing-subject';

type Message = {
  type: string;
  payload: any;
};

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  name = 'Angular';
  wsUrl = 'ws://localhost:1337';
  subject$: WebSocketSubject<Message> = webSocket(this.wsUrl);

  ngOnInit(): void {
    this.subject$.pipe(
        tap(msg => console.log(msg)),
        catchError(err => of(console.error(err)))
    )
  }

  @HostListener('mousemove', ['$event'])
  onClick(event: MouseEvent) {
    this.subject$.next({
      type: 'MOVE',
      payload: { x: event.clientX, y: event.clientY }
    });
  }
}
