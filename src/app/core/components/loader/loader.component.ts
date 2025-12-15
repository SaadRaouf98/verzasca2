import { Component, OnInit } from '@angular/core';
import { PageLoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {
  isLoading!: boolean;

  constructor(private pageLoaderService: PageLoaderService) {}

  ngOnInit(): void {
    this.pageLoaderService.isLoading.subscribe((data) => {
      this.isLoading = data;
    });
  }
}
