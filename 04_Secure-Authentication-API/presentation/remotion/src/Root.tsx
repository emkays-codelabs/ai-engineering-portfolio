import { Composition } from "remotion";

import { Presentation } from "./Presentation";

// 72000 frames @ 30fps = exactly 2400s = 40:00 — chapter budget in presentation/storyboard.md.
const TOTAL_DURATION_IN_FRAMES = 72000;

// Composition ID matches the stable episode ID in presentation/youtube/series-manifest.md.
export function RemotionRoot() {
  return (
    <Composition
      id="ep01-secure-authentication-api"
      component={Presentation}
      durationInFrames={TOTAL_DURATION_IN_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
}
