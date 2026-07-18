import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:8089/media/images';


  deleteImage(fileName: string): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${fileName}`
    );

  }


  getImageUrl(fileName: string): string {

    return `${this.apiUrl}/${fileName}`;

  }

}