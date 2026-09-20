import { Composition } from "remotion";

import { Presentation } from "./Presentation";

const TOTAL_DURATION_IN_FRAMES = 16800; // 560s @ 30fps ≈ 9.3 min — see storyboard.md

export function RemotionRoot() {
  return (
    <Composition
      id="Presentation"
      component={Presentation}
      durationInFrames={TOTAL_DURATION_IN_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
}
