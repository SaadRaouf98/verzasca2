import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActorsRoutingModule } from './actors-routing.module';
import { ActorsListComponent } from './pages/actors-list/actors-list.component';
import { AddActorComponent } from './pages/add-actor/add-actor.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ActorsListComponent, AddActorComponent],
  imports: [CommonModule, SharedModule, ActorsRoutingModule],
})
export class ActorsModule {}
