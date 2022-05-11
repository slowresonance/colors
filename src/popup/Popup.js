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

const dateToYMD = (date) => {
  var strArray = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var d = date.getDate();
  var m = strArray[date.getMonth()];
  var y = date.getFullYear();
  return "" + (d <= 9 ? "0" + d : d) + "-" + m + "-" + y;
};

function Popup() {
  const [colors, setColors] = useState(getCurrentColors());
  const [target, setTarget] = useState("");
  const [saveInput, setSaveInput] = useState(false);
  const inputRef = useRef();
  const saveRef = useRef();

  const exportSvg = (fname, content) => {
    const filename =
      fname === "" ? `colors-${dateToYMD(new Date())}.svg` : `${fname}.svg`;
    const blob = new Blob([content], {
      type: "text/json",
    });

    const link = document.createElement("a");

    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(
      ":"
    );

    const event = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(event);
    link.remove();
  };

  useEffect(() => {
    if (target !== "") inputRef.current.focus();
  }, [target]);

  useEffect(() => {
    if (saveInput === true) saveRef.current.focus();
  }, [saveInput]);

  useEffect(() => {
    applyColors();
  }, [colors]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        cmd: "popup-start",
      });
    });
  }, []);

  const applyColors = () => {
    for (let key in colors) {
      document
        .querySelector(":root")
        .style.setProperty(`--${key}`, colors[key]);
    }
  };

  const handleEnter = (e) => {
    const input = `#${e.target.value}`;
    const hexregx = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/;
    if (input === "") return;
    if (!input.match(hexregx)) return;

    let updatedColors = {};
    Object.keys(colors).map((key) =>
      key.replace("_", "-") === target
        ? (updatedColors[key] = `${input}`)
        : (updatedColors[key] = colors[key])
    );

    setColors(updatedColors);
    e.target.value = "";

    // send the updated colors to content

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        from: "popup",
        cmd: "update-colors",
        colors: updatedColors,
      });
    });
  };

  const handleSave = (e) => {
    let content = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="64px" width="96px">
    <rect fill="${colors["background"]}" id="background" height="64" width="96"></rect>
    
    <circle fill="${colors["f_high"]}" id="f_high" r="8" cy="24" cx="24"></circle>
    <circle fill="${colors["f_med"]}" id="f_med" r="8" cy="24" cx="40"></circle>
    <circle fill="${colors["f_low"]}" id="f_low" r="8" cy="24" cx="56"></circle>
    <circle fill="${colors["f_inv"]}" id="f_inv" r="8" cy="24" cx="72"></circle>
    
    <circle fill="${colors["b_high"]}" id="b_high" r="8" cy="40" cx="24"></circle>
    <circle fill="${colors["b_med"]}" id="b_med" r="8" cy="40" cx="40"></circle>
    <circle fill="${colors["b_low"]}" id="b_low" r="8" cy="40" cx="56"></circle>
    <circle fill="${colors["b_inv"]}" id="b_inv" r="8" cy="40" cx="72"></circle>
  </svg>`;
    exportSvg(e.target.value, content);

    saveRef.current.value = "";
    setSaveInput(false);
  };

  // Message resolver

  chrome.runtime.onMessage.addListener((msg) => {
    switch (msg.cmd) {
      case "set-initial-colors":
        setColors(msg.colors);
        break;
    }
  });

  const handleClick = (e) => {
    e.target.id === "scircle" ? setTarget("") : setTarget(e.target.id);
  };

  return (
    <>
      <div
        id="background"
        className={`${target === "background" ? "selected" : ""}`}
        onClick={handleClick}
      >
        {Object.keys(colors).map(
          (key) =>
            key !== "background" && (
              <Circle
                id={key.replace("_", "-")}
                target={target}
                setTarget={setTarget}
                handleClick={handleClick}
              />
            )
        )}
      </div>
      <div className="input-container">
        <div id="hex">#</div>
        <input
          type="text"
          id="color-input"
          ref={inputRef}
          placeholder="101010"
          spellCheck="false"
          autoComplete="new-password"
          maxLength={6}
          onKeyDown={(e) => e.key === "Enter" && handleEnter(e)}
        />
        <div
          id="save"
          onClick={(e) => {
            setSaveInput(true);
          }}
        >
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
      {saveInput === true ? (
        <div className="input-container">
          <input
            type="text"
            id="fname-input"
            placeholder="Save theme as"
            spellCheck="false"
            ref={saveRef}
            onBlur={(e) => {
              setSaveInput(false);
            }}
            autoComplete="new-password"
            maxLength={6}
            onKeyDown={(e) => e.key === "Enter" && handleSave(e)}
          />
        </div>
      ) : (
        <></>
      )}
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

export default Popup;
