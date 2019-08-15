export interface SelectObject {
  label: string;
  value: string;
  isDisabled?: boolean;
}

export const createOption = (label: string, isDisabled?: boolean): SelectObject => ({
  label,
  value: label,
  isDisabled: !!isDisabled,
});
