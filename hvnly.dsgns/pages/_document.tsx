import { Html, Head, Main, NextScript } from "next/document";
import { Analytics } from "@vercel/analytics/next";

export default function Document() {
  return (
    <Html lang="en">
      <title>hvnly — Art made functional</title>
      <Head />
      <body>
        <Analytics />
        <Main />
        <NextScript />
      </body>
      <script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="9d107f7b-2661-4bbf-bafd-914b7c313e54"
      ></script>
    </Html>
  );
}
