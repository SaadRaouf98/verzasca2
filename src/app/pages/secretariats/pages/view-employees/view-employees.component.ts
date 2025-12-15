import { Component } from '@angular/core';

@Component({
  selector: 'app-view-employees',
  templateUrl: './view-employees.component.html',
  styleUrls: ['./view-employees.component.scss'],
})
export class ViewEmployeesComponent {
  header = 'SecretarialModule.ViewEmployeesComponent.departmentName';
  subHeader = 'SecretarialModule.ViewEmployeesComponent.employees';
  buttonLabel = 'SecretarialModule.ViewEmployeesComponent.addEmployee';

  element!: {
    id: string | null;
    title: string | null;
    titleEn: string | null;
    members: {
      id: string;
      name: string;
    }[];
  };

  elementId!: string;
}
