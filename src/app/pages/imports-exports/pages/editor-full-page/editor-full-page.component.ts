import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editor-full-page',
  templateUrl: './editor-full-page.component.html',
  styleUrls: ['./editor-full-page.component.scss'],
})
export class EditorFullPageComponent {
  fileId: string = '';

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.fileId = this.activatedRoute.snapshot.params['fileId'];
  }
}
