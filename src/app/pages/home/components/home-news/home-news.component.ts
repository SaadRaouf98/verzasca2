// home-news.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { environment } from '@env/environment';

// post.model.ts
export interface Post {
  /** UUID */
  id: string;
  /** عنوان الخبر أو المنشور */
  title: string;
  /** تعريف موجز إن وجد */
  definition: string | null;
  /** المحتوى الكامل بصيغة HTML */
  content: string;
  /** مسار الصورة في assets أو API */
  imagePath: string;
  createdOn: string;
}

@Component({
  selector: 'app-home-news',
  templateUrl: './home-news.component.html',
  styleUrls: ['./home-news.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNewsComponent {
  @Input() posts: Post[] = [];
  token: string = '';
  constructor(private authService: AuthService) {}
  ngOnInit() {
    this.token = this.authService.getToken();
  }
  /** featured = first post */
  get featured(): Post | null {
    return this.posts.length ? this.posts[0] : null;
  }
  /** next two posts */
  get others(): Post[] {
    return this.posts.slice(1, 4);
  }

  protected readonly environment = environment;
}
