import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../../services/analytics/analytics.service';
import { AuthService } from '../../../services/auth/auth.service';
import { EventAnalyticsSummary } from '../../../types/models/analytics.model';
import { Role } from '../../../types/roles';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss',
})
export class AnalyticsDashboardComponent implements OnInit {
  eventsSummary: EventAnalyticsSummary[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  loadAnalyticsData(): void {
    this.loading = true;
    this.error = null;

    const currentUser = this.authService.getCurrentUser();

    // Determine which analytics endpoint to use based on user role
    const analyticsObservable =
      currentUser?.role === Role.ROLE_OD
        ? this.analyticsService.getMyEventsAnalyticsSummary()
        : this.analyticsService.getEventAnalyticsSummary();

    analyticsObservable.subscribe({
      next: (data) => {
        this.eventsSummary = data;
        this.loading = false;
      },
      error: (err) => {
        // Fallback to mock data for development if API fails
        console.warn('API call failed, using mock data:', err);
        try {
          this.eventsSummary =
            this.analyticsService.generateMockEventSummaries();
          this.loading = false;
        } catch (mockErr) {
          this.error = 'Failed to load analytics data';
          this.loading = false;
          console.error('Error loading analytics:', mockErr);
        }
      },
    });
  }

  refreshData(): void {
    this.loadAnalyticsData();
  }

  viewEventAnalytics(eventId: number): void {
    this.router.navigate(['/admin/analytics/event', eventId]);
  }

  exportEventReport(eventId: number): void {
    // Try to export directly from API
    this.analyticsService.exportAnalyticsReport(eventId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `event-${eventId}-analytics-report.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error exporting report:', err);
        // Fallback to navigating to detailed analytics page
        this.router.navigate(['/admin/analytics/event', eventId]);
      },
    });
  }

  // Summary calculation methods
  getTotalEvents(): number {
    return this.eventsSummary.length;
  }

  getTotalRegistrations(): number {
    return this.eventsSummary.reduce(
      (sum, event) => sum + event.totalRegistrations,
      0
    );
  }

  getTotalAttendees(): number {
    return this.eventsSummary.reduce(
      (sum, event) => sum + event.totalAttendees,
      0
    );
  }

  getAverageRating(): number {
    if (this.eventsSummary.length === 0) return 0;
    const totalRating = this.eventsSummary.reduce(
      (sum, event) => sum + event.averageRating,
      0
    );
    return totalRating / this.eventsSummary.length;
  }

  getAverageAttendanceRate(): number {
    if (this.eventsSummary.length === 0) return 0;
    const totalRate = this.eventsSummary.reduce(
      (sum, event) => sum + event.attendanceRate,
      0
    );
    return totalRate / this.eventsSummary.length;
  }

  // Utility methods for styling
  getAttendanceRateColor(rate: number): string {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Check if user has permission to view analytics
  canViewAnalytics(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return (
      currentUser?.role === Role.ROLE_ADMIN ||
      currentUser?.role === Role.ROLE_OD
    );
  }

  // Get dynamic header text based on user role
  getDashboardTitle(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === Role.ROLE_OD) {
      return 'My Events Analytics';
    }
    return 'Event Analytics Dashboard';
  }

  getDashboardSubtitle(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === Role.ROLE_OD) {
      return 'Monitor and analyze your organized events performance';
    }
    return 'Monitor and analyze event performance across the platform';
  }

  getEventsTableTitle(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === Role.ROLE_OD) {
      return 'My Events Analytics Overview';
    }
    return 'Event Analytics Overview';
  }
}
