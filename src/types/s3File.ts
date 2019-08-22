export interface S3File {
  url: string;
  type: FileTypes;
  body?: string;
}

export enum FileTypes {
  'video' = 'video',
  'text' = 'text',
  'audio' = 'audio',
  'image' = 'image',
  'pdf' = 'pdf',
  'downloadText' = 'downloadText'
}
