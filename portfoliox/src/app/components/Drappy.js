"use client";

import { useEffect, useRef } from "react";
import "../style/perlin.css";

export default function Drappy() {
  useEffect(() => {
    // Load p5.js

    return () => {
      // Cleanup will be handled by p5's remove() method
    };
  }, []);

  return (
    <div
      className="w-full h-full bg-white"
      style={{
        fontFamily: "Helvetica, sans-serif",
        color: "grey",
        padding: "24px",
      }}
    >
      <br />
      <h1
        style={{
          fontSize: "120px",
          fontFamily: "Helvetica, sans-serif",
          color: "black",
          marginLeft: "auto",
          marginRight: "auto",
          width: "fit-content",
          fontWeight: "500",
          letterSpacing: "-12px",
        }}
      >
        God's space
      </h1>
      <br />
      <br />
      <br />
      <br />
      <marquee className="" style={{ width: "250%", marginLeft: "-100vw" }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div
            style={{
              fontSize: "24px",
              fontFamily: "Helvetica, sans-serif",
              width: "fit-content",
              fontWeight: "500",
              letterSpacing: "-1px",
              paddingLeft: "10px",
              textTransform: "uppercase",
              fontStyle: "italic",
            }}
          >
            What are we supposed to add here? //
          </div>
          <div
            style={{
              fontSize: "24px",
              fontFamily: "Helvetica, sans-serif",
              width: "fit-content",
              fontWeight: "500",
              letterSpacing: "-1px",
              paddingLeft: "10px",
              paddingRight: "10px",
              textTransform: "uppercase",
              fontStyle: "italic",
            }}
          >
            What are we supposed to add here? //
          </div>
          <div
            style={{
              fontSize: "24px",
              fontFamily: "Helvetica, sans-serif",
              width: "fit-content",
              fontWeight: "500",
              letterSpacing: "-1px",
              paddingLeft: "10px",
              textTransform: "uppercase",
              fontStyle: "italic",
            }}
          >
            What are we supposed to add here? //
          </div>
        </div>
      </marquee>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            flexGrow: "0.7",
            height: "30vh",
            display: "block",
            borderRadius: "16px",
            backgroundColor: "teal",
            padding: "12px",
            marginRight: "12px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              letterSpacing: "-1px",
              color: "black",
              fontFamily: "Helvetica",
              fontWeight: 500,
            }}
          >
            Wowowowo
          </h2>
        </div>
        <div
          style={{
            flexGrow: "0.3",
            height: "30vh",
            display: "block",
            borderRadius: "16px",
            backgroundColor: "teal",
          }}
        ></div>
      </div>
    </div>
  );
}
