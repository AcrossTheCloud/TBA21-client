// enums as strings allows string comparisons. :)
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export interface User {
  username: string;

  status: string;
  enabled: boolean;

  email: string;
  emailVerified: boolean;

  gender: Gender | undefined;
  date_of_birth: string | undefined;

  family_name: string | undefined;
  given_names: string | undefined;

  organisation: string | undefined;
  affiliation: string | undefined;
  job_role: string | undefined;

  website: string | undefined;
  address: string | undefined;
}
