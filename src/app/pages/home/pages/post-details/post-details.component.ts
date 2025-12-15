import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsPostsService } from '@core/services/backend-services/news-posts.service';
import { Location } from '@angular/common';
import { LanguageService } from '@core/services/language.service';
import { environment } from '@env/environment';
import { AuthService } from '@core/services/auth/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PostDetailsComponent {
  elementId: string = '';
  postDetails!: {
    id: string;
    title: string;
    definition: string;
    content: SafeHtml;
    imagePath: string;
    isVisible: boolean;
    creator: string;
  };
  apiUrl = environment.apiUrl;
  token: string = '';

  lang: string = 'ar';

  constructor(
    private activatedRoute: ActivatedRoute,
    private newsPostsService: NewsPostsService,
    private location: Location,
    private languageService: LanguageService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.elementId = this.activatedRoute.snapshot.params['id'];
    this.lang = this.languageService.language;
    this.token = this.authService.getToken();

    this.getPostDetails();
  }

  getPostDetails(): void {
    this.newsPostsService.getNewsPostById(this.elementId).subscribe({
      next: (res) => {
        this.postDetails = res;
        this.postDetails.content = this.sanitizer.bypassSecurityTrustHtml(
          res.content
        );
      },
    });
  }

  onNavigateBack(): void {
    this.location.back();
  }
}
