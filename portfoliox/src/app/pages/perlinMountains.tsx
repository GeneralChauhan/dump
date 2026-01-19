// <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
//   <Head>
//     <title>Perlin Mountains</title>
//     <meta name="description" content="Procedural Perlin Noise Mountains" />
//   </Head>
//   <PerlinMountains />
// </div>

import Head from "next/head";
import PerlinMountains from "../components/PerlinMountains";

export default function PerlinMountainsAnimation() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Head>
        <title>Perlin Mountains</title>
        <meta name="description" content="Procedural Perlin Noise Mountains" />
      </Head>
      <PerlinMountains />
    </div>
  );
}
