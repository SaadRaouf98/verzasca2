import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from '@shared/models/permission.model';
import {
  PermissionsObj,
  systemPermissionsTree,
  transactionsPermissionsTree,
  userPermissionsTree,
} from '@core/constants/permissions.constant';
import { ManageUsersService } from '@pages/users/services/manage-users.service';
import { UserPermissions } from '@core/models/user.model';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-user-permissions',
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.scss'],
})
export class UserPermissionsComponent {
  userId: string = '';
  userData!: UserPermissions;
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
    private manageUsersService: ManageUsersService,
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
    this.userId = this.activatedRoute.snapshot.params['id'];
    this.lang = this.langugaeService.language;

    if (this.userId) {
      this.manageUsersService.usersService.getUserPermissionsById(this.userId).subscribe((res) => {
        this.userData = res;
        this.setCheckBoxes();
        this.initializeTables();
      });
    }
  }

  setCheckBoxes(): void {
    this.userData.permissions.forEach((permission) => {
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

    this.manageUsersService.usersService
      .updateUserPermissions(this.userId, this.mapDataToSend())
      .subscribe({
        next: (res) => {
          this.disableSubmitBtn = false;
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.router.navigateByUrl('/system-management/users-roles/users');
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
