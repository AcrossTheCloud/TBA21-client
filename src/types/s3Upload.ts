export interface S3Upload {
  ID_sha512: string;
  all_s3_keys: string;
  created_at: string;
  updated_at: string;
  exif: {
    [name: string]: any // tslint:disable-line: no-any
  };
  machine_recognition_tags: string[];
  md5: string;
  image_hash: string;
}
