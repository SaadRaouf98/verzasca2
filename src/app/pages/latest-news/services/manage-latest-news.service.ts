import { Injectable } from '@angular/core';
import { NewsPostsService } from '@core/services/backend-services/news-posts.service';

@Injectable({
  providedIn: 'root',
})
export class ManageLatestNewsService {
  constructor(public latestNewsService: NewsPostsService) {}
}
