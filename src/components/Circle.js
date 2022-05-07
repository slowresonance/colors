import React from "react";

const Circle = ({ id, target, setTarget }) => {
  const handleClick = (e) => {
    e.target.id === "scircle" ? setTarget("") : setTarget(e.target.id);
  };

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
