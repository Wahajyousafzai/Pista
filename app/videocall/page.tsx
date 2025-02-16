import { VideoCallComponent } from "@/components/VideoCallComponent";
import { VideoCallControls } from "@/components/VideoCallControls";

export default function VideoCallPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <VideoCallComponent />
      <VideoCallControls />
    </div>
  );
}
