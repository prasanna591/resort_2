import "./globals.css";
import Script from "next/script";
import SiteScripts from "./site-scripts";

export const metadata = {
  title: "PSM Resort",
  description: "PSM Resort is a wellness resort in the green hills of Vietnam"
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-wf-page="60a299f0cfa30f6759139134"
      data-wf-site="60a299f0cfa30f7583139133"
      className="w-mod-js"
      suppressHydrationWarning
    >
      <head>
        <link rel="stylesheet" href="/css/jquery-ui.css" />
        <link rel="shortcut icon" href="https://cdn.prod.website-files.com/img/favicon.ico" />
        <link rel="apple-touch-icon" href="https://cdn.prod.website-files.com/img/webclip.png" />
        <Script src="/js/jquery.min.js" strategy="afterInteractive" />
        <Script src="/js/jquery-ui.js" strategy="afterInteractive" />
        <Script src="/js/webflow.js" strategy="afterInteractive" />
      </head>
      <body className="body">
        {children}
        <SiteScripts />
      </body>
    </html>
  );
}
