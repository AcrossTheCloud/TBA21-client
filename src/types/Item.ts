import { Tag } from 'components/admin/tables/Tags';

import { User } from './User';
import { Ocean } from './Ocean';
import { License } from './License';
import { S3Upload } from './s3Upload';

export interface Item {
  id: number;

  s3uploads_sha512: S3Upload;
  s3_key: string;

  created_at: string;
  updated_at: string;
  time_produced: string;

  status: boolean;

  concept_tags: Tag[];
  keyword_tags: Tag[];

  place: string;
  country_or_ocean: string | Ocean;

  item_type: number;

  creators: User[];
  contributor_login: string;

  directors: string[];
  writers: string[];
  collaborators: string;

  exhibited_at: string;

  series: string;
  ISBN: number;
  edition: number;
  publisher: string[];
  interviewers: string[];
  interviewees: string[];
  cast_: string;

  license: License;

  title: string;
  description: string;

  location: string;
  geojson: string;

  icon: string;

}
