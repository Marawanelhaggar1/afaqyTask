import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnitData } from '../models/unit-data';

@Injectable({
  providedIn: 'root',
})
export class UnitServices {
  private unitsUrl = 'assets/data.json';

  constructor(private http: HttpClient) {}

  getUnits(): Observable<UnitData[]> {
    return this.http.get<UnitData[]>(this.unitsUrl);
  }
}
