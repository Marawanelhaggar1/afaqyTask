import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Unit {
  id: number;
  name: string;
  visible: boolean;
}

@Component({
  selector: 'app-unit-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './unit-list.html',
  styleUrl: './unit-list.scss',
})
export class UnitList implements OnInit, OnDestroy {
  @Input() units: Unit[] = [];
  @Output() searchChange = new EventEmitter<string>();
  @Output() visibilityChange = new EventEmitter<{
    id: number;
    visible: boolean;
  }>();

  searchTerm = '';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => this.searchChange.emit(term));
  }

  onSearch(term: string) {
    this.searchSubject.next(term);
  }

  onToggleVisibility(unit: Unit, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.visibilityChange.emit({ id: unit.id, visible: checked });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }
}
