import { useEffect, useState } from "react";
import { FaCamera, FaUser } from "react-icons/fa";
import ContextMenu from "../modals/ContextMenu";
import PhotoLibrary from "./PhotoLibrary";

export default function Avatar({
  type,
  image,
  setImage,
  setIsEditingImage,
  setImageFile,
  setIsDeleteImage,
}) {
  const [hover, setHover] = useState(false);
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [grabImage, setGrabImage] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({ x: 0, y: 0 });


  const contextMenuOptions = [
    { name: "Choose from Library", callBack: () => togglePhotoLibrary(true) },
    { name: "Upload Photo", callBack: () => setGrabImage(true) },
    { name: "Delete Photo", callBack: () => handleDeletePhoto() },
  ];

  const togglePhotoLibrary = (show) => {
    setIsContextMenuVisible(false);
    setShowPhotoLibrary(show);
  };

  const handleDeletePhoto = () => {
    setIsContextMenuVisible(false);
    setIsDeleteImage(true);
    setIsEditingImage(true);
    setImage("");
  };

  useEffect(() => {
    if (grabImage) {
      document.getElementById("file-input")?.click();
      setGrabImage(false);
    }
  }, [grabImage]);

  const showContextMenu = (e) => {
    console.log("contex menu called Avatar.jsx !!!");
    e.preventDefault();
    setContextMenuCoordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
  };

  const handlePhotoPickerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result);
        setIsEditingImage(true);
        setImageFile(file);
        reader.readAsDataURL(file);
    }
  };

  const renderAvatar = () => {
    let avatarSizeClasses = "";
    switch (type) {
      case "sm":
        avatarSizeClasses = "h-10 w-10"; // Small size
        break;
      case "gi":
        avatarSizeClasses = "h-12 w-12"; // Group Icon size
        break;
      case "lg":
        avatarSizeClasses = "h-12 w-12"; // Large size
        break;
      case "xl":
      case "infoIcon":
        avatarSizeClasses = "h-60 w-60"; // Extra large size or Info Icon
        break;
      default:
        avatarSizeClasses = "h-10 w-10"; // Default to small if not specified
    }

    const avatarClasses = type === "lg" || type === "xl" || type === "infoIcon"
      ? `relative cursor-pointer z-0`
      : "flex items-center justify-center";

    const imageElement = image ? (
      <img src={image} alt="avatar" className="object-cover h-full w-full" />
    ) : (
      <FaUser className="text-gray-400 h-full w-full" />
    );

    // Conditionally render hover overlay
    const hoverOverlay = (
      <div
        className={`absolute top-0 left-0 ${avatarSizeClasses} bg-photopicker-overlay-background rounded-full flex items-center justify-center flex-col text-center gap-2 ${hover ? "visible" : "hidden"}`}
        onClick={showContextMenu}
      >
        <FaCamera className="text-2xl" />
        <span>Change <br /> Profile <br /> Photo</span>
      </div>
    );

    return (
      <div
        className={avatarClasses}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {hover && type === "xl"  && hoverOverlay}
        <div className={`flex items-center justify-center ${avatarSizeClasses} rounded-full overflow-hidden`}>
          {imageElement}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-center">
        {renderAvatar()}
      </div>

      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          coordinates={contextMenuCoordinates}
          setContextMenu={setIsContextMenuVisible}
        />
      )}

      {/* Hidden file input for image upload */}
      <input
        id="file-input"
        type="file"
        accept="image/*"
        style={{ display: "none" }} 
        onChange={handlePhotoPickerChange}
      />

      {showPhotoLibrary && (
        <PhotoLibrary
          setImage={setImage}
          hidePhotoLibrary={togglePhotoLibrary}
          setIsEditingImage={setIsEditingImage}
          setImageFile={setImageFile}
        />
      )}
    </>
  );
}