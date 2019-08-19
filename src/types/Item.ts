import { License } from './License';
import { S3File } from './s3File';
import { Languages } from './Languages';

export enum Regions {
  ATLANTIC = 'Atlantic Ocean',
  ARCTIC = 'Arctic Ocean',
  INDIAN = 'Indian Ocean',
  PACIFIC = 'Pacific Ocean',
  SOUTHERN = 'Southern Ocean',
  AF = 'Afghanistan',
  AX = '\u00c5land Islands',
  AL = 'Albania',
  DZ = 'Algeria',
  AS = 'American Samoa',
  AD = 'Andorra',
  AO = 'Angola',
  AI = 'Anguilla',
  AQ = 'Antarctica',
  AG = 'Antigua and Barbuda',
  AR = 'Argentina',
  AM = 'Armenia',
  AW = 'Aruba',
  AU = 'Australia',
  AT = 'Austria',
  AZ = 'Azerbaijan',
  BS = 'Bahamas',
  BH = 'Bahrain',
  BD = 'Bangladesh',
  BB = 'Barbados',
  BY = 'Belarus',
  BE = 'Belgium',
  BZ = 'Belize',
  BJ = 'Benin',
  BM = 'Bermuda',
  BT = 'Bhutan',
  BO = 'Bolivia, Plurinational State of',
  BQ = 'Bonaire, Sint Eustatius and Saba',
  BA = 'Bosnia and Herzegovina',
  BW = 'Botswana',
  BV = 'Bouvet Island',
  BR = 'Brazil',
  IO = 'British Indian Ocean Territory',
  BN = 'Brunei Darussalam',
  BG = 'Bulgaria',
  BF = 'Burkina Faso',
  BI = 'Burundi',
  KH = 'Cambodia',
  CM = 'Cameroon',
  CA = 'Canada',
  CV = 'Cape Verde',
  KY = 'Cayman Islands',
  CF = 'Central African Republic',
  TD = 'Chad',
  CL = 'Chile',
  CN = 'China',
  CX = 'Christmas Island',
  CC = 'Cocos (Keeling) Islands',
  CO = 'Colombia',
  KM = 'Comoros',
  CG = 'Congo',
  CD = 'Congo, the Democratic Republic of the',
  CK = 'Cook Islands',
  CR = 'Costa Rica',
  CI = 'C\u00f4te d\'Ivoire',
  HR = 'Croatia',
  CU = 'Cuba',
  CW = 'Cura\u00e7ao',
  CY = 'Cyprus',
  CZ = 'Czech Republic',
  DK = 'Denmark',
  DJ = 'Djibouti',
  DM = 'Dominica',
  DO = 'Dominican Republic',
  EC = 'Ecuador',
  EG = 'Egypt',
  SV = 'El Salvador',
  GQ = 'Equatorial Guinea',
  ER = 'Eritrea',
  EE = 'Estonia',
  ET = 'Ethiopia',
  FK = 'Falkland Islands (Malvinas)',
  FO = 'Faroe Islands',
  FJ = 'Fiji',
  FI = 'Finland',
  FR = 'France',
  GF = 'French Guiana',
  PF = 'French Polynesia',
  TF = 'French Southern Territories',
  GA = 'Gabon',
  GM = 'Gambia',
  GE = 'Georgia',
  DE = 'Germany',
  GH = 'Ghana',
  GI = 'Gibraltar',
  GR = 'Greece',
  GL = 'Greenland',
  GD = 'Grenada',
  GP = 'Guadeloupe',
  GU = 'Guam',
  GT = 'Guatemala',
  GG = 'Guernsey',
  GN = 'Guinea',
  GW = 'Guinea-Bissau',
  GY = 'Guyana',
  HT = 'Haiti',
  HM = 'Heard Island and McDonald Islands',
  VA = 'Holy See (Vatican City State)',
  HN = 'Honduras',
  HK = 'Hong Kong',
  HU = 'Hungary',
  IS = 'Iceland',
  IN = 'India',
  ID = 'Indonesia',
  IR = 'Iran, Islamic Republic of',
  IQ = 'Iraq',
  IE = 'Ireland',
  IM = 'Isle of Man',
  IL = 'Israel',
  IT = 'Italy',
  JM = 'Jamaica',
  JP = 'Japan',
  JE = 'Jersey',
  JO = 'Jordan',
  KZ = 'Kazakhstan',
  KE = 'Kenya',
  KI = 'Kiribati',
  KP = 'Korea, Democratic People\'s Republic of',
  KR = 'Korea, Republic of',
  KW = 'Kuwait',
  KG = 'Kyrgyzstan',
  LA = 'Lao People\'s Democratic Republic',
  LV = 'Latvia',
  LB = 'Lebanon',
  LS = 'Lesotho',
  LR = 'Liberia',
  LY = 'Libya',
  LI = 'Liechtenstein',
  LT = 'Lithuania',
  LU = 'Luxembourg',
  MO = 'Macao',
  MK = 'Macedonia, the Former Yugoslav Republic of',
  MG = 'Madagascar',
  MW = 'Malawi',
  MY = 'Malaysia',
  MV = 'Maldives',
  ML = 'Mali',
  MT = 'Malta',
  MH = 'Marshall Islands',
  MQ = 'Martinique',
  MR = 'Mauritania',
  MU = 'Mauritius',
  YT = 'Mayotte',
  MX = 'Mexico',
  FM = 'Micronesia, Federated States of',
  MD = 'Moldova, Republic of',
  MC = 'Monaco',
  MN = 'Mongolia',
  ME = 'Montenegro',
  MS = 'Montserrat',
  MA = 'Morocco',
  MZ = 'Mozambique',
  MM = 'Myanmar',
  NA = 'Namibia',
  NR = 'Nauru',
  NP = 'Nepal',
  NL = 'Netherlands',
  NC = 'New Caledonia',
  NZ = 'New Zealand',
  NI = 'Nicaragua',
  NE = 'Niger',
  NG = 'Nigeria',
  NU = 'Niue',
  NF = 'Norfolk Island',
  MP = 'Northern Mariana Islands',
  NO = 'Norway',
  OM = 'Oman',
  PK = 'Pakistan',
  PW = 'Palau',
  PS = 'Palestine, State of',
  PA = 'Panama',
  PG = 'Papua New Guinea',
  PY = 'Paraguay',
  PE = 'Peru',
  PH = 'Philippines',
  PN = 'Pitcairn',
  PL = 'Poland',
  PT = 'Portugal',
  PR = 'Puerto Rico',
  QA = 'Qatar',
  RE = 'R\u00e9union',
  RO = 'Romania',
  RU = 'Russian Federation',
  RW = 'Rwanda',
  BL = 'Saint Barth\u00e9lemy',
  SH = 'Saint Helena, Ascension and Tristan da Cunha',
  KN = 'Saint Kitts and Nevis',
  LC = 'Saint Lucia',
  MF = 'Saint Martin (French part)',
  PM = 'Saint Pierre and Miquelon',
  VC = 'Saint Vincent and the Grenadines',
  WS = 'Samoa',
  SM = 'San Marino',
  ST = 'Sao Tome and Principe',
  SA = 'Saudi Arabia',
  SN = 'Senegal',
  RS = 'Serbia',
  SC = 'Seychelles',
  SL = 'Sierra Leone',
  SG = 'Singapore',
  SX = 'Sint Maarten (Dutch part)',
  SK = 'Slovakia',
  SI = 'Slovenia',
  SB = 'Solomon Islands',
  SO = 'Somalia',
  ZA = 'South Africa',
  GS = 'South Georgia and the South Sandwich Islands',
  SS = 'South Sudan',
  ES = 'Spain',
  LK = 'Sri Lanka',
  SD = 'Sudan',
  SR = 'Suriname',
  SJ = 'Svalbard and Jan Mayen',
  SZ = 'Swaziland',
  SE = 'Sweden',
  CH = 'Switzerland',
  SY = 'Syrian Arab Republic',
  TW = 'Taiwan, Province of China',
  TJ = 'Tajikistan',
  TZ = 'Tanzania, United Republic of',
  TH = 'Thailand',
  TL = 'Timor-Leste',
  TG = 'Togo',
  TK = 'Tokelau',
  TO = 'Tonga',
  TT = 'Trinidad and Tobago',
  TN = 'Tunisia',
  TR = 'Turkey',
  TM = 'Turkmenistan',
  TC = 'Turks and Caicos Islands',
  TV = 'Tuvalu',
  UG = 'Uganda',
  UA = 'Ukraine',
  AE = 'United Arab Emirates',
  GB = 'United Kingdom',
  US = 'United States',
  UM = 'United States Minor Outlying Islands',
  UY = 'Uruguay',
  UZ = 'Uzbekistan',
  VU = 'Vanuatu',
  VE = 'Venezuela, Bolivarian Republic of',
  VN = 'Viet Nam',
  VG = 'Virgin Islands, British',
  VI = 'Virgin Islands, U.S.',
  WF = 'Wallis and Futuna',
  EH = 'Western Sahara',
  YE = 'Yemen',
  ZM = 'Zambia',
  ZW = 'Zimbabwe'
}

export interface APITag {
  id: number;
  tag_name: string;
}

enum itemType {
  video = 'Video',
  text = 'Text',
  audio = 'Audio',
  image = 'Image'
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

export enum formats {
  cd_rom = 'CD ROM',
  notebook = 'Notebook'
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
  regions: Regions[] | null;

  item_type: itemType;

  item_subtype: itemAudio | itemImage | itemText | itemVideo;
  creators: string[] | null;

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

  focus_arts: string | null;
  focus_action: string | null;
  focus_scitech: string | null;

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
  provenance: string[] | null;
}
