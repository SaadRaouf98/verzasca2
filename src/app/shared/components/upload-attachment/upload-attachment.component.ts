import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-upload-attachment',
  templateUrl: './upload-attachment.component.html',
  styleUrls: ['./upload-attachment.component.scss'],
  standalone: true,
  imports: [MatIconModule, CommonModule, TranslateModule, MatProgressBarModule],
})
export class UploadAttachmentComponent implements OnInit, OnChanges {
  private pendingUploads = 0;
  private emittedFileIds = new Set<string>(); // Track which files have been emitted
  @ViewChild('file') fileInput!: ElementRef<HTMLInputElement>;

  @Input() label: string = 'ارفع الملف';
  @Input() desc: string = 'اختر ملفاً من جهازك';
  @Input() desc2: string = 'أو اسحب الملف هنا';
  @Input() id: string = 'file';
  @Input() multiple: boolean = false;
  @Input() fileTypes: string[] = ['image/png', 'image/jpeg', 'application/pdf'];
  @Input() customFileTypes: string[] = [];
  @Input() values: any[] = [];
  @Input() backgroundColor: string = '#f5f5f5';

  @Input() maxSizeMB: number = 50;
  @Input() showBtn: boolean = true;
  @Input() split: boolean = false;
  @Input() showViewOption: boolean = false;
  @Input() uploadFirst: boolean = true;
  @Input() initialFiles: (File | { name: string; id: string })[] = [];
  @Output() fileUploaded = new EventEmitter<FormData>();
  @Output() fileRemoved = new EventEmitter<any>();
  @Output() uploadClicked = new EventEmitter<void>();
  @Output() viewAttachment = new EventEmitter<File>();
  @Output() uploadComplete = new EventEmitter<void>();

  // ✅ Hardcoded allowed extensions for all components
  private readonly allowedExtensions: string[] = [
    '.jpg',
    '.jpeg',
    '.png',
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.xls',
    '.xlsx',
    '.zip',
  ];

  uploadedFiles: { file: File | { name: string; id: string }; id: string; progress: number }[] = [];
  loading = false;
  uploadProgress = 0;
  uploadedSize = 0;
  totalSize = 0;
  fileProgressMap: Map<string, number> = new Map(); // Track progress per file ID
  private activeIntervals: Map<string, any> = new Map(); // Track active animation intervals

  // Helper method to get file size
  getFileSize(file: any): number {
    if (file instanceof File) {
      return file.size || 0;
    }
    // Handle both 'size' and 'length' properties
    return file?.size || file?.length || 0;
  }

