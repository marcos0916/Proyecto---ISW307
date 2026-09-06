import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBadge,
  IonItem,
  IonInput,
  IonButton,
  IonList,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { NetworkService } from '../services/network';
import { DataService, TaskItem } from '../services/data';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBadge,
    IonItem,
    IonInput,
    IonButton,
    IonList,
    IonLabel,
    IonIcon
  ]
})
export class HomePage implements OnInit {
  isOnline$!: Observable<boolean>;
  items$!: Observable<TaskItem[]>;
  newItemTitle: string = '';

  constructor(
    private networkService: NetworkService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.isOnline$ = this.networkService.isOnline$;
    this.items$ = this.dataService.items;
  }

  saveItem() {
    if (!this.newItemTitle.trim()) return;
    this.dataService.addItem(this.newItemTitle);
    this.newItemTitle = '';
  }
}