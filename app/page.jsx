import { pageHtml } from "./page-data";

export default function Home() {
  return (
    <div className="psm-page" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: pageHtml }} />
  );
}
