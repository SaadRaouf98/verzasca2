import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function CustomAtLeastOneItemSelectedValidator(
  firstControlName: string,
  secondControlName: string,
  thirdControlName: string
): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const firstControl = form.get(firstControlName) as AbstractControl;
    const secondControl = form.get(secondControlName) as AbstractControl;
    const thirdControl = form.get(thirdControlName) as AbstractControl;
    if (
      firstControl &&
      firstControl.value?.length === 0 &&
      secondControl &&
      secondControl.value?.length === 0 &&
      thirdControl &&
      thirdControl.value?.length === 0
    ) {
      return { atleastOneRequired: true };
    }

    return null;
  };
}
