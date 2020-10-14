import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideoComponent } from './video/video.component';
import { HornVedioComponent } from './horn-vedio/horn-vedio.component';
import { DoctorLandingComponent } from './doctor-landing/doctor-landing.component';

const routes: Routes = [
  // { path: 'call', component: VideoComponent },
  { path: 'horn', component: HornVedioComponent },
  { path: 'doctor', component: DoctorLandingComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
