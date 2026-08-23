import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SessionBar } from "@/components/session-bar";
import { KiroshiCursor } from "@/components/kiroshi";
import appCss from "../styles.css?url";

const APP_NAME = "ARASAKA";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#050608" },
      {
        name: "description",
        content: "Arasaka Financial Systems — Night City private banking. Zero-trust. Black ICE protected.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Rajdhani:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-ink text-fg">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
          <SessionBar />
          <KiroshiCursor />
        </AuthProvider>
        <div className="grain" aria-hidden />
        <Scripts />
      </body>
    </html>
  ),
});
