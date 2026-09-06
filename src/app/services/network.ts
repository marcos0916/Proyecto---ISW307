import { Injectable, NgZone } from '@angular/core';
import { Network, ConnectionStatus } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private onlineStatus$ = new BehaviorSubject<boolean>(true);

  constructor(private ngZone: NgZone) {
    this.initNetworkMonitoring();
  }

  private async initNetworkMonitoring() {
    const status: ConnectionStatus = await Network.getStatus();
    this.onlineStatus$.next(status.connected);

    await Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      this.ngZone.run(() => {
        this.onlineStatus$.next(status.connected);
      });
    });
  }

  get isOnline$(): Observable<boolean> {
    return this.onlineStatus$.asObservable();
  }

  get isOnlineValue(): boolean {
    return this.onlineStatus$.value;
  }
}