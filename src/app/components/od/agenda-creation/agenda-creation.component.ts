import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgendaItem } from '../../../types/models/agendaItem.model';

@Component({
  selector: 'app-agenda-creation',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './agenda-creation.component.html',
  styleUrl: './agenda-creation.component.scss',
})
export class AgendaCreationComponent {
  @Input() agendaItems: AgendaItem[] = [];
  @Input() eventStartTime!: string;
  @Input() eventEndTime!: string;
  @Output() onAgendaCreated = new EventEmitter<AgendaItem[]>();
  @Output() onModalClose = new EventEmitter<void>();

  newItem: AgendaItem = {
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
  };

  private mouseDownOnBackground = false;

  addAgendaItem() {
    if (this.validateAgendaItem()) {
      this.agendaItems.push({ ...this.newItem });
      this.resetNewItem();
    }
  }

  private validateAgendaItem(): boolean {
    if (
      !this.newItem.title ||
      !this.newItem.startTime ||
      !this.newItem.endTime
    ) {
      alert('Please fill in all required fields');
      return false;
    }

    const startTime = new Date(this.newItem.startTime);
    const endTime = new Date(this.newItem.endTime);

    if (startTime >= endTime) {
      alert('End time must be after start time');
      return false;
    }

    return true;
  }

  private resetNewItem() {
    this.newItem = {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
    };
  }

  removeAgendaItem(index: number) {
    if (index >= 0 && index < this.agendaItems.length) {
      this.agendaItems.splice(index, 1);
    }
  }

  saveAgenda() {
    this.onAgendaCreated.emit(this.agendaItems);
  }

  closeModal() {
    this.onModalClose.emit();
  }

  onBackgroundMouseDown(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.mouseDownOnBackground = true;
    }
  }

  onBackgroundMouseUp(event: MouseEvent) {
    if (event.target === event.currentTarget && this.mouseDownOnBackground) {
      this.closeModal();
    }
    this.mouseDownOnBackground = false;
  }

  getTotalDuration(): string {
    if (this.agendaItems.length === 0) return '0 hours';

    let totalMinutes = 0;
    this.agendaItems.forEach((item) => {
      const start = new Date(item.startTime);
      const end = new Date(item.endTime);
      totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }

  // Legacy methods for backward compatibility
  addNewAgendaItem() {
    this.addAgendaItem();
  }

  get agenda() {
    return this.agendaItems;
  }

  set agenda(value: AgendaItem[]) {
    this.agendaItems = value;
  }

  get startDate() {
    return this.eventStartTime;
  }

  get endDate() {
    return this.eventEndTime;
  }

  get currentAgendaItem() {
    return this.newItem;
  }

  set currentAgendaItem(value: AgendaItem) {
    this.newItem = value;
  }

  createAgenda() {
    this.saveAgenda();
  }
}
