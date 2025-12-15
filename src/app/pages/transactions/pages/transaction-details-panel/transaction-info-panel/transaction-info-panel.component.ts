import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { Transaction } from '@core/models/transaction.model';

import { TransactionNumberPipe } from '@shared/pipes/transaction-number.pipe';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxPermissionsModule } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';

@Component({
  selector: 'app-transaction-info-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    CurrencyPipe,
    TransactionNumberPipe,
    MatExpansionModule,
    NgxPermissionsModule,
  ],
  templateUrl: './transaction-info-panel.component.html',
  styleUrls: ['./transaction-info-panel.component.scss'],
})
export class TransactionInfoPanelComponent implements OnInit{
  PermissionsObj = PermissionsObj;

  @Input() requestContainerDetails!: Transaction;
  @Input() lang: string = localStorage.getItem('lang') || 'ar';
ngOnInit(): void {
  }
}

