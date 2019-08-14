export interface SelectObject {
  label: string;
  value: string;
}

export const createOption = (label: string): SelectObject => ({
  label,
  value: label,
});
