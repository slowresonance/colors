import { useEffect, useState } from "react";

const getCurrentColors = () => {
  // gets current colors from the document
  let currentColors = {};
  for (let key in spec) {
    currentColors[key] = getComputedStyle(document.querySelector(":root"))
      .getPropertyValue(`--${key}`)
      .trim()
      .toUpperCase();
  }
  return currentColors;
};

function ContentScript() {
  const [colors, setColors] = useState(getCurrentColors());

  useEffect(() => {
    applyColors();
  }, [colors]);

  const applyColors = () => {
    for (let key in colors) {
      document
        .querySelector(":root")
        .style.setProperty(`--${key}`, colors[key]);
    }
  };

  // message resolver

  chrome.runtime.onMessage.addListener((msg) => {
    switch (msg.cmd) {
      case "update-colors":
        setColors(msg.colors);
        break;
      case "popup-start":
        chrome.runtime.sendMessage({
          from: "content",
          cmd: "set-initial-colors",
          colors: colors,
        });
        break;
    }
  });

  return <></>;
}

let spec = {
  background: "#222222",
  f_high: "#eeeeee",
  f_med: "#cccccc",
  f_low: "#aaaaaa",
  f_inv: "#777777",
  b_high: "#333333",
  b_med: "#444444",
  b_low: "#555555",
  b_inv: "#666666",
};

export default ContentScript;
