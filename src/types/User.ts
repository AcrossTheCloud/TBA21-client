// enums as strings allows string comparisons. :)
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

// We have to have most of these optional, We don't know what we're getting back from AWS
// Search for USER-E1 to see where.
export interface User extends UserAttributes {
  username?: string | undefined;
  enabled?: boolean | undefined;

  status?: string | undefined;
}

export interface UserAttributes {
  email?: string | undefined;
  email_verified?: boolean | undefined;

  gender?: Gender | undefined;
  date_of_birth?: string | undefined;

  family_name?: string | undefined;
  given_names?: string | undefined;

  organisation?: string | undefined;
  affiliation?: string | undefined;
  job_role?: string | undefined;

  website?: string | undefined;
  address?: string | undefined;
}
