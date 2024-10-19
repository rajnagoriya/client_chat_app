import React from "react";
import { IoClose } from "react-icons/io5";

export default function PhotoLibrary({
  setImage,
  hidePhotoLibrary,
  setIsEditingImage,
  setImageFile,
}) {
  const images = [
    "/avatars/1.png",
    "/avatars/2.png",
    "/avatars/3.png",
    "/avatars/4.png",
    "/avatars/5.png",
    "/avatars/6.png",
    "/avatars/7.png",
    "/avatars/8.png",
    "/avatars/9.png",
  ];

  const handleImageSelect = async (image, index) => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();

      // Create a File object from the blob
      const file = new File([blob], `avatar-${index}.png`, { type: blob.type });

      // Set image preview
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);

      // Set the selected file for the form submission
      setImageFile(file);
      setIsEditingImage(true);
      hidePhotoLibrary(false);
    } catch (error) {
      console.error("Error fetching the image:", error);
    }
  };

  return (
    <div className="fixed inset-0 h-full w-full flex justify-center items-center">
      <div className="bg-gray-900 rounded-lg p-4 gap-6">
        <div
          className="flex justify-end cursor-pointer"
          onClick={() => hidePhotoLibrary(false)}
        >
          <IoClose className="h-10 w-10" />
        </div>
        <div className="grid grid-cols-3 gap-16">
          {images.map((image, index) => (
            <div
              onClick={() => handleImageSelect(image, index)}
              className="cursor-pointer"
              key={image}
            >
              <img src={image} alt={`avatar-${index}`} className="h-24 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}