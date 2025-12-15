import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailedRole } from '@core/models/role.model';
import { LanguageService } from '@core/services/language.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { ManagePermissionsSettingsService } from '@pages/permissions-settings/services/manage-permissions-settings.service';

import { TranslateService } from '@ngx-translate/core';
import { Permission } from '@shared/models/permission.model';
import {
  PermissionsObj,
  systemPermissionsTree,
  transactionsPermissionsTree,
  userPermissionsTree,
} from '@core/constants/permissions.constant';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.scss'],
})
export class RolePermissionsComponent implements OnInit, OnDestroy {
  roleId: string = '';
  roleData!: DetailedRole;
  lang: string = 'ar';
  disableSubmitBtn: boolean = false;

  allTransactionsPermissions: Permission[] = JSON.parse(
    JSON.stringify(transactionsPermissionsTree)
  );
  transactionsPermissionsSource: MatTableDataSource<Permission> =
    new MatTableDataSource<Permission>([]);

  allSystemPermissions: Permission[] = JSON.parse(JSON.stringify(systemPermissionsTree));
  systemPermissionsSource: MatTableDataSource<Permission> = new MatTableDataSource<Permission>([]);

  allUsersPermissions: Permission[] = JSON.parse(JSON.stringify(userPermissionsTree));
  usersPermissionsSource: MatTableDataSource<Permission> = new MatTableDataSource<Permission>([]);

  PermissionsObj = PermissionsObj;

  tablesExpandation: {
    transactionsPermissions: boolean;
    systemPermissions: boolean;
    usersPermissions: boolean;
  } = {
    transactionsPermissions: false,
    systemPermissions: false,
    usersPermissions: false,
  };

  constructor(
    private managePermissionsSettingsService: ManagePermissionsSettingsService,
    private activatedRoute: ActivatedRoute,
    private langugaeService: LanguageService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private router: Router
  ) {}

  onNavigateBack(): void {
    this.router.navigate(['../'], {
      relativeTo: this.activatedRoute,
    });
  }

  onToggleTableExpandation(tableIndex: number): void {
    const mapperObj: {
      [key: number]: keyof {
        transactionsPermissions: boolean;
        systemPermissions: boolean;
        usersPermissions: boolean;
      };
    } = {
      0: 'transactionsPermissions',
      1: 'systemPermissions',
      2: 'usersPermissions',
    };
    this.tablesExpandation[mapperObj[tableIndex]] = !this.tablesExpandation[mapperObj[tableIndex]];
  }

  ngOnDestroy(): void {
    this.allSystemPermissions = [];
    this.allTransactionsPermissions = [];
    this.allUsersPermissions = [];
  }

  ngOnInit(): void {
    this.roleId = this.activatedRoute.snapshot.params['id'];
    this.lang = this.langugaeService.language;

    if (this.roleId) {
      this.managePermissionsSettingsService.rolesService
        .getRoleById(this.roleId)
        .subscribe((res) => {
          this.roleData = res;
          this.setCheckBoxes();
          this.initializeTables();
        });
    }
  }

  setCheckBoxes(): void {
    this.roleData.permissions.forEach((permission) => {
      this.allTransactionsPermissions.forEach((outerEle) => {
        outerEle.pages?.forEach((innerEle) => {
          if (permission === innerEle.id) {
            innerEle.checked = true;
          }
        });
      });

      this.allSystemPermissions.forEach((outerEle) => {
        outerEle.pages?.forEach((innerEle) => {
          if (permission === innerEle.id) {
            innerEle.checked = true;
          }
        });
      });

      this.allUsersPermissions.forEach((outerEle) => {
        outerEle.pages?.forEach((innerEle) => {
          if (permission === innerEle.id) {
            innerEle.checked = true;
          }
        });
      });
    });

    this.allTransactionsPermissions.forEach((outerEle) => {
      outerEle.pages?.forEach((innerEle) => {
        if (!innerEle.checked) {
          outerEle.checked = false;
        }
      });
    });

    this.allSystemPermissions.forEach((outerEle) => {
      outerEle.pages?.forEach((innerEle) => {
        if (!innerEle.checked) {
          outerEle.checked = false;
        }
      });
    });

    this.allUsersPermissions.forEach((outerEle) => {
      outerEle.pages?.forEach((innerEle) => {
        if (!innerEle.checked) {
          outerEle.checked = false;
        }
      });
    });
  }

  initializeTables(): void {
    this.transactionsPermissionsSource = new MatTableDataSource(this.allTransactionsPermissions);

    this.systemPermissionsSource = new MatTableDataSource(this.allSystemPermissions);

    this.usersPermissionsSource = new MatTableDataSource(this.allUsersPermissions);
  }

  onSubmit(): void {
    this.disableSubmitBtn = true;

    this.managePermissionsSettingsService.rolesService
      .updateRole(this.roleId, this.mapDataToSend())
      .subscribe({
        next: (res) => {
          this.disableSubmitBtn = false;
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.router.navigateByUrl('/system-management/users-roles/roles');
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
  }

  private mapDataToSend(): string[] {
    const dataToSend: string[] = [];
    this.transactionsPermissionsSource.data.forEach((outerEle) => {
      outerEle.pages?.forEach((innerEle) => {
        if (innerEle.checked) {
          dataToSend.push(innerEle.id);
        }
      });
    });

    this.systemPermissionsSource.data.forEach((outerEle) => {
      outerEle.pages?.forEach((innerEle) => {
        if (innerEle.checked) {
          dataToSend.push(innerEle.id);
        }
      });
    });

    this.usersPermissionsSource.data.forEach((outerEle) => {
      outerEle.pages?.forEach((innerEle) => {
        if (innerEle.checked) {
          dataToSend.push(innerEle.id);
        }
      });
    });

    return dataToSend;
  }
}
