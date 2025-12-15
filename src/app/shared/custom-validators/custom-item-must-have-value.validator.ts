import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function CustomItemMustHaveValueValidator(
  questionnedControlName: string,
  secondControlName: string,
  secondControlQuestionnedValue: any
): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    /* if (form) {
    } */
    const questionnedControl = form.get(
      questionnedControlName
    ) as AbstractControl;
    const secondControl = form.get(secondControlName) as AbstractControl;
    if (
      secondControl.value === secondControlQuestionnedValue &&
      !hasValue(questionnedControl.value)
    ) {
      const errorName = `${questionnedControlName}Required`;
      const error: any = {};
      error[errorName] = true;
      return error;
    }

    return null;
  };
}

const hasValue = (obj: any) => {
  if (typeof obj === 'string' && !obj.length) {
    return false;
  }

  if (Array.isArray(obj) && !obj.length) {
    return false;
  }

  if (typeof obj === 'object' && !obj) {
    return false;
  }
  return true;
};

