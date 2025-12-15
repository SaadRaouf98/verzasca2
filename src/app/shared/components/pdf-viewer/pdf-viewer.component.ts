import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnChanges {
  @Input() src: string | null | any = null; // accepts full URL or relative path
  @Input() defaultZoom = 1.0;

  safeSrc: SafeResourceUrl | null = null;
  page = 1;
  totalPages = 0;
  zoom = this.defaultZoom;
  loading = true;
  @Input() previewType: 'iframe' | 'viewer' = 'viewer';
  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && this.src) {
      this.loading = true;
      this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
      this.page = 1;

      // Fallback: If no load event fires within 10 seconds, assume it loaded
      setTimeout(() => {
        if (this.loading) {
          console.warn('PDF load timeout - assuming loaded');
          this.loading = false;
        }
      }, 10000);
    }
  }

  onPdfLoaded(pdf: any): void {
    this.totalPages = pdf.numPages;
    this.loading = false;
  }

  onIframeLoaded(): void {
    // For iframe mode, we set loading to false when iframe loads
    this.loading = false;
  }

  onError(error: any): void {
    console.error('PDF Load Error:', error);
    this.loading = false;
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.page++;
  }

  prevPage(): void {
    if (this.page > 1) this.page--;
  }

  zoomIn(): void {
    this.zoom += 0.1;
  }

  zoomOut(): void {
    if (this.zoom > 0.3) this.zoom -= 0.1;
  }
}