  ngOnInit(): void {
    this.setInitialFiles(this.initialFiles);
  }
  ngOnChanges(changes: SimpleChanges): void {
    // Set initial files whenever initialFiles changes, not just on first change
    if (changes['initialFiles']?.currentValue) {
      this.setInitialFiles(changes['initialFiles']?.currentValue);
    }
  }
  setInitialFiles(initialFiles): void {
    if (initialFiles) {
      this.uploadedFiles = initialFiles.map((file: any, idx: number) => ({
        file,
        id: (file as any).id,
        progress: 100, // Initial files are already uploaded
      }));
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  constructor(private toastService: CustomToastrService, private cdr: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    // Clear all active animation intervals
    this.activeIntervals.forEach((interval) => clearInterval(interval));
    this.activeIntervals.clear();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.processFiles(Array.from(input.files));
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('drop-zoon--over');
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.processFiles(Array.from(files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('drop-zoon--over');
  }

  onDragLeave(event: DragEvent): void {
    (event.currentTarget as HTMLElement).classList.remove('drop-zoon--over');
  }

  onClickDropZone(): void {
    this.fileInput.nativeElement.click();
  }
  removeViewFile(file): void {
    const index = this.values.findIndex((f) => f.name === file.name);
    if (index !== -1) {
      this.values.splice(index, 1);

      if (file.type === 'reportFile') {
        this.fileRemoved.emit({ fileId: file.name, typeImage: true });
      }
      this.toastService.success('🗑️ تم حذف الملف بنجاح');
    }
  }

  processFiles(files: File[]): void {
    let validFiles: File[] = [];
    for (const file of files) {
      // ✅ File extension validation with dynamic extensions
      if (!this.isFileExtensionValid(file)) {
        const allowedExtensions =
          this.customFileTypes.length > 0 ? this.customFileTypes : this.allowedExtensions;
        this.toastService.warning(
          ` نوع الملف "${file.name}" غير مسموح. الأنواع المسموحة: ${allowedExtensions.join(', ')}`
        );
        continue;
      }
      // ✅ File size validation
      if (file.size > this.maxSizeMB * 1024 * 1024) {
        this.toastService.warning(
          ` حجم الملف "${file.name}" يتجاوز الحد الأقصى (${this.maxSizeMB}MB)`
        );
        continue;
      }
      // ✅ Prevent duplicate file name - check safely
      const isDuplicate = this.uploadedFiles.some((f) => {
        const existingFileName = f.file instanceof File ? f.file.name : (f.file as any)?.name;
        return existingFileName === file.name;
      });
      if (isDuplicate) {
        this.toastService.warning(` الملف "${file.name}" تم رفعه مسبقًا`);
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length === 0) return;
    this.pendingUploads = validFiles.length;
    for (const file of validFiles) {
      this.simulateUpload(file);
    }
  }

  // ✅ New method to validate file extensions
  private isFileExtensionValid(file: File): boolean {
    const fileName = file.name.toLowerCase();

    // Check if file has an extension
    if (!fileName.includes('.')) {
      return false;
    }

    // Get the file extension (including the dot)
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

    // ✅ Use customFileTypes if provided, otherwise use allowedExtensions
    const extensionsToCheck =
      this.customFileTypes.length > 0 ? this.customFileTypes : this.allowedExtensions;

    // Convert extensions to lowercase for case-insensitive comparison
    const extensionsLower = extensionsToCheck.map((ext) => ext.toLowerCase());

    return extensionsLower.includes(fileExtension);
  }

  // ✅ Keep the old method for backwards compatibility but make it use the new extension validation
  isFileTypeValid(file: File): boolean {
    // If custom file types are provided, use them (for backwards compatibility)
    if (this.customFileTypes.length > 0) {
      return this.customFileTypes.includes(file.type);
    }

    // Otherwise, use the new extension-based validation
    return this.isFileExtensionValid(file);
  }

  simulateUpload(file: File): void {
    this.loading = true;
    this.uploadProgress = 0;

    // Don't simulate progress - just wait for server response
    // Keep progress at 0 until completeUpload() is called

    const fakeId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    if (this.multiple) {
      this.uploadedFiles.push({ file, id: fakeId, progress: 0 });
    } else {
      this.uploadedFiles = [{ file, id: fakeId, progress: 0 }];
    }
    this.fileInput.nativeElement.value = '';
    this.pendingUploads--;

    if (this.pendingUploads === 0) {
      // All files ready, emit FormData to parent for API upload
      const newFiles = this.uploadedFiles.filter((f) => !this.emittedFileIds.has(f.id));
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((f, index) => {
          const fieldName = this.multiple ? `file${index}` : 'file';
          if (f.file instanceof File) {
            formData.append(fieldName, f.file, f.file.name);
          }
          // Mark this file as emitted
          this.emittedFileIds.add(f.id);
        });
        this.fileUploaded.emit(formData);
        // Now waiting for parent to call completeUpload() when API responds
      }
    }
  }

  // Call this when server response is received to smoothly animate to 100%
  // Pass the file ID to update only that file's progress
  completeUpload(fileId?: string): void {
    if (!this.uploadFirst) {
      this.uploadProgress = 100;
      this.loading = false;
      this.uploadComplete.emit();
      return;
    }

    // Validate fileId if provided
    if (fileId) {
      const fileIndex = this.uploadedFiles.findIndex((f) => f.id === fileId);
      if (fileIndex === -1) {
        return;
      }
      console.log(fileIndex);
      // If file already at 100%, skip animation
      if (this.uploadedFiles[fileIndex].progress === 100) {
        return;
      }
    }

    // Clear existing interval for this file to prevent overlaps
    const intervalKey = fileId || 'global';
    if (this.activeIntervals.has(intervalKey)) {
      clearInterval(this.activeIntervals.get(intervalKey));
      this.activeIntervals.delete(intervalKey);
    }

    // Calculate total size once if not already set
    if (this.totalSize === 0) {
      this.totalSize = this.uploadedFiles.reduce((sum, f) => sum + this.getFileSize(f.file), 0);
    }

    const startTime = Date.now();
    const animationDuration = 1000; // 1 second smooth animation

    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / animationDuration) * 100));

      if (fileId) {
        // Update specific file progress
        const fileIndex = this.uploadedFiles.findIndex((f) => f.id === fileId);
        if (fileIndex > -1) {
          this.uploadedFiles[fileIndex].progress = progress;
        }
      } else {
        // Update global progress for backward compatibility
        this.uploadProgress = progress;
      }

      // Calculate uploadedSize based on current progress (not just 100%)
      this.uploadedSize = this.uploadedFiles.reduce(
        (sum, f) => sum + (this.getFileSize(f.file) * f.progress) / 100,
        0
      );

      // Trigger change detection to update UI
      this.cdr.detectChanges();

      if (progress >= 100) {
        clearInterval(animationInterval);
        this.activeIntervals.delete(intervalKey);

        if (fileId) {
          const fileIndex = this.uploadedFiles.findIndex((f) => f.id === fileId);
          if (fileIndex > -1) {
            this.uploadedFiles[fileIndex].progress = 100;
          }
        } else {
          this.uploadProgress = 100;
        }

        // Recalculate uploadedSize to ensure accuracy
        this.uploadedSize = this.uploadedFiles
          .filter((f) => f.progress === 100)
          .reduce((sum, f) => sum + this.getFileSize(f.file), 0);

        // Check if all files are done
        const allDone = this.uploadedFiles.every((f) => f.progress === 100);
        if (allDone) {
          this.loading = false;
          this.uploadComplete.emit();
        }
      }
    }, 30); // Update every 30ms for smooth animation

