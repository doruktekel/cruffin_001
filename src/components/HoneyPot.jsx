"use client";
// components/HoneyPot.jsx - DÜZELTİLMİŞ
import { useState } from "react";

export function HoneyPot({ onHoneypotChange }) {
  const [middleName, setMiddleName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  const handleMiddleNameChange = (e) => {
    const value = e.target.value;
    setMiddleName(value);
    onHoneypotChange?.({ honeypot: value, website: profileUrl });
  };

  const handleProfileUrlChange = (e) => {
    const value = e.target.value;
    setProfileUrl(value);
    onHoneypotChange?.({ honeypot: middleName, website: value });
  };

  return (
    <>
      {/* Ana honeypot field */}
      <input
        type="text"
        name="middleName"
        value={middleName}
        onChange={handleMiddleNameChange}
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
          opacity: 0.001,
          pointerEvents: "none",
          zIndex: -1000,
          left: "-9999px",
        }}
        tabIndex="-1"
        autoComplete="off"
        aria-hidden="true"
      />
      {/* Ek honeypot field */}
      <input
        type="url"
        name="profileUrl"
        value={profileUrl}
        onChange={handleProfileUrlChange}
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
          opacity: 0.001,
          pointerEvents: "none",
          zIndex: -1000,
          right: "-9999px",
        }}
        tabIndex="-1"
        autoComplete="off"
        aria-hidden="true"
      />
    </>
  );
}
