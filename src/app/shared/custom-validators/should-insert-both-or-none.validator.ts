import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

//If first control has a value ,then second control must have a value.
//If none have a value, that is okey.

export function shouldInsertBothOrNoneValidator(
  firstControlName: string,
  secondControlName: string
): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const firstControl = form.get(firstControlName) as AbstractControl;

    const secondControl = form.get(secondControlName) as AbstractControl;

    if (!firstControl.value && !secondControl.value) {
      return null;
    }

    if (firstControl.value && !secondControl.value) {
      const errorName = `${secondControlName}Required`;
      const error: any = {};
      error[errorName] = true;
      return error;
    }

    return null;
  };
}
