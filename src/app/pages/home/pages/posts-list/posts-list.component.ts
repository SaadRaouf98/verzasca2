import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, HostListener } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { VisibleNewsPost } from '@core/models/news-posts.model';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/language.service';
import { environment } from '@env/environment';
import { Post } from '@pages/home/components/home-news/home-news.component';
import { ManageHomeService } from '@pages/home/services/manage-home.service';

@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
})
export class PostsListComponent {
  latestNews: VisibleNewsPost[] = [];
  pageIndex: number = 0;
  screenWidth: number = 1200;
  pageSize: number = 20;
  length: number = 100000;
  pageEvent!: PageEvent;
  apiUrl = environment.apiUrl;
  token: string = '';
  lang: string = 'ar';
  featured: Post;

  constructor(
    private languageService: LanguageService,
    private manageHomeService: ManageHomeService,
    private authService: AuthService,
  ) {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.lang = this.languageService.language;
    this.token = this.authService.getToken();

    this.getNewsPosts();
  }

  getNewsPosts(): void {
    this.manageHomeService.latestNewsService
      .getVisibleNewsPostsList({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.latestNews = res.data;
          this.length = res.totalCount;
          this.featured = this.latestNews.length ? this.latestNews[0] : null;
        },
      });
  }

  onPaginationChange(pageInformation: {
    pageSize: number;
    pageIndex: number;
  }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.getNewsPosts();
  }


  onNavigateBack(): void {
    window.history.back();
  }

  protected readonly environment = environment;
}
