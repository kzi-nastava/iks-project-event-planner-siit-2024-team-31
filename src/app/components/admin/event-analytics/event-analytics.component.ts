import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import { AnalyticsService } from '../../../services/analytics/analytics.service';
import { EventAnalytics } from '../../../types/models/analytics.model';

Chart.register(...registerables);

@Component({
  selector: 'app-event-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-analytics.component.html',
  styleUrl: './event-analytics.component.scss',
})
export class EventAnalyticsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('attendanceChart')
  attendanceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ratingsChart') ratingsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ageChart') ageChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('registrationChart')
  registrationChartRef!: ElementRef<HTMLCanvasElement>;

  analytics: EventAnalytics | null = null;
  loading = true;
  error: string | null = null;
  eventId: number = 0;

  private attendanceChart: Chart | null = null;
  private ratingsChart: Chart | null = null;
  private ageChart: Chart | null = null;
  private registrationChart: Chart | null = null;

  // Toast notification properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'info' | 'warning' | 'error' = 'info';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.eventId = +params['id'];
      this.loadAnalyticsData();
    });
  }

  ngAfterViewInit(): void {
    // Charts will be created after data is loaded
  }

  loadAnalyticsData(): void {
    this.loading = true;
    this.error = null;

    // For now, use mock data for development
    // In production, replace with actual API call
    try {
      this.analytics = this.analyticsService.generateMockEventAnalytics(
        this.eventId
      );
      this.loading = false;

      // Create charts after data is loaded
      setTimeout(() => {
        this.createCharts();
      }, 100);
    } catch (err) {
      this.error = 'Failed to load analytics data';
      this.loading = false;
      console.error('Error loading analytics:', err);
    }

    // Uncomment this when backend is ready:
    /*
    this.analyticsService.getEventAnalytics(this.eventId).subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
        setTimeout(() => {
          this.createCharts();
        }, 100);
      },
      error: (err) => {
        this.error = 'Failed to load analytics data';
        this.loading = false;
        console.error('Error loading analytics:', err);
      }
    });
    */
  }

  refreshData(): void {
    this.destroyCharts();
    this.loadAnalyticsData();
  }

  goBack(): void {
    this.router.navigate(['/admin/analytics']);
  }

  createCharts(): void {
    if (!this.analytics) return;

    this.createAttendanceChart();
    this.createRatingsChart();
    this.createAgeChart();
    this.createRegistrationChart();
  }

  private createAttendanceChart(): void {
    if (!this.analytics || !this.attendanceChartRef) return;

    const ctx = this.attendanceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.attendanceChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Attended', 'No Show'],
        datasets: [
          {
            data: [
              this.analytics.attendance.attended,
              this.analytics.attendance.noShow,
            ],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
        },
      },
    });
  }

  private createRatingsChart(): void {
    if (!this.analytics || !this.ratingsChartRef) return;

    const ctx = this.ratingsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.ratingsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.analytics.ratings.ratingDistribution.map(
          (r) => `${r.rating} Stars`
        ),
        datasets: [
          {
            label: 'Number of Ratings',
            data: this.analytics.ratings.ratingDistribution.map((r) => r.count),
            backgroundColor: '#fbbf24',
            borderColor: '#f59e0b',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  private createAgeChart(): void {
    if (!this.analytics || !this.ageChartRef) return;

    const ctx = this.ageChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.ageChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.analytics.demographics.ageGroups.map((g) => g.ageRange),
        datasets: [
          {
            data: this.analytics.demographics.ageGroups.map((g) => g.count),
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6',
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
            },
          },
        },
      },
    });
  }

  private createRegistrationChart(): void {
    if (!this.analytics || !this.registrationChartRef) return;

    const ctx = this.registrationChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.registrationChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.analytics.registrationTrend.map((t) =>
          new Date(t.date).toLocaleDateString()
        ),
        datasets: [
          {
            label: 'Daily Registrations',
            data: this.analytics.registrationTrend.map((t) => t.registrations),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3,
          },
          {
            label: 'Cumulative Registrations',
            data: this.analytics.registrationTrend.map(
              (t) => t.cumulativeRegistrations
            ),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  private destroyCharts(): void {
    if (this.attendanceChart) {
      this.attendanceChart.destroy();
      this.attendanceChart = null;
    }
    if (this.ratingsChart) {
      this.ratingsChart.destroy();
      this.ratingsChart = null;
    }
    if (this.ageChart) {
      this.ageChart.destroy();
      this.ageChart = null;
    }
    if (this.registrationChart) {
      this.registrationChart.destroy();
      this.registrationChart = null;
    }
  }

  exportAnalyticsReportPDF(): void {
    if (!this.analytics) return;

    this.showToastMessage('🔄 Generating analytics PDF report...', 'info');

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Header
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 50, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.text('Event Analytics Report', margin, 25);

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(this.analytics.eventName, margin, 38);

      yPosition = 65;
      pdf.setTextColor(0, 0, 0);

      // Key Metrics Section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Key Metrics', margin, yPosition);
      yPosition += 15;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);

      const metrics = [
        `Total Registered: ${this.analytics.attendance.registered}`,
        `Total Attended: ${this.analytics.attendance.attended}`,
        `Attendance Rate: ${this.analytics.attendance.attendanceRate}%`,
        `Average Rating: ${this.analytics.ratings.averageRating}/5.0`,
        `Total Ratings: ${this.analytics.ratings.totalRatings}`,
      ];

      metrics.forEach((metric) => {
        pdf.text(metric, margin, yPosition);
        yPosition += 10;
      });

      yPosition += 10;

      // Attendance Breakdown
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Attendance Breakdown', margin, yPosition);
      yPosition += 15;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(
        `• Registered: ${this.analytics.attendance.registered} participants`,
        margin + 5,
        yPosition
      );
      yPosition += 8;
      pdf.text(
        `• Attended: ${this.analytics.attendance.attended} participants`,
        margin + 5,
        yPosition
      );
      yPosition += 8;
      pdf.text(
        `• No Show: ${this.analytics.attendance.noShow} participants`,
        margin + 5,
        yPosition
      );
      yPosition += 15;

      // Rating Distribution
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Rating Distribution', margin, yPosition);
      yPosition += 15;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      this.analytics.ratings.ratingDistribution.forEach((rating) => {
        pdf.text(
          `• ${rating.rating} Stars: ${
            rating.count
          } ratings (${rating.percentage.toFixed(1)}%)`,
          margin + 5,
          yPosition
        );
        yPosition += 8;
      });

      yPosition += 10;

      // Demographics
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Demographics', margin, yPosition);
      yPosition += 15;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text('Age Groups:', margin + 5, yPosition);
      yPosition += 8;

      this.analytics.demographics.ageGroups.forEach((group) => {
        pdf.text(
          `  • ${group.ageRange}: ${group.count} (${group.percentage.toFixed(
            1
          )}%)`,
          margin + 10,
          yPosition
        );
        yPosition += 7;
      });

      yPosition += 5;
      pdf.text('Location Distribution:', margin + 5, yPosition);
      yPosition += 8;

      this.analytics.demographics.locationDistribution.forEach((location) => {
        pdf.text(
          `  • ${location.location}: ${
            location.count
          } (${location.percentage.toFixed(1)}%)`,
          margin + 10,
          yPosition
        );
        yPosition += 7;
      });

      // Footer
      yPosition = pageHeight - 30;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString('en-US')}`,
        margin,
        yPosition
      );
      pdf.text('Event Analytics System', pageWidth - margin - 40, yPosition);

      const filename = `${this.analytics.eventName
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()}_analytics_report.pdf`;
      pdf.save(filename);

      this.showToastMessage(
        '✅ Analytics report exported successfully!',
        'success'
      );
    } catch (error) {
      console.error('PDF export error:', error);
      this.showToastMessage(
        '❌ Error exporting PDF. Please try again.',
        'error'
      );
    }
  }

  // Toast notification methods
  showToastMessage(
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Auto hide after 3 seconds
    setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  hideToast(): void {
    this.showToast = false;
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }
}
