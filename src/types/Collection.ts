import { User } from './User';
import { Ocean } from './Ocean';
import { License } from './License';
import { APITag } from './Item';

export interface Collection {
  count?: number;
  id?: string;

  created_at?: string | null;
  updated_at?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  time_produced?: string | null;

  status?: boolean | null;

  concept_tags?: number[] | null;
  keyword_tags?: number[] | null;

  aggregated_concept_tags?: APITag[] | null;
  aggregated_keyword_tags?: APITag[] | null;

  place?: string | null;
  country_or_ocean?: string | Ocean | null;

  item_type?: number | null;

  creators?: User[] | null;
  contributor?: string | null;

  directors?: string[] | null;
  writers?: string[] | null;
  collaborators?: string | null;

  exhibited_at?: string | null;

  series?: string | null;
  isbn?: number | null;
  edition?: number | null;
  publisher?: string[] | null;
  interviewers?: string[] | null;
  interviewees?: string[] | null;
  cast_?: string | null;

  license?: License | null;

  title?: string | null;
  description?: string | null;

  map_icon?: string | null;

  location?: string | null;
  geojson?: string | null;

}
