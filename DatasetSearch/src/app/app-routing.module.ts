import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {GfbioComponent} from './gfbio/gfbio.component';
import { AuthGuard } from './guards/auth.guard';
import {BioDivComponent} from './bio-div/bio-div.component';
import {Biodiv2Component} from './biodiv2/biodiv2.component';
const routes: Routes = [
  // { path: '', component: GfbioComponent, canActivate: [AuthGuard] },

  { path: '', component: BioDivComponent },
   { path: 'biodiv1', component: BioDivComponent },
   { path: 'biodiv2', component: Biodiv2Component },
  { path: 'gfbio', component: GfbioComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
