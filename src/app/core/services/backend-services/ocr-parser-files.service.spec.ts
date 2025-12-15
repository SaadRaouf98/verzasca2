import { TestBed } from '@angular/core/testing';

import { OcrParserFilesService } from './ocr-parser-files.service';

describe('OcrParserFilesService', () => {
  let service: OcrParserFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OcrParserFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
