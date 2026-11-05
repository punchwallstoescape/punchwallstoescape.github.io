import Script from "next/script";
import { socialBarUrl } from "@/config/adsterra";

// Root layout persists through client navigation. Next Script also deduplicates
// this stable ID/src across mounts, including history navigation.
export function SocialBar() {
  return <Script id="adsterra-social-bar" data-cfasync="false" src={socialBarUrl} strategy="afterInteractive" />;
}
