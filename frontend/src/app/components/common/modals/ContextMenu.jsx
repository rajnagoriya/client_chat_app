import { useEffect, useRef } from "react";

export default function ContextMenu({
  options,
  coordinates,
  contextMenu,
  setContextMenu,
}) {
  const contextMenuRef = useRef(null); 
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "context-opener") {
        if (
          contextMenuRef.current && 
          !contextMenuRef.current.contains(event.target) // If the click is outside of the menu
        ) {
          setContextMenu(false); // Close the context menu
        }
      }
    };

    document.addEventListener("click", handleOutsideClick); // Add click listener

    return () => {
      document.removeEventListener("click", handleOutsideClick); // Clean up listener
    };
  }, [setContextMenu]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        if (contextMenu) setContextMenu(false); // Close on Escape key press
      }
    };
    window.addEventListener("keyup", handleKeyPress);
    return () => window.removeEventListener("keyup", handleKeyPress);
  }, [contextMenu, setContextMenu]);

  const handleClick = (e, callBack) => {
    e.stopPropagation();
    callBack(); // Execute the callback for the selected menu option
  };

  // Adjust position to prevent overflow outside of the screen
  const adjustPosition = () => {
    const menuWidth = contextMenuRef.current ? contextMenuRef.current.offsetWidth : 200;
    const menuHeight = contextMenuRef.current ? contextMenuRef.current.offsetHeight : 150;

    
    const x = coordinates?.x || 0; 
    const y = coordinates?.y || 0; 

    let adjustedX = x;
    let adjustedY = y;

    // Horizontal adjustment (check for right overflow)
    if (adjustedX + menuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - 10; // Shift left
    }

    // Vertical adjustment (check for bottom overflow)
    if (adjustedY + menuHeight > window.innerHeight) {
      adjustedY = y - menuHeight - 10; // Shift upwards if there's not enough space below
    }

    return { top: adjustedY, left: adjustedX };
  };

  return (
    <div
      className="bg-base-200 rounded-md shadow-lg fixed z-[100]"
      ref={contextMenuRef}
      style={adjustPosition()} 
    >
      <ul className="menu menu-compact">
        {options.map(({ name, callBack }, index) => (
          <li key={index} onClick={(e) => handleClick(e, callBack)}>
            <span className="text-base-content">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}