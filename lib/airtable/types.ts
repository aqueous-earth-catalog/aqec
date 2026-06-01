export interface MediaImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  width: number;
  height: number;
  thumbnails: {
    small: {
      width: number;
      height: number;
    };
    large: {
      width: number;
      height: number;
    };
  };
}

export interface Media {
  name: string;
  original_title?: string;
  media_type?: string;
  director?: string;
  release_year?: number;
  description?: string;
  image?: MediaImage;
  video_link?: string;
  subjects?: string[];
  language?: string[];
  references?: string;
  rights?: string;
  rights_statement_link?: string;
  related_media_locations?: string[];
}

export interface MediaLocation {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  location_name?: string;
  location_description?: string;
  natural_feature_name?: string;
  city?: string;
  region?: string;
  country?: string;
  media_id?: string;
  media?: Media;
}

export interface MapFilters {
  countries: string[];
  regions: string[];
  bodiesOfWater: string[];
  startYear: string;
  endYear: string;
}

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface WebAppMetadata {
  title: string;
  description: string;
  keywords: string;
  creator: string;
  owner: string;
  getting_started_dialog_title?: string;
  getting_started_dialog_content?: string;
  getting_started_dialog_enabled?: boolean;
  getting_started_dialog_version?: string;
}
/** Raw collection row from Airtable (after convertKeysToSnakeCase). */
export interface Collection {
  /** Airtable record id (set in getCollections, not from fields). */
  id: string;
  title: string;
  body_repo_slug: string;
  published?: boolean;
  /** Featured collections are listed first. */
  featured?: boolean;
  /** ISO timestamp from Airtable's "Created time" field; used for ordering. */
  created_time?: string;
  teaser?: string;
  /** Linked record ids → Media table */
  linked_media?: string[];
  /** Linked record ids → Media Locations table */
  linked_media_locations?: string[];
}
