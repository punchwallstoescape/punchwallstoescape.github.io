import { nativeAd } from "@/config/adsterra";
import { NativeAdClient } from "./native-ad-client";

export function NativeAdSlot() {
  return (
    <NativeAdClient
      scriptUrl={nativeAd.scriptUrl}
      containerId={nativeAd.containerId}
    />
  );
}
