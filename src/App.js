import { useEffect, useState, useRef } from "react";
import "./styles/style.css";
import Circle from "./components/Circle";

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

function App() {
  const [colors, setColors] = useState(getCurrentColors());
  const [target, setTarget] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    if (target !== "") inputRef.current.focus();
  }, [target]);

  useEffect(() => {
    applyColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors]);

  const applyColors = () => {
    for (let key in colors) {
      document
        .querySelector(":root")
        .style.setProperty(`--${key}`, colors[key]);
    }
  };

  const handleEnter = (e) => {
    // handle wrong cases
    let updatedColors = {};
    Object.keys(colors).map((key) =>
      key.replace("_", "-") === target
        ? (updatedColors[key] = `#${e.target.value}`)
        : (updatedColors[key] = colors[key])
    );

    setColors(updatedColors);

    e.target.value = "";
  };

  return (
    <>
      <div id="canvas">
        {Object.keys(colors).map(
          (key) =>
            key !== "background" && (
              <Circle
                id={key.replace("_", "-")}
                target={target}
                setTarget={setTarget}
              />
            )
        )}
      </div>
      <div id="input-container">
        <div id="hex">#</div>
        <input
          type="text"
          id="input"
          ref={inputRef}
          placeholder="101010"
          spellCheck="false"
          autoComplete="chrome-off"
          maxLength={6}
          onKeyDown={(e) => e.key === "Enter" && handleEnter(e)}
        />
        <div id="save">
          <svg
            width="12"
            height="14"
            viewBox="0 0 12 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 8L6 13L11 8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 13V1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </>
  );
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

export default App;