    // Store interval reference for cleanup
    this.activeIntervals.set(intervalKey, animationInterval);
  }

  removeFile(event: any, id: string, index: number): void {
    event.stopPropagation();
    const removedFile = this.uploadedFiles[index];
    this.uploadedFiles.splice(index, 1);
    // Remove from emitted set if it was emitted
    this.emittedFileIds.delete(id);
    // Emit fileRemoved event with file info
    this.fileRemoved.emit(removedFile.file);

    // If all files are removed, clear the emitted files tracking for fresh upload
    if (this.uploadedFiles.length === 0) {
      this.emittedFileIds.clear();
      // Also reset the file input to allow re-selecting the same file
      this.fileInput.nativeElement.value = '';
    }

    this.emitUploadedFiles();
    this.toastService.success(' تم حذف الملف بنجاح');
  }

  emitUploadedFiles(): void {
    const newFiles = this.uploadedFiles.filter((f) => !this.emittedFileIds.has(f.id));
    if (newFiles.length > 0) {
      const formData = new FormData();
      newFiles.forEach((f, index) => {
        if (f.file instanceof File) {
          formData.append(`file${index}`, f.file, f.file.name);
        }
        this.emittedFileIds.add(f.id);
      });
      this.fileUploaded.emit(formData);
    }
    if (this.uploadedFiles.length === 0) {
      this.fileRemoved.emit();
    }
  }

  onUploadClicked(): void {
    this.uploadClicked.emit();
  }

  onViewAttachment(event: Event, file: File): void {
    event.preventDefault();
    event.stopPropagation();
    this.viewAttachment.emit(file);
  }

  // ✅ Getter to access extensions for display purposes - shows custom or default
  get formattedAllowedExtensions(): string {
    const extensionsToShow =
      this.customFileTypes && this.customFileTypes.length > 0
        ? this.customFileTypes
        : this.allowedExtensions;

    // Ensure extensionsToShow is an array
    const extensionsArray = Array.isArray(extensionsToShow) ? extensionsToShow : [extensionsToShow];

    // Remove dots from extensions
    const cleanedExtensions = extensionsArray.map((ext) => ext.replace(/\./g, ''));

    // If only one extension, return it
    if (cleanedExtensions.length === 1) {
      return cleanedExtensions[0];
    }

    // If two extensions, join with 'and'
    if (cleanedExtensions.length === 2) {
      return `${cleanedExtensions[0]} and ${cleanedExtensions[1]}`;
    }

    // If more than two, join all but last with comma, then add 'and' before last
    return (
      cleanedExtensions.slice(0, -1).join(', ') +
      ' and ' +
      cleanedExtensions[cleanedExtensions.length - 1]
    );
  }

  // ✅ Getter for display with uppercase extensions and lowercase 'and'
  get formattedAllowedExtensionsDisplay(): string {
    let formatted = this.formattedAllowedExtensions.toUpperCase();
    // Replace 'AND' back to lowercase 'and'
    return formatted.replace(/AND/g, 'and');
  }

  // ✅ Getter for file input accept attribute
  get acceptedFileTypes(): string {
    const extensionsToAccept =
      this.customFileTypes && this.customFileTypes.length > 0
        ? this.customFileTypes
        : this.allowedExtensions;

    // Ensure extensionsToAccept is an array
    const extensionsArray = Array.isArray(extensionsToAccept)
      ? extensionsToAccept
      : [extensionsToAccept];

    return extensionsArray.join(',');
  }
}
