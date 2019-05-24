import { Tag } from 'components/admin/tables/Tags';
import { Ocean } from './Ocean';
import { User } from './User';
import { LeafletGeoJSON } from './Map';

export interface Collection {
  id: string;
  s3_prefix: string;
  created_at: string;
  updated_at: string;
  time_produced: string;
  status: boolean;
  concept_tags: Tag[];
  keyword_tags: Tag[];
  recognition_tags: Tag[];
  place: string;
  country_or_ocean: string | Ocean;
  creators: User[];
  contributor_login: string;
  directors: string;
  writers: string;
  collaborators: string;
  exhibited_at: string;
  series: string;
  ISBN: string;
  edition: string;
  publisher: string;
  interviewer: string;
  interviewee: string;
  cast_: string;

  the_geom: LeafletGeoJSON;

  title: string;
  description: string;

}
