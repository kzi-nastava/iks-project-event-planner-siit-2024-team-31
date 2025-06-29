import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../../services/events/event.service';
import { Event } from '../../../types/models/event.model';

@Component({
  selector: 'app-event-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-calendar.component.html',
  styleUrl: './event-calendar.component.scss',
})
export class EventCalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  currentDay = this.currentDate.getDate();

  events: Event[] = [];
  loading = false;
  error: string | null = null;

  // Modal for day events
  showDayEventsModal = false;
  selectedDayEvents: Event[] = [];
  selectedDate: Date | null = null;

  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  calendarDays: CalendarDay[] = [];

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
    this.generateCalendar();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null;

    this.eventService
      .getEventsByMonth(this.currentYear, this.currentMonth + 1)
      .subscribe({
        next: (events) => {
          this.events = events;
          this.loading = false;
          this.generateCalendar();
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.error = 'Failed to load events';
          this.loading = false;
          this.generateCalendar();
        },
      });
  }

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.calendarDays = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayEvents = this.getEventsForDate(date);

      this.calendarDays.push({
        date: date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === this.currentMonth,
        isToday: this.isToday(date),
        events: dayEvents,
        hasEvents: dayEvents.length > 0,
      });
    }
  }

  getEventsForDate(date: Date): Event[] {
    return this.events.filter((event) => {
      if (!event.startTime) return false;
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadEvents();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadEvents();
  }

  goToCurrentMonth(): void {
    const now = new Date();
    this.currentMonth = now.getMonth();
    this.currentYear = now.getFullYear();
    this.loadEvents();
  }

  onEventClick(event: Event): void {
    if (event.id) {
      this.router.navigate(['/events', event.id]);
    }
  }

  onDayClick(calendarDay: CalendarDay): void {
    if (calendarDay.hasEvents) {
      this.selectedDayEvents = calendarDay.events;
      this.selectedDate = calendarDay.date;
      this.showDayEventsModal = true;
    }
  }

  onMoreEventsClick(calendarDay: CalendarDay, mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation(); // Prevent day click
    this.selectedDayEvents = calendarDay.events;
    this.selectedDate = calendarDay.date;
    this.showDayEventsModal = true;
  }

  closeDayEventsModal(): void {
    this.showDayEventsModal = false;
    this.selectedDayEvents = [];
    this.selectedDate = null;
  }

  formatEventTime(event: Event): string {
    if (!event.startTime) return '';
    const date = new Date(event.startTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatEventDuration(event: Event): string {
    if (!event.startTime || !event.endTime) return '';
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const startTime = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const endTime = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${startTime} - ${endTime}`;
  }

  getEventStatusClass(event: Event): string {
    const now = new Date();
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);

    if (now > eventEnd) {
      return 'past';
    } else if (now >= eventStart && now <= eventEnd) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  }

  getEventStatusText(event: Event): string {
    const status = this.getEventStatusClass(event);
    switch (status) {
      case 'past':
        return 'Completed';
      case 'ongoing':
        return 'Ongoing';
      case 'upcoming':
        return 'Upcoming';
      default:
        return '';
    }
  }

  trackByEventId(index: number, event: Event): string {
    return event.id || index.toString();
  }
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
  hasEvents: boolean;
}
