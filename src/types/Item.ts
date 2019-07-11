import { Tag } from 'components/admin/tables/utils/Tags';

import { User } from './User';
import { Ocean } from './Ocean';
import { License } from './License';

export interface Item {
  count: number;

  s3_key: string;
  sha512: string | null;

  exif: {  [name: string]: any } | null; // tslint:disable-line: no-any
  machine_recognition_tags: { [name: string]: any } | null; // tslint:disable-line: no-any

  md5: string | null;
  image_hash: string | null;

  created_at: string;
  updated_at: string;
  time_produced: string | null;

  status: boolean | null;

  concept_tags: Tag[] | null;
  keyword_tags: Tag[] | null;

  aggregated_concept_tags?: Tag[] | null;
  aggregated_keyword_tags?: Tag[] | null;

  place: string | null;
  country_or_ocean: string | Ocean | null;

  item_type: number | null;

  creators: User[] | null;
  contributor: string | null;

  directors: string[] | null;
  writers: string[] | null;
  collaborators: string | null;

  exhibited_at: string | null;

  series: string | null;
  isbn: number | null;
  edition: number | null;
  publisher: string[] | null;
  interviewers: string[] | null;
  interviewees: string[] | null;
  cast_: string | null;

  license: License | null;

  title: string | null;
  description: string | null;

  map_icon: string | null;

  location: string | null;
  geojson: string | null;

}
