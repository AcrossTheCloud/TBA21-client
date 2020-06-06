import { S3File } from './s3File';

export interface ItemOrCollection {
  s3_key: string;
  file_dimensions?: number[] | null;
  file: S3File;
}
