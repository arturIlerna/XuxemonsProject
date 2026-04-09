import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Xuxemon {
  id?: number; // Opcional porque al crear no tenemos ID todavía
  name: string;
  type: 'Agua' | 'Tierra' | 'Aire';
  size: 'Pequeño' | 'Mediano' | 'Grande';
  level: number;
  attack: number;
  defense: number;
  captured: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class XuxemonsService {
  private apiUrl = `${environment.apiUrl}/xuxemons`; // Ajusta según tu ruta en Laravel

  private xuxemonsSubject = new BehaviorSubject<Xuxemon[]>([]);
  public xuxemons$ = this.xuxemonsSubject.asObservable();

  constructor(private http: HttpClient) {
    // Al iniciar el servicio, cargamos los datos reales del backend
    this.cargarXuxemons();
  }

  // LECTURA (GET) - Soporta los filtros por Query de Laravel (?type=Agua&size=Gran)
  cargarXuxemons(filtros?: { type?: string; size?: string }) {
    let params = new HttpParams();
    if (filtros?.type) params = params.set('type', filtros.type);
    if (filtros?.size) params = params.set('size', filtros.size);

    this.http.get<Xuxemon[]>(this.apiUrl, { params }).subscribe({
      next: (data) => this.xuxemonsSubject.next(data),
      error: (err) => console.error('Error cargando Xuxemons', err)
    });
  }

  // CREACIÓN (POST)
  crearXuxemon(nuevoXuxemon: Xuxemon) {
    this.http.post<Xuxemon>(this.apiUrl, nuevoXuxemon).subscribe({
      next: (creado) => {
        const actuales = this.xuxemonsSubject.getValue();
        this.xuxemonsSubject.next([...actuales, creado]); // Añadimos el nuevo al estado
      },
      error: (err) => console.error('Error creando', err)
    });
  }

  // ACTUALIZACIÓN (PUT/PATCH)
  actualizarXuxemon(id: number, datosActualizados: Partial<Xuxemon>) {
    this.http.put<Xuxemon>(`${this.apiUrl}/${id}`, datosActualizados).subscribe({
      next: (actualizado) => {
        const actuales = this.xuxemonsSubject.getValue();
        const listaActualizada = actuales.map(x => x.id === id ? actualizado : x);
        this.xuxemonsSubject.next(listaActualizada); // Reemplazamos el editado
      },
      error: (err) => console.error('Error actualizando', err)
    });
  }

  // ELIMINACIÓN (DELETE)
  eliminarXuxemon(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        const actuales = this.xuxemonsSubject.getValue();
        this.xuxemonsSubject.next(actuales.filter(x => x.id !== id)); // Filtramos el borrado
      },
      error: (err) => console.error('Error eliminando', err)
    });
  }
}