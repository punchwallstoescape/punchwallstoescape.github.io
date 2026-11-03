import type { CSSProperties, ReactNode } from "react";
import { Analytics } from "@/components/integrations/analytics";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteConfig } from "@/config/site";
import { siteSkin } from "@/config/skin";
import { scopedTemplateCss } from "@/lib/fixed-template/render";
import { isFixedTemplate } from "@/lib/fixed-template/mode";
import { themes } from "@/config/themes";
import { enabledLegalPages, visibleCorePages } from "@/content/registry";
import { fontFaceCss } from "@/lib/fonts";
import { rootMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata = rootMetadata();

const navLinks = visibleCorePages.map((page) => ({ label: page.navLabel, slug: page.slug }));
const legalLinks = enabledLegalPages.map((page) => ({ label: page.navLabel, slug: page.slug }));

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const fixed = isFixedTemplate();
  const fixedSkin = siteSkin();
  const theme = themes[siteConfig.theme.preset] ?? themes["obsidian-red"] ?? themes["midnight-red"] ?? Object.values(themes)[0];
  const headerStyle = siteConfig.theme.headerStyle ?? "solid";
  const componentStyle = siteConfig.theme.componentStyle ?? "rounded";
  const style = Object.fromEntries(
    Object.entries({ ...(theme?.tokens ?? {}), ...(siteConfig.theme.overrides ?? {}) }).map(([key, value]) => [`--${key}`, value]),
  ) as CSSProperties;

  return (
    <html
      lang={siteConfig.language}
      data-theme={theme?.name ?? siteConfig.theme.preset}
      data-skin={siteConfig.theme.skin ?? "portal"}
      data-font={siteConfig.theme.fontId ?? "inter"}
      data-header-style={headerStyle}
      data-component-style={componentStyle}
      data-fixed-template={fixed ? fixedSkin : undefined}
      style={style}
    >
      <head>
        <Analytics />
      </head>
      <body data-fixed-template={fixed ? fixedSkin : undefined}>
        {fixed ? <style dangerouslySetInnerHTML={{ __html: scopedTemplateCss(fixedSkin, siteConfig.theme.accentColorId) }} /> : null}
        {fixed && fixedSkin === "guidebook" ? <style dangerouslySetInnerHTML={{ __html: `
          body[data-fixed-template="guidebook"] .top { position:sticky;top:0;z-index:60; }
          body[data-fixed-template="guidebook"] .content-card { min-width:0; overflow-wrap:anywhere; }
          body[data-fixed-template="guidebook"] { overflow-x:clip; } html[data-fixed-template="guidebook"] { overflow-x:clip; }
          body[data-fixed-template="guidebook"] .top-inner { min-height:70px;height:auto; }
          body[data-fixed-template="guidebook"] .top .brand { min-width:0; flex:0 1 auto; }
          body[data-fixed-template="guidebook"] .top .brand strong { overflow-wrap:anywhere; }
          body[data-fixed-template="guidebook"] .top .site-nav { display:flex; align-items:center; flex-wrap:wrap; justify-content:flex-end; gap:3px; min-width:0; }
          body[data-fixed-template="guidebook"] .top .site-nav a { display:inline-flex; align-items:center; padding:10px 12px; border-bottom:2px solid transparent; white-space:nowrap; font-size:13px; }
          body[data-fixed-template="guidebook"] .top .site-nav a.active { border-bottom-color:#c6a54f; }
          @media(max-width:820px) {
            body[data-fixed-template="guidebook"] .top-inner { flex-wrap:wrap; gap:3px; padding:8px 0; }
            body[data-fixed-template="guidebook"] .top .brand { flex-basis:100%; }
            body[data-fixed-template="guidebook"] .top .site-nav { display:flex!important; width:100%; justify-content:flex-start; flex-wrap:nowrap; gap:4px; overflow-x:auto; scrollbar-width:thin; -webkit-overflow-scrolling:touch; }
            body[data-fixed-template="guidebook"] .top .site-nav a { flex-shrink:0; padding:7px 10px; font-size:12px; }
          }
        ` }} /> : null}
        <style dangerouslySetInnerHTML={{ __html: fontFaceCss(siteConfig.hosting.basePath) }} />
        <a href="#main-content" className="skip-link">Skip to content</a>
        <SiteHeader links={navLinks} />
        <div id="main-content">{children}</div>
        {fixed && fixedSkin === "arcade-play" ? null : <SiteFooter coreLinks={navLinks} legalLinks={legalLinks} />}
      </body>
    </html>
  );
}
