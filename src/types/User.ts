export interface User {
  username: string;

  status: string;
  enabled: boolean;

  email: string;
  emailVerified: boolean;

  gender: string | undefined;
  date_of_birth: string | undefined;

  family_name: string | undefined;
  given_names: string | undefined;

  organisation: string | undefined;
  affiliation: string | undefined;
  job_role: string | undefined;

  website: string | undefined;
  address: string | undefined;
}
