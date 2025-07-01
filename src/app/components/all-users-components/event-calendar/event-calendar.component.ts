import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { EventService } from '../../../services/events/event.service';
import { Event } from '../../../types/models/event.model';
import { Role } from '../../../types/roles';

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

  // User role and tabs
  userRole: Role | null = null;
  currentTab: CalendarTab = 'guest';
  availableTabs: CalendarTabConfig[] = [];

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

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    this.setupTabs();
    this.loadEvents();
    this.generateCalendar();
  }

  setupTabs(): void {
    this.availableTabs = [];

    // All users have guest events tab
    this.availableTabs.push({
      key: 'guest',
      label: 'My Events',
      description: 'Events where I am a guest',
      icon: 'calendar',
    });

    // PUP users have additional service busyness tab
    if (this.userRole === Role.ROLE_PUP) {
      this.availableTabs.push({
        key: 'busyness',
        label: 'Service Events',
        description: 'Events where my services are booked',
        icon: 'briefcase',
      });
    }

    // OD users have additional organized events tab
    if (this.userRole === Role.ROLE_OD) {
      this.availableTabs.push({
        key: 'organized',
        label: 'Organized Events',
        description: 'Events I have organized',
        icon: 'users',
      });
    }
  }

  switchTab(tabKey: CalendarTab): void {
    if (this.currentTab !== tabKey) {
      this.currentTab = tabKey;
      this.loadEvents();
    }
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null;

    let eventObservable;

    switch (this.currentTab) {
      case 'guest':
        eventObservable = this.eventService.getEventsByMonth(
          this.currentYear,
          this.currentMonth + 1
        );
        break;
      case 'busyness':
        eventObservable =
          this.eventService.getServiceProductBusynessEventsByMonth(
            this.currentYear,
            this.currentMonth + 1
          );
        break;
      case 'organized':
        eventObservable = this.eventService.getOrganizerEventsByMonth(
          this.currentYear,
          this.currentMonth + 1
        );
        break;
      default:
        eventObservable = this.eventService.getEventsByMonth(
          this.currentYear,
          this.currentMonth + 1
        );
    }

    eventObservable.subscribe({
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

  getCurrentTabConfig(): CalendarTabConfig | undefined {
    return this.availableTabs.find((tab) => tab.key === this.currentTab);
  }

  getTabIcon(iconName: string): string {
    const icons: { [key: string]: string } = {
      calendar:
        'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      briefcase:
        'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
      users:
        'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    };
    return icons[iconName] || icons['calendar'];
  }

  getColorScheme(): string {
    switch (this.currentTab) {
      case 'guest':
        return 'purple';
      case 'organized':
        return 'green';
      case 'busyness':
        return 'blue';
      default:
        return 'purple';
    }
  }

  getColorClasses(): {
    gradient: string;
    bg: string;
    bgHover: string;
    bgSecondary: string;
    bgSecondaryHover: string;
    text: string;
    textLight: string;
    border: string;
    tabActive: string;
    tabIcon: string;
    eventBg: string;
    eventHover: string;
    spinner: string;
  } {
    const colorScheme = this.getColorScheme();

    const colorClasses = {
      purple: {
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-500',
        bgHover: 'hover:bg-purple-600',
        bgSecondary: 'bg-purple-600',
        bgSecondaryHover: 'hover:bg-purple-700',
        text: 'text-purple-600',
        textLight: 'text-purple-100',
        border: 'border-purple-500',
        tabActive: 'text-purple-600 border-purple-500',
        tabIcon: 'bg-purple-100 text-purple-600',
        eventBg: 'bg-purple-200 text-purple-800',
        eventHover: 'hover:bg-purple-300',
        spinner: 'border-purple-500',
      },
      green: {
        gradient: 'from-green-500 to-green-600',
        bg: 'bg-green-500',
        bgHover: 'hover:bg-green-600',
        bgSecondary: 'bg-green-600',
        bgSecondaryHover: 'hover:bg-green-700',
        text: 'text-green-600',
        textLight: 'text-green-100',
        border: 'border-green-500',
        tabActive: 'text-green-600 border-green-500',
        tabIcon: 'bg-green-100 text-green-600',
        eventBg: 'bg-green-200 text-green-800',
        eventHover: 'hover:bg-green-300',
        spinner: 'border-green-500',
      },
      blue: {
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-500',
        bgHover: 'hover:bg-blue-600',
        bgSecondary: 'bg-blue-600',
        bgSecondaryHover: 'hover:bg-blue-700',
        text: 'text-blue-600',
        textLight: 'text-blue-100',
        border: 'border-blue-500',
        tabActive: 'text-blue-600 border-blue-500',
        tabIcon: 'bg-blue-100 text-blue-600',
        eventBg: 'bg-blue-200 text-blue-800',
        eventHover: 'hover:bg-blue-300',
        spinner: 'border-blue-500',
      },
    };

    return colorClasses[colorScheme as keyof typeof colorClasses];
  }

  getTabClasses(tabKey: string): string {
    if (this.currentTab === tabKey) {
      return this.getColorClasses().tabActive;
    }
    return 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300';
  }

  getTabIconClasses(tabKey: string): string {
    if (this.currentTab === tabKey) {
      return this.getColorClasses().tabIcon;
    }
    return 'bg-gray-100 text-gray-500 group-hover:bg-gray-200';
  }

  getEventClasses(eventStatus: string): string {
    switch (eventStatus) {
      case 'past':
        return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
      case 'ongoing':
        return 'bg-green-200 text-green-800 hover:bg-green-300';
      case 'upcoming':
        return `${this.getColorClasses().eventBg} ${
          this.getColorClasses().eventHover
        }`;
      default:
        return 'bg-gray-200 text-gray-700';
    }
  }

  getEventStatusBadgeClasses(eventStatus: string): string {
    switch (eventStatus) {
      case 'past':
        return 'bg-gray-200 text-gray-700';
      case 'ongoing':
        return 'bg-green-200 text-green-800';
      case 'upcoming':
        return this.getColorClasses().eventBg;
      default:
        return 'bg-gray-200 text-gray-700';
    }
  }

  getModalEventBorderClasses(eventStatus: string): string {
    switch (eventStatus) {
      case 'past':
        return 'border-gray-300 bg-gray-50';
      case 'ongoing':
        return 'border-green-300 bg-green-50';
      case 'upcoming':
        const scheme = this.getColorScheme();
        return `border-${scheme}-300 bg-${scheme}-50`;
      default:
        return 'border-gray-300 bg-gray-50';
    }
  }

  getActionButtonClasses(eventStatus: string): string {
    switch (eventStatus) {
      case 'past':
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
      case 'ongoing':
        return 'bg-green-100 text-green-600 hover:bg-green-200';
      case 'upcoming':
        const scheme = this.getColorScheme();
        return `bg-${scheme}-100 text-${scheme}-600 hover:bg-${scheme}-200`;
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    }
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
    return event.id;
  }

  getEventLocationText(event: Event): string {
    if (!event.location || !event.location.address) {
      return 'No location specified';
    }

    const address = event.location.address;
    if (address.length <= 30) {
      return address;
    }

    return address.substring(0, 27) + '...';
  }

  protected readonly Role = Role;
}

// Calendar tab types
type CalendarTab = 'guest' | 'busyness' | 'organized';

interface CalendarTabConfig {
  key: CalendarTab;
  label: string;
  description: string;
  icon: string;
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
  hasEvents: boolean;
}
