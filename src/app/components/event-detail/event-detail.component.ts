import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import { AuthService } from '../../services/auth/auth.service';
import { EventService } from '../../services/events/event.service';
import { FavoritesService } from '../../services/favorites/favorites.service';
import { AgendaItem } from '../../types/models/agendaItem.model';
import { Event } from '../../types/models/event.model';
import { MapComponent } from '../od/map/map.component';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  standalone: true,
  imports: [CommonModule, MapComponent],
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  agenda: AgendaItem[] = [];
  loading = true;
  agendaLoading = false;
  error: string | null = null;
  imageError = false;
  selectedImageIndex = 0;
  showImageModal = false;

  // Toast notification state
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'info' | 'warning' | 'error' = 'info';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private favoritesService: FavoritesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(eventId);
    } else {
      this.error = 'Event ID not found';
      this.loading = false;
    }
  }

  loadEvent(eventId: string): void {
    this.loading = true;
    this.error = null;

    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
        // Load agenda after event is loaded
        this.loadAgenda(eventId);
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.error = 'Failed to load event details';
        this.loading = false;
      },
    });
  }

  loadAgenda(eventId: string): void {
    this.agendaLoading = true;

    this.eventService.getEventAgenda(eventId).subscribe({
      next: (agenda) => {
        this.agenda = agenda;
        this.agendaLoading = false;
      },
      error: (error) => {
        console.error('Error loading agenda:', error);
        this.agenda = [];
        this.agendaLoading = false;
      },
    });
  }

  onImageError(event: any): void {
    this.imageError = true;
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  openImageModal(): void {
    if (this.hasImages()) {
      this.showImageModal = true;
    }
  }

  closeImageModal(): void {
    this.showImageModal = false;
  }

  nextImage(): void {
    const imageCount = this.getImageCount();
    if (imageCount > 1) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % imageCount;
    }
  }

  previousImage(): void {
    const imageCount = this.getImageCount();
    if (imageCount > 1) {
      this.selectedImageIndex =
        this.selectedImageIndex === 0
          ? imageCount - 1
          : this.selectedImageIndex - 1;
    }
  }

  getEventDuration(): string {
    if (!this.event) return '';

    const start = new Date(this.event.startTime);
    const end = new Date(this.event.endTime);
    const diffInMs = end.getTime() - start.getTime();
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInHours / 24);
      const hours = diffInHours % 24;
      return `${days} day${days !== 1 ? 's' : ''}${
        hours > 0 ? ` ${hours} hour${hours !== 1 ? 's' : ''}` : ''
      }`;
    }
  }

  getAgendaDuration(): string {
    if (!this.agenda || this.agenda.length === 0) return '';

    const firstStart = new Date(this.agenda[0].startTime);
    const lastEnd = new Date(this.agenda[this.agenda.length - 1].endTime);
    const diffInMs = lastEnd.getTime() - firstStart.getTime();
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInHours / 24);
      const hours = diffInHours % 24;
      return `${days} day${days !== 1 ? 's' : ''}${
        hours > 0 ? ` ${hours} hour${hours !== 1 ? 's' : ''}` : ''
      }`;
    }
  }

  isEventFavorite(): boolean {
    if (!this.event || !this.isUserAuthenticated()) return false;
    return this.favoritesService.isEventFavorite(parseInt(this.event.id));
  }

  isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleFavorite(): void {
    if (!this.event) return;

    if (!this.isUserAuthenticated()) {
      // Redirect to login page or show login prompt
      this.router.navigate(['/login']);
      return;
    }

    const eventId = parseInt(this.event.id);
    if (this.isEventFavorite()) {
      this.favoritesService.removeFavoriteEvent(eventId).subscribe();
    } else {
      this.favoritesService.addFavoriteEvent(eventId).subscribe();
    }
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  shareEvent(): void {
    if (navigator.share && this.event) {
      navigator.share({
        title: this.event.name,
        text: this.event.description,
        url: window.location.href,
      });
    } else if (this.event) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        // You might want to show a toast notification here
        console.log('Event link copied to clipboard');
      });
    }
  }

  getLocationAddress(): string {
    if (!this.event || !this.event.location) {
      return 'Location not specified';
    }
    return (
      this.event.location.address ||
      `${this.event.location.lat}, ${this.event.location.lng}`
    );
  }

  // Helper methods for photo handling
  hasImages(): boolean {
    if (!this.event) return false;
    return !!(this.event.photos && this.event.photos.length > 0);
  }

  getImageUrls(): string[] {
    if (!this.event) return [];

    if (this.event.photos && this.event.photos.length > 0) {
      return this.event.photos.map((photo) => photo.tempPhotoUrl);
    }

    return [];
  }

  getImageCount(): number {
    if (!this.event) return 0;
    return this.event.photos ? this.event.photos.length : 0;
  }

  getCurrentImageUrl(): string | null {
    if (!this.event || !this.event.photos || this.event.photos.length === 0) {
      return null;
    }

    if (
      this.selectedImageIndex >= 0 &&
      this.selectedImageIndex < this.event.photos.length
    ) {
      return this.event.photos[this.selectedImageIndex].tempPhotoUrl;
    }

    return this.event.photos[0].tempPhotoUrl;
  }

  hasAgenda(): boolean {
    return !!(this.agenda && this.agenda.length > 0);
  }

  getItemDuration(item: AgendaItem): string {
    const startTime = new Date(item.startTime);
    const endTime = new Date(item.endTime);
    const duration = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    );

    if (duration < 60) {
      return `${duration} min`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${minutes}min`;
      }
    }
  }

  exportEventDetailsPDF(): void {
    if (!this.event) return;

    this.showToastMessage('🔄 Preparing event details PDF...', 'info');

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Consistent spacing system
      const spacing = {
        small: 6,
        medium: 12,
        large: 18,
        section: 25,
        header: 35,
      };

      // Helper function to check if we need a new page
      const checkNewPage = (additionalHeight: number = 20) => {
        if (yPosition + additionalHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // Helper function to add text with proper wrapping
      const addText = (
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        fontSize: number = 11
      ) => {
        pdf.setFontSize(fontSize);
        const lines = this.splitTextToFitWidth(text, maxWidth, pdf);
        lines.forEach((line, index) => {
          checkNewPage();
          pdf.text(line, x, y + index * (fontSize * 0.6));
          yPosition = Math.max(yPosition, y + index * (fontSize * 0.6));
        });
        return lines.length * (fontSize * 0.6);
      };

      // Helper function to add section header
      const addSectionHeader = (title: string) => {
        checkNewPage(40);

        // Section background
        pdf.setFillColor(248, 250, 252);
        pdf.rect(
          margin - 8,
          yPosition - 8,
          pageWidth - 2 * margin + 16,
          22,
          'F'
        );

        // Section border
        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(0.5);
        pdf.rect(margin - 8, yPosition - 8, pageWidth - 2 * margin + 16, 22);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(59, 130, 246);
        pdf.text(title, margin, yPosition + 6);

        yPosition += spacing.section;
        pdf.setTextColor(0, 0, 0);
      };

      // Title header with better spacing
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 50, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EVENT DETAILS', margin, 22);

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(this.event.name, margin, 38);

      yPosition = 65; // More space after header
      pdf.setTextColor(0, 0, 0);

      // Basic Information Section
      addSectionHeader('BASIC INFORMATION');

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);

      const basicInfo = [
        `Event Type: ${this.event.eventType?.name || 'Not specified'}`,
        `Start Date: ${new Date(this.event.startTime).toLocaleString()}`,
        `End Date: ${new Date(this.event.endTime).toLocaleString()}`,
        `Duration: ${this.getEventDuration()}`,
        `Maximum Guests: ${this.event.maxNumGuests || 'Unlimited'}`,
        `Privacy Setting: ${
          this.event.isPrivate ? 'Private Event' : 'Public Event'
        }`,
      ];

      basicInfo.forEach((info) => {
        checkNewPage();
        pdf.text(`• ${info}`, margin + 10, yPosition);
        yPosition += spacing.medium;
      });
      yPosition += spacing.large;

      // Location Section
      if (this.event.location) {
        addSectionHeader('LOCATION DETAILS');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);

        const locationText = `Address: ${this.getLocationAddress()}`;
        pdf.text(`• ${locationText}`, margin + 10, yPosition);
        yPosition += spacing.medium;

        if (this.event.location.lat && this.event.location.lng) {
          pdf.text(
            `• Coordinates: ${this.event.location.lat}, ${this.event.location.lng}`,
            margin + 10,
            yPosition
          );
          yPosition += spacing.medium;
        }

        yPosition += spacing.large;
      }

      // Description Section
      if (this.event.description) {
        addSectionHeader('EVENT DESCRIPTION');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);

        const descHeight = addText(
          this.event.description,
          margin + 10,
          yPosition,
          pageWidth - 2 * margin - 20
        );
        yPosition += descHeight + spacing.large;
      }

      // Budget Section
      if (this.event.budget && this.event.budget.length > 0) {
        addSectionHeader('BUDGET BREAKDOWN');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);

        let totalBudget = 0;
        this.event.budget.forEach((item, index) => {
          checkNewPage();
          const itemText = `${index + 1}. ${
            item.itemName
          }: $${item.cost.toFixed(2)}`;
          pdf.text(itemText, margin + 10, yPosition);
          totalBudget += item.cost;
          yPosition += spacing.medium;
        });

        yPosition += spacing.small;

        // Total with emphasis
        pdf.setFillColor(59, 130, 246);
        pdf.rect(
          margin + 5,
          yPosition - 5,
          pageWidth - 2 * margin - 10,
          18,
          'F'
        );

        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text(
          `TOTAL BUDGET: $${totalBudget.toFixed(2)}`,
          margin + 15,
          yPosition + 6
        );

        pdf.setTextColor(0, 0, 0);
        yPosition += spacing.section;
      }

      // Footer with better spacing
      checkNewPage(30);
      yPosition = Math.max(yPosition, pageHeight - 40);

      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);

      yPosition += spacing.medium;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Generated on ${new Date().toLocaleString()}`,
        margin,
        yPosition
      );
      pdf.text('Event Planner System', pageWidth - margin - 40, yPosition);

      const filename = `${this.event.name
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()}_details.pdf`;
      pdf.save(filename);

      this.showToastMessage(
        '✅ Event details PDF exported successfully!',
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

  exportEventAgendaPDF(): void {
    if (!this.event || !this.agenda || this.agenda.length === 0) return;

    this.showToastMessage('🔄 Generating agenda PDF...', 'info');

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Simple spacing system
      const spacing = {
        small: 5,
        medium: 10,
        large: 15,
        section: 20,
      };

      // Helper function to check if we need a new page
      const checkNewPage = (additionalHeight: number = 30) => {
        if (yPosition + additionalHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // Simple header
      pdf.setFillColor(59, 130, 246); // blue-500
      pdf.rect(0, 0, pageWidth, 40, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('Event Agenda', margin, 20);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(this.event.name, margin, 32);

      yPosition = 50;
      pdf.setTextColor(0, 0, 0);

      // Simple summary
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Summary', margin, yPosition);
      yPosition += spacing.medium;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`Total activities: ${this.agenda.length}`, margin, yPosition);
      yPosition += spacing.small;

      const totalDuration = this.getAgendaDuration();
      pdf.text(`Total duration: ${totalDuration}`, margin, yPosition);
      yPosition += spacing.large;

      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += spacing.section;

      // Simple agenda items
      this.agenda.forEach((item, index) => {
        checkNewPage(50);

        // Item number and title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(59, 130, 246); // blue-500
        pdf.text(`${index + 1}. ${item.title}`, margin, yPosition);
        yPosition += spacing.medium;

        // Time info
        const itemStartTime = new Date(item.startTime);
        const itemEndTime = new Date(item.endTime);
        const timeStr = itemStartTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const endTimeStr = itemEndTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const duration = this.getItemDuration(item);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99); // gray-600

        pdf.text(
          `Time: ${timeStr} - ${endTimeStr} (${duration})`,
          margin + 10,
          yPosition
        );
        yPosition += spacing.small;

        // Location
        if (item.location) {
          pdf.text(`Location: ${item.location}`, margin + 10, yPosition);
          yPosition += spacing.small;
        }

        // Description
        if (item.description) {
          pdf.text('Description:', margin + 10, yPosition);
          yPosition += spacing.small;

          // Split description into lines
          const maxWidth = pageWidth - margin - 30;
          const lines = this.splitTextToFitWidth(
            item.description,
            maxWidth,
            pdf
          );

          lines.forEach((line) => {
            checkNewPage();
            pdf.text(line, margin + 15, yPosition);
            yPosition += spacing.small;
          });
        }

        yPosition += spacing.medium;

        // Light separator between items (except last)
        if (index < this.agenda.length - 1) {
          pdf.setDrawColor(240, 240, 240);
          pdf.setLineWidth(0.3);
          pdf.line(margin + 10, yPosition, pageWidth - margin, yPosition);
          yPosition += spacing.medium;
        }
      });

      // Simple footer
      yPosition = Math.max(yPosition + spacing.section, pageHeight - 30);

      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += spacing.small;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);

      const generatedText = `Generated on ${new Date().toLocaleDateString(
        'en-US'
      )}`;
      pdf.text(generatedText, margin, yPosition);

      // Page numbers
      const pageCount = (pdf as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin - 25,
          pageHeight - 10
        );
      }

      const filename = `${this.event.name
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()}_agenda.pdf`;
      pdf.save(filename);

      this.showToastMessage('✅ Agenda PDF exported successfully!', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      this.showToastMessage(
        '❌ Error exporting PDF. Please try again.',
        'error'
      );
    }
  }

  private splitTextToFitWidth(
    text: string,
    maxWidth: number,
    pdf: jsPDF
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = pdf.getTextWidth(testLine);

      if (textWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
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
}
