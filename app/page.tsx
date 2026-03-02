import { getMediaPoints } from "./data";
import MapContainer from "@/components/map-container";

export const dynamic = "force-dynamic";

export default async function Home() {
  const mediaPoints = await getMediaPoints();

  return (
    <div className="w-full h-full relative mb-12">
      <h1 className="sr-only">Media Mapper - Interactive Map View</h1>
      <MapContainer mediaPoints={mediaPoints} />
    </div>
  );
}
