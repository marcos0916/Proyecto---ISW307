import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Noticia {
  id: number;
  title: string;
  body: string;
  fecha?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  constructor(private http: HttpClient) {}

  getNoticias(): Observable<Noticia[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(posts =>
        posts.slice(0, 15).map(post => ({
          id: post.id,
          title: post.title,
          body: post.body,
          fecha: new Date(Date.now() - post.id * 86400000).toLocaleDateString('es-DO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
        }))
      )
    );
  }
}