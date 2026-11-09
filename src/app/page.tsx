import { HomeContent } from "@/components/home/HomeContent";
import { FeaturedApps } from "@/components/home/FeaturedApps";
import { LatestUploads } from "@/components/home/LatestUploads";

export default function Home() {
  return (
    <main className="portal-home">
      <HomeContent />
      <div className="portal-page portal-home-lower">
        <FeaturedApps />
        <LatestUploads />
      </div>
    </main>
  );
}
