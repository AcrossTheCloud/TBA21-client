import { APITag } from './Item';

import { User } from './User';
import { Ocean } from './Ocean';
import { License } from './License';

export interface Collection {
  id: string;

  s3_prefix: string;

  created_at: string;
  updated_at: string;
  time_produced: string;

  status: boolean;

  concept_tags: APITag[];
  keyword_tags: APITag[];

  place: string;
  country_or_ocean: string | Ocean;

  item_type: number;

  creators: User[];
  contributor: string;

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

  geom: string;
  geojson: string;
}
