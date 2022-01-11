import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from './sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BoardModule } from '../board/board.module';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SidenavComponent],
  imports: [CommonModule, MatSidenavModule, BoardModule, MatListModule,MatButtonModule],
  exports: [SidenavComponent],
})
export class SidenavModule {}
