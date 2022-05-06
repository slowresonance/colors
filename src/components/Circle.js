import React from "react";

const Circle = ({ id, setTarget }) => {
  const handleClick = (e) => {
    setTarget(e.target.id);
    console.log(e.target.id);
  };
  return <div className="circle" id={id} onClick={handleClick}></div>;
};

export default Circle;
