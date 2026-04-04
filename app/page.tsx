import { getMediaPoints, getWebAppMetadata } from "./data";
import MapContainer from "@/components/map-container";
import WelcomeDialog from "@/components/welcome-dialog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [mediaPoints, metadata] = await Promise.all([
    getMediaPoints(),
    getWebAppMetadata(),
  ]);

  return (
    <div className="w-full h-full relative">
      <h1 className="sr-only">Media Mapper - Interactive Map View</h1>
      <MapContainer mediaPoints={mediaPoints} />
      {metadata.getting_started_dialog_enabled && metadata.getting_started_dialog_content && (
        <WelcomeDialog
          title={metadata.getting_started_dialog_title || "Getting Started"}
          body={metadata.getting_started_dialog_content}
          version={metadata.getting_started_dialog_version || "v1"}
        />
      )}
    </div>
  );
}
