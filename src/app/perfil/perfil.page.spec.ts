import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { newspaperOutline, checkboxOutline, mapOutline, micOutline, settingsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class TabsPage {
  constructor() {
    addIcons({ newspaperOutline, checkboxOutline, mapOutline, micOutline, settingsOutline });
  }
}