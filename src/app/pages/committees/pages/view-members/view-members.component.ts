import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AddRelatedDepartmentComponent } from '@pages/committees/components/add-related-department/add-related-department.component';
import { FormMode } from '@shared/enums/form-mode.enum';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';

@Component({
  selector: 'app-view-members',
  templateUrl: './view-members.component.html',
  styleUrls: ['./view-members.component.scss'],
})
export class ViewMembersComponent implements OnInit {
  header = 'shared.committeeName';
  subHeader = 'CommitteesModule.ViewMembersComponent.members';
  buttonLabel = 'shared.addMember';

  element!: {
    id: string | null;
    title: string | null;
    titleEn: string | null;
    members: {
      id: string;
      name: string;
    }[];
  };

  committeeId!: string;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.committeeId = this.activatedRoute.snapshot.params['id'];
  }

  onAddRelatedDepartment(employee: any): void {
    const dialogRef = this.dialog.open(AddRelatedDepartmentComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: true,
      data: {
        formMode: FormMode.Modify,
        header:
          this.translateService.instant(
            'CommitteesModule.ViewMembersComponent.addRelatedDepartment'
          ) + `(${employee.name})`,
        employee,
        parentId: this.committeeId,
      },
    });

    dialogRef
      .afterClosed()
      .subscribe(
        (dialogResult: { statusCode: ModalStatusCode; status: string }) => {
          if (
            dialogResult &&
            dialogResult.statusCode === ModalStatusCode.Success
          ) {
            this.router.navigate([`./${employee.id}/departments`], {
              relativeTo: this.activatedRoute,
              queryParams: {
                memberName: employee.name,
              },
            });
          }
        }
      );
  }
}
