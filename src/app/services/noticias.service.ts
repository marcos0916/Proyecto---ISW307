import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Noticia {
  id: number;
  title: string;
  body: string;
  fecha?: string;
  categoria: string;
}

const BANCO_NOTICIAS: { categoria: string; title: string; body: string }[] = [
  { categoria: 'Evento', title: 'UAPA y Defensor del Pueblo realizan segunda clase sobre la evolución de la Constitución dominicana', body: 'La Escuela de Ciencias Jurídicas y Políticas, con el apoyo del Defensor del Pueblo, realizó la segunda clase de «Constitución Viva para Todos y Todas», con la participación de cinco facilitadores.' },
  { categoria: 'Evento', title: 'UAPA analiza «nuevas tendencias legislativas»', body: 'Bajo el título «Nuevas Tendencias Legislativas en el Derecho Penal Dominicano», la Escuela de Ciencias Jurídicas y Políticas realizó un seminario con expertos del área penal.' },
  { categoria: 'Evento', title: 'UAPA y RD, sede del Congreso Internacional de Tecnología «Containers Day»', body: 'Por primera vez, República Dominicana será sede del congreso europeo «Containers Day», que abordará inteligencia artificial, cloud, Kubernetes, DevOps y ciberseguridad en el campus de Santiago.' },
  { categoria: 'Académico', title: 'Académica de la UAPA recibe Premio Nacional a la Excelencia Magisterial', body: 'La doctora Reyna Hiraldo, directora del UCAP, recibió el Premio Nacional a la Excelencia del Docente de Instituciones de Educación Superior por su destacada trayectoria como educadora.' },
  { categoria: 'Comunicado', title: 'El Defensor del Pueblo y la UAPA firman acuerdo de cooperación', body: 'Ambas instituciones unen esfuerzos para fortalecer la educación en derechos humanos y promover una participación ciudadana más activa e inclusiva.' },
  { categoria: 'Evento', title: 'Presidente de INDOTEL dicta conferencia en la UAPA sobre «Educación STEM»', body: 'El doctor Guido Gómez Mazara dictó la conferencia «Educación STEM en la República Dominicana» en el Recinto Santo Domingo Oriental.' },
  { categoria: 'Académico', title: 'UAPA entrega 1,148 nuevos profesionales a la sociedad dominicana', body: 'Durante su Septuagésima Séptima Graduación Ordinaria, celebrada en el Recinto Cibao Oriental, la UAPA acumula ya 56,528 egresados en 31 años con su modelo educativo.' },
  { categoria: 'Evento', title: 'UAPA consolida la investigación científica con resultados destacados en su Congreso Internacional', body: 'La Vicerrectoría de Investigación y Posgrado culminó con éxito el Congreso Internacional de Investigación Científica, bajo el lema «Ciencia e investigación que transforman».' },
  { categoria: 'Evento', title: 'UAPA, UCAP y ASODAGRIM celebrarán Congreso Internacional de Topografía', body: 'El congreso, dedicado al empresario Manuel Estrella, se desarrolla en modalidad presencial en reconocimiento a su trayectoria en la ingeniería y la construcción.' },
  { categoria: 'Académico', title: 'UAPA celebra primera jornada científica de enfermería', body: 'El encuentro, dirigido a la humanización del cuidado y los servicios de salud, reunió a expertos nacionales e internacionales para fortalecer la formación de los futuros profesionales.' },
];

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  constructor(private http: HttpClient) {}

  getNoticias(): Observable<Noticia[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(posts =>
        posts.slice(0, 10).map((post, index) => {
          const contenido = BANCO_NOTICIAS[index % BANCO_NOTICIAS.length];
          return {
            id: post.id,
            title: contenido.title,
            body: contenido.body,
            categoria: contenido.categoria,
            fecha: new Date(Date.now() - post.id * 86400000).toLocaleDateString('es-DO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          };
        })
      )
    );
  }
}
