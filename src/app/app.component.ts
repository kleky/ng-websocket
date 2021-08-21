import { Component, HostListener, OnInit } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, share, switchMap, tap } from 'rxjs/operators';
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
  socket$: Observable<GetWebSocketResponses<string>>;
  input$ = new QueueingSubject<Message>();
  messages$: Observable<WebSocketPayload>;

  // https://stackoverflow.com/questions/60952255/connecting-a-websocket-in-angular

  ngOnInit(): void {
    this.socket$ = makeWebSocketObservable<Mess>('ws://localhost:1337');

    this.messages$ = this.socket$.pipe(
      // the observable produces a value once the websocket has been opened
      switchMap((getResponses: GetWebSocketResponses) => {
        console.log('websocket opened');
        return getResponses(this.input$);
      }),
      share()
    );

    const messagesSubscription: Subscription = this.messages$.subscribe(
      (message: string) => {
        console.log('received message:', message);
        // respond to server
        this.input$.next('i got your message');
      },
      (error: Error) => {
        const { message } = error;
        if (message === normalClosureMessage) {
          console.log('server closed the websocket connection normally');
        } else {
          console.log('socket was disconnected due to error:', message);
        }
      },
      () => {
        // The clean termination only happens in response to the last
        // subscription to the observable being unsubscribed, any
        // other closure is considered an error.
        console.log('the connection was closed in response to the user');
      }
    );

    function closeWebsocket() {
      // this also caused the websocket connection to be closed
      messagesSubscription.unsubscribe();
    }

    setTimeout(closeWebsocket, 2000);
  }

  @HostListener('mousemove', ['$event'])
  onClick(event: MouseEvent) {
    this.input$.next({
      type: 'MOVE',
      payload: { x: event.clientX, y: event.clientY }
    });
  }
}
