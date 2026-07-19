import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private http = inject(HttpClient);

  uploadImages(files: File[]) {

    const formData = new FormData();

    files.forEach(file => {

      formData.append('images', file);

    });

    return this.http.post<string[]>(
      `${environment.mediaUrl}/upload`,
      formData
    );

  }

}