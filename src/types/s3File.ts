
interface Thumbnails {
  540?: string;
  720?: string;
  960?: string;
  1140?: string;
}

export interface S3File {
  url: string;
  type: FileTypes;
  body?: string;
  thumbnails?: Thumbnails;
  poster?: string;
  playlist?: string;
}

export enum FileTypes {
  'video' = 'video',
  'text' = 'text',
  'audio' = 'audio',
  'image' = 'image',
  'pdf' = 'pdf',
  'downloadText' = 'downloadText'
}
