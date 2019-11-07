import { S3File } from './s3File';
import { itemType } from './Item';
import { collectionTypes } from './Collection';

export interface HomepageData {
  file: S3File;
  id: string;
  title: string;
  s3_key: string;
  item_subtype?: string;
  item_type: itemType;
  year_produced: string;
  time_produced: string;
  duration?: string;
  file_dimensions?: number[];
  creators?: string[];
  regions?: string[];

  // Collection specific
  count?: number;
  type?: collectionTypes | null;
  items?: HomepageData[];

  // OA Highlight specific
  concept_tags: { id: number; tag_name: string }[];
  keyword_tags: { id: number; tag_name: string }[];
}
