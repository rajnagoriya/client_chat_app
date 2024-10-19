import React from "react";
import ReactDOM from "react-dom";

export default function PhotoPicker({ onChange }) {
  const component = (
    <input 
      type="file" 
      id="photo-picker" 
      onChange={onChange}
      accept="image/*"
      style={{ display: "none" }}
    />
  );

  return ReactDOM.createPortal(
    component,
    document.getElementById("photo-picker-element") 
  );
}
