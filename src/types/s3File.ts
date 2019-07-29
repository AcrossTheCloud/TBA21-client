export interface S3File {
  url?: string;
  type: string;
  item_type: 'Video' | 'Text' | 'Audio' | 'Image'; // ENUM from SQL
}
