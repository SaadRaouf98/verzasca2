import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotesListComponent } from './pages/notes-list/notes-list.component';
import { NoteFileViewerComponent } from './pages/note-file-viewer/note-file-viewer.component';
import { NoteDetailsComponent } from './pages/note-details/note-details.component';

const routes: Routes = [
  {
    path: '',
    component: NotesListComponent,
  },
  {
    path: ':id',
    component: NoteDetailsComponent,
  },
  {
    path: ':id/file',
    component: NoteFileViewerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageNotesRoutingModule {}
