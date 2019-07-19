import { User } from './User';

enum profileType {
  Individual = 'Individual',
  Collective = 'Collective',
  Institution = 'Institution'
}

export interface Profile {
  id: string;
  contributors: User[] | null;
  profile_image: string | null;
  featured_image: string | null;
  full_name: string | null;
  city: string | null;
  country: string | null;
  biography: string | null;
  website: string | null;
  social_media: string[] | null;
  public_profile: boolean;
  affiliation: string | null;
  position: string | null;
  contact_person: string | null;
  contact_position: string | null;
  contact_email: string | null;
  profile: profileType;
}