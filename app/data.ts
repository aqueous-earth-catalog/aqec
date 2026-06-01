import { cache } from "react";
import { base, convertKeysToSnakeCase } from "@/lib/airtable";
import { Collection, Media, WebAppMetadata } from "@/lib/airtable/types";

const MEDIA_LOCATION_TABLE_NAME = "Media Locations";
const MEDIA_TABLE_NAME = "Media";
const WEB_APP_METADATA_TABLE_NAME = "Web App Metadata";
const COLLECTIONS_TABLE_NAME = "Collections";

// Fetches Media records directly rather than relying on lookup fields on the
// Media Locations table. Airtable lookup fields strip rich text (Markdown)
// formatting, so we fetch from the source table to preserve it.
async function getMedia(): Promise<Map<string, Media>> {
  const records = await base(MEDIA_TABLE_NAME).select().all();

  const mediaMap = new Map<string, Media>();
  for (const record of records) {
    const fields = convertKeysToSnakeCase(record.fields);
    mediaMap.set(record.id, {
      name: fields.name,
      original_title: fields.original_title,
      director: fields.director,
      release_year: fields.release_year,
      description: fields.description,
      image: fields.image?.[0],
      video_link: fields.video_link,
      subjects: fields.subjects,
      language: fields.language,
      references: fields.references,
      rights: fields.rights,
      rights_statement_link: fields.rights_statement_link,
      media_type: fields.media_type,
      related_media_locations: fields.related_media_locations,
    });
  }

  return mediaMap;
}

export async function getMediaPoints() {
  const [locationRecords, mediaMap] = await Promise.all([
    base(MEDIA_LOCATION_TABLE_NAME)
      .select({
        view: process.env.AIRTABLE_VIEW_NAME,
      })
      .all(),
    getMedia(),
  ]);

  return locationRecords
    .filter((record) => record.fields.Latitude && record.fields.Longitude)
    .map((record) => {
      const fields = convertKeysToSnakeCase(record.fields);
      const mediaId = fields.media?.[0];

      return {
        id: record.id,
        name: fields.name,
        latitude: fields.latitude,
        longitude: fields.longitude,
        location_name: fields.location_name,
        location_description: fields.location_description,
        natural_feature_name: fields.natural_feature_name,
        city: fields.city,
        region: fields.region,
        country: fields.country,
        media_id: mediaId,
        media: mediaId ? mediaMap.get(mediaId) : undefined,
      };
    });
}

export const getWebAppMetadata = cache(async (): Promise<WebAppMetadata> => {
  const response = await base(WEB_APP_METADATA_TABLE_NAME)
    .select({
      view: process.env.AIRTABLE_VIEW_NAME,
    })
    .all()
    .then((records) => {
      return records.map((record) => {
        const fields = convertKeysToSnakeCase(record.fields);
        return {
          title: fields.site_title,
          description: fields.site_description,
          keywords: fields.site_keywords,
          creator: fields.creator,
          owner: fields.owner,
          getting_started_dialog_title: fields.getting_started_dialog_title,
          getting_started_dialog_content: fields.getting_started_dialog_content,
          getting_started_dialog_enabled:
            fields.getting_started_dialog_enabled ?? false,
          getting_started_dialog_version:
            fields.getting_started_dialog_version ?? "v1",
        };
      });
    });

  const metadata = response[0] ?? ({} as WebAppMetadata);

  return metadata;
});

export async function getCollections(): Promise<Collection[]> {
  const records = await base(COLLECTIONS_TABLE_NAME).select().all();

  return records
    .map((record) => {
      const fields = convertKeysToSnakeCase(record.fields);

      return {
        id: record.id,
        title: fields.title ?? "",
        body_repo_slug: fields.body_repo_slug ?? "",
        published: fields.published ?? false,
        featured: fields.featured ?? false,
        created_time: fields.created_time,
        teaser: fields.teaser,
        linked_media: fields.linked_media,
        linked_media_locations: fields.linked_media_locations,
      };
    })
    .filter((collection) => collection.published)
    .sort((a, b) => {
      if (Boolean(a.featured) !== Boolean(b.featured)) {
        return a.featured ? -1 : 1;
      }
      const aTime = a.created_time ? Date.parse(a.created_time) : 0;
      const bTime = b.created_time ? Date.parse(b.created_time) : 0;
      return aTime - bTime;
    });
}
