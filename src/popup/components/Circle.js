import React from "react";

const Circle = ({ id, target, setTarget, handleClick }) => {
  return (
    <div
      className={`circle ${target === id ? "selected" : ""}`}
      id={id}
      onClick={handleClick}
    >
      {target === id ? <div id="scircle"></div> : ""}
    </div>
  );
};

export default Circle;
