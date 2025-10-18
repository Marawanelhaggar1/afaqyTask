import { Component, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { UnitList } from '../unit-list/unit-list';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { UnitData } from '../../core/models/unit-data';
import { delay, timer } from 'rxjs';
import { UnitServices } from '../../core/services/unit-services';
import { CommonModule } from '@angular/common';

interface Unit extends UnitData {
  marker: L.Marker;
  visible: boolean;
}
@Component({
  selector: 'app-map',
  imports: [UnitList, LeafletModule, CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements OnInit, OnDestroy {
  options: L.MapOptions = {
    center: L.latLng(30.0444, 31.2357),
    zoom: 12,
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors',
      }),
    ],
  };

  hideFilters: boolean = false;
  units: Unit[] = [];
  layers: L.Layer[] = [];
  private currentSearch = '';
  private moveIntervals: ReturnType<typeof setTimeout>[] = [];

  constructor(private unitsService: UnitServices) {}

  ngOnInit(): void {
    this.generateUnits();
  }

  ngOnDestroy(): void {
    this.moveIntervals.forEach((t) => clearTimeout(t));
  }

  private generateUnits() {
    this.unitsService.getUnits().subscribe((data) => {
      this.units = data.map((u) => ({
        ...u,
        marker: this.createMarker(u),
        visible: true, // default checked
      }));
      this.layers = this.units.map((u) => u.marker);
      this.startRandomMovement();
    });
  }

  private createMarker(u: UnitData): L.Marker {
    return L.marker([u.lat, u.lng], {
      icon: L.icon({
        ...L.Icon.Default.prototype.options,
        iconUrl: 'assets/marker-icon.png',
        iconRetinaUrl: 'assets/marker-icon-2x.png',
        shadowUrl: 'assets/marker-shadow.png',
      }),
    }).bindPopup(`<b>${u.name}</b>`);
  }

  private startRandomMovement() {
    this.units.forEach((unit) => this.scheduleNextMove(unit));
  }

  private scheduleNextMove(unit: Unit) {
    const delay = Math.random() * 3000 + 2000;
    const timer = setTimeout(() => {
      this.moveUnitSmoothly(unit);
      this.scheduleNextMove(unit);
    }, delay);
    this.moveIntervals.push(timer);
  }

  private moveUnitSmoothly(unit: Unit) {
    const startLat = unit.lat;
    const startLng = unit.lng;
    const endLat = startLat + (Math.random() - 0.5) * 0.01;
    const endLng = startLng + (Math.random() - 0.5) * 0.01;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const currentLat = startLat + (endLat - startLat) * t;
      const currentLng = startLng + (endLng - startLng) * t;
      unit.marker.setLatLng([currentLat, currentLng]);
      if (t < 1) requestAnimationFrame(animate);
      else {
        unit.lat = endLat;
        unit.lng = endLng;
      }
    };

    requestAnimationFrame(animate);
  }

  onVisibilityChange(event: { id: number; visible: boolean }) {
    const unit = this.units.find((u) => u.id === event.id);
    if (unit) {
      unit.visible = event.visible;
      this.applyVisibilityAndSearch();
    }
  }

  onSearch(term: string) {
    this.currentSearch = term;
    this.applyVisibilityAndSearch();
  }

  private applyVisibilityAndSearch() {
    // const term = this.currentSearch.toLowerCase();
    this.layers = this.units
      .filter((u) => u.visible)
      .filter((u) => u.name.toLowerCase().includes(this.currentSearch))
      .map((u) => u.marker);
  }
}
