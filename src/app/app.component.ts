import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { newspaperOutline, checkboxOutline, mapOutline, settingsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon,
    RouterLink, RouterLinkActive
  ],
})
export class AppComponent {
  constructor() {
    addIcons({ newspaperOutline, checkboxOutline, mapOutline, settingsOutline });
  }
}
