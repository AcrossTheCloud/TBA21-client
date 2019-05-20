import { Tag } from 'components/admin/tables/Tags';
import { Position } from 'components/map/DraggableMap';
import { User } from 'types/User';
import { Ocean } from './Ocean';

// enums as strings allows string comparisons. :)
export enum Status {
  PUBLISHED = 'Published',
  UNPUBLISHED = 'Unpublished',
  DRAFT = 'Draft'
}

export interface Item {
  markerPosition: Position;

  sha512: string;
  s3_key: string;
  created_at: string;
  updated_at: string;
  time_produced: string;
  status: Status;

  exif: {
    [name: string]: string
  };

  concept_tags: Tag[];
  keyword_tags: Tag[];
  recognition_tags: Tag[];

  place: string;
  country_or_ocean: string | Ocean;
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
}
