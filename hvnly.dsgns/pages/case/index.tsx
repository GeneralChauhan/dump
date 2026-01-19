"use client";
import {
  Heroworkiz,
  Aboutworkiz,
  Challenge,
  Result,
  Works,
  Credit,
  VideoWorkiz,
} from "@/container";
import { useEffect } from "react";
import { Curve, Ready } from "@/components";
import { useRouter } from "next/router";

export default function Work() {
  const router = useRouter();
  const params = router.query;

  console.log(params.company, "ajay");

  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      const locomotiveScroll = new LocomotiveScroll();
    })();
  }, []);
  return (
    <>
      <Curve backgroundColor="#fff">
        <Heroworkiz />
        <Aboutworkiz />
        <Challenge />
        <VideoWorkiz />
        <Result />
        <Credit />
        <Works />
        <Ready />
      </Curve>
    </>
  );
}
