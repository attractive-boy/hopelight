import { useState, useEffect } from "react";
import Lottie from "react-lottie-player";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#fff",
      }}
    >
      <Lottie
        loop
        animationData={require("../public/heart.json")}
        play
        style={{ width: 200, height: 200 }}
      />
    </div>
  );
}
