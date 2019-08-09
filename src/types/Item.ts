import { User } from './User';
import { License } from './License';
import { S3File } from './s3File';
import { Languages } from './Languages';
import { Countries } from './Countries';
import { Ocean } from './Ocean';

export interface APITag {
  id: number;
  tag_name: string;
}

enum itemType {
  Video = 'Video',
  Text = 'Text',
  Audio = 'Audio',
  Image = 'Image'
}

export enum itemText {
  Academic_Publication = 'Academic Publication',
  Article = 'Article',
  News = 'News',
  Policy_Paper = 'Policy Paper',
  Report = 'Report',
  Book = 'Book',
  Essay = 'Essay',
  Historical_Text = 'Historical Text',
  Event_Press = 'Event Press',
  Toolkit = 'Toolkit',
  Other = 'Other'
}
export enum itemVideo {
  Movie = 'Movie',
  Documentary = 'Documentary',
  Research = 'Research',
  Interview = 'Interview',
  Art = 'Art',
  News_Journalism = 'News / Journalism',
  Event_Recording = 'Event Recording',
  Informational_Video = 'Informational Video',
  Trailer = 'Trailer',
  Artwork_Documentation = 'Artwork Documentation',
  Raw_Footage = 'Raw Footage',
  Other = 'Other'
}
export enum itemImage {
  Photograph = 'Photograph',
  Research = 'Research',
  Digital_Art = 'Digital Art',
  Graphics = 'Graphics',
  Map = 'Map',
  Film_Still = 'Film Still',
  Sculpture = 'Sculpture',
  Painting = 'Painting',
  Illustration = 'Illustration',
  Artwork_Documentation = 'Artwork Documentation',
  Other = 'Other'
}
export enum itemAudio {
  Field_Recording = 'Field Recording',
  Sound_Art = 'Sound Art',
  Music = 'Music',
  Podcast = 'Podcast',
  Lecture = 'Lecture',
  Interview = 'Interview',
  Radio = 'Radio',
  Performance_Poetry = 'Performance Poetry',
  Other = 'Other'
}

export interface Item {
  file: S3File;
  count?: number;

  exif: {  [name: string]: any } | null; // tslint:disable-line: no-any
  machine_recognition_tags: { [name: string]: any } | null; // tslint:disable-line: no-any

  id: string;
  s3_key: string;

  sha512: string | null;
  md5: string | null;

  image_hash: string | null;
  created_at: string | null;

  updated_at: string | null;
  time_produced: string | null;

  status: boolean | null;

  concept_tags: number[] | null;
  keyword_tags: number[] | null;
  aggregated_concept_tags: APITag[] | null;
  aggregated_keyword_tags: APITag[] | null;

  place: string[] | null;
  country_or_ocean: Countries | Ocean | null;

  item_type: itemType;

  item_subtype: itemAudio | itemImage | itemText | itemVideo;
  creators:  User[] | null;

  contributor: string | null;
  directors: string[] | null;

  writers: string[] | null;
  editor: string | null;

  featured_in: string | null;
  collaborators: string[] | null;

  exhibited_at: string[] | null;
  series: number | null;

  isbn: string[] | null;
  related_isbn: string[] | null;
  doi: number | null;
  url: string | null;

  edition: number | null;
  first_edition: number | null;
  first_edition_year: number | null;
  year_produced: string | null;

  produced_by: string[] | null;
  participants: string[] | null;

  volume: number | null;
  issue: number | null;

  pages: number | null;
  city_of_publication: string | null;

  disciplinary_field: string | null;
  publisher: string[] | null;

  interviewers: string[] | null;
  interviewees: string[] | null;

  cast_: string[] | null; // should be an array, need to change in schema
  license: License | null;

  title: string | null;
  in_title: string | null;
  subtitle: string | null;

  description: string | null;
  map_icon: string | null;

  focus_arts: number | null;
  focus_action: number | null;
  focus_scitech: number | null;

  article_link: string | null;

  translated_from: string | null;
  language: Languages | null;

  birth_date: string | null;
  death_date: string | null;

  venues: string[] | null;
  screened_at: string | null;

  genre: string | null;
  news_outlet: string | null;

  host: string[] | null;
  curator: string | null;
  institution: string | null;
  medium: string | null;

  dimensions: string | null;
  recording_technique: string | null;

  original_sound_credit: string | null;
  record_label: string | null;

  series_name: string | null;
  episode_name: string | null;

  episode_number: number | null;
  recording_name: string | null;

  speakers: string[] | null;
  performers: string[] | null;

  host_organisation: string[] | null;
  organisation: string[] | null;
  radio_station: string[] | null;

  other_metadata: string | null;
  item_name: string | null;

  original_title: string | null;
  related_event: string | null;

  volume_in_series: string[] | null;

  oa_highlight: boolean | null;
  tba21_material: boolean | null;

  oa_original: boolean | null;
  lecturer: string | null;

  authors: string[] | null;
  credit: string | null;

  copyright_holder: string | null;
  copyright_country: string | null;

  created_for: string | null;
  duration: number | null;

  interface: string | null;
  document_code: string | null;

  project: string | null;
  related_project: string | null;
  journal: string | null;

  projection: string | null;

  event_title: string | null;
  recording_studio: string | null;

  original_text_credit: string | null;
  location: string | null;
}
