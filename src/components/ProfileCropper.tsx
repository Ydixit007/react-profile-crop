import React, { useState, useRef, useEffect, useCallback } from "react";
import { ProfileCropperProps, CropArea, ThemeOptions } from "../types";
import { getDefaultTheme } from "../utils/theme";

const ProfileCropper: React.FC<ProfileCropperProps> = ({
  initialImage,
  onSave,
  onCancel,
  theme,
  cropShape = "circle",
  aspectRatio,
  outputFormat = "png",
  outputQuality = 0.9,
  headerText = "Profile Picture Cropper",
  previewText = "Preview",
  saveButtonText = "Save Profile Picture",
  cancelButtonText = "Cancel",
  loadingText = "Saving...",
  showPreview = true,
  previewSize = 120,
  containerClassName = "",
  headerClassName = "",
  previewContainerClassName = "",
  buttonContainerClassName = "",
  saveButtonClassName = "",
  cancelButtonClassName = "",

  // Add CircularImageCropper props directly to ProfileCropper
  size = 250,
  className = "",
  style = {},
  containerHeight = 350,
  maxZoom = 4,
  minZoom = 0,
  zoomStep = 0.1,
  allowZoom = true,
  allowDrag = true,
  uploadText = "Click to upload image",
  uploadSubtext = "JPG, PNG or GIF. Max 5MB.",
  zoomLabel = "Zoom:",
  changeButtonText = "Change Image",
  acceptedFileTypes = "image/*",
  maxFileSizeMB = 5,
  showZoomControls = true,
  showChangeButton = true,
  onError,
  errorContainerClassname = "",
  errorTextClassname = "",
}) => {
  // Merge the theme with defaults
  const mergedTheme = { ...getDefaultTheme(), ...theme };

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialScaleRef = useRef<number | null>(null);

  // State
  const [src, setSrc] = useState<string>(initialImage || "");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [crop, setCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: size,
    height: aspectRatio ? size / aspectRatio : size,
  });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dragging, setDragging] = useState(false);
  const [scale, setScale] = useState(minZoom);
  const [showUpload, setShowUpload] = useState(!initialImage);
  const [error, setError] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [croppedImageData, setCroppedImageData] = useState<string | undefined>(
    initialImage
  );
  const [isSaving, setIsSaving] = useState(false);

  // Calculate initial scale to fit image within container
  const calculateInitialScale = useCallback(
    (
      imgWidth: number,
      imgHeight: number,
      containerWidth: number,
      containerHeight: number
    ) => {
      const scaleX = containerWidth / imgWidth;
      const scaleY = containerHeight / imgHeight;
      return Math.min(scaleX, scaleY, 1);
    },
    []
  );

  // Generate crop data and notify parent
  const handleCropComplete = useCallback(
    (area: CropArea, imageData?: string) => {
      setCropArea(area);
      if (imageData) {
        setCroppedImageData(imageData);
      }
    },
    []
  );

  // Initialize crop area and image position when image loads
  useEffect(() => {
    if (imageLoaded && imageRef.current && containerRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();

      // Calculate the initial scale to fit the image
      const initialScale = calculateInitialScale(
        naturalWidth,
        naturalHeight,
        containerRect.width,
        containerRect.height
      );

      initialScaleRef.current = initialScale;
      const effectiveScale = scale === 0 ? initialScale : scale;

      // Calculate the scaled dimensions
      const scaledWidth = naturalWidth * effectiveScale;
      const scaledHeight = naturalHeight * effectiveScale;

      // Center the image initially
      const centerX = (containerRect.width - scaledWidth) / 2;
      const centerY = (containerRect.height - scaledHeight) / 2;

      // Set crop area to center of container
      const cropX = (containerRect.width - crop.width) / 2;
      const cropY = (containerRect.height - crop.height) / 2;

      if (scale === minZoom) {
        setScale(0);
      }

      setImagePosition({ x: centerX, y: centerY });
      setCrop({ ...crop, x: cropX, y: cropY });

      // Generate initial crop
      generateCropData({ x: centerX, y: centerY }, effectiveScale, {
        ...crop,
        x: cropX,
        y: cropY,
      });
    }
  }, [
    imageLoaded,
    size,
    scale,
    minZoom,
    calculateInitialScale,
    crop.width,
    crop.height,
  ]);

  // Generate crop data and notify parent
  const generateCropData = useCallback(
    (
      imgPos: { x: number; y: number },
      imgScale: number,
      cropArea: CropArea
    ) => {
      const croppedDataUrl = getCroppedImageData(imgPos, imgScale, cropArea);
      handleCropComplete(cropArea, croppedDataUrl);
    },
    [handleCropComplete]
  );

  const handleImageLoad = () => {
    setImageLoaded(true);
    setShowUpload(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Please upload an image file";
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    // Check file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      const errorMsg = `Image must be less than ${maxFileSizeMB}MB`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    // Clear any previous errors
    setError(null);

    // Read the file and set it as the image source
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const result = readerEvent.target?.result as string;
      setSrc(result);
      setImageLoaded(false);
      setScale(0);
    };
    reader.readAsDataURL(file);
  };

  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!allowDrag || !imageRef.current || !containerRef.current) return;

      // Start dragging the image
      setDragging(true);
      setDragStart({ x: clientX, y: clientY });
    },
    [allowDrag]
  );

  const handleDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (
        !allowDrag ||
        !dragStart ||
        !dragging ||
        !imageRef.current ||
        !containerRef.current
      )
        return;

      // Calculate movement delta
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;

      // Update drag start point for next move
      setDragStart({ x: clientX, y: clientY });

      // Update image position
      const newPosition = {
        x: imagePosition.x + deltaX,
        y: imagePosition.y + deltaY,
      };

      setImagePosition(newPosition);

      // Get effective scale (if 0, use initialScale)
      const effectiveScale =
        scale === 0 && initialScaleRef.current
          ? initialScaleRef.current
          : scale;

      // Generate crop data with the new image position
      generateCropData(newPosition, effectiveScale, crop);
    },
    [
      allowDrag,
      dragStart,
      dragging,
      crop,
      generateCropData,
      imagePosition,
      scale,
    ]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDrag(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
      setDragStart(null);
    }
  };

  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!allowZoom) return;

    const newScale = parseFloat(e.target.value);

    if (imageRef.current && containerRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;

      // Get current effective scale
      const currentEffectiveScale =
        scale === 0 && initialScaleRef.current
          ? initialScaleRef.current
          : scale;

      // Get new effective scale
      const newEffectiveScale =
        newScale === 0 && initialScaleRef.current
          ? initialScaleRef.current
          : newScale;

      // Calculate current center of visible area
      const visibleCenterX = crop.x + crop.width / 2 - imagePosition.x;
      const visibleCenterY = crop.y + crop.height / 2 - imagePosition.y;

      // Calculate ratio of center to current scaled dimensions
      const ratioX = visibleCenterX / (naturalWidth * currentEffectiveScale);
      const ratioY = visibleCenterY / (naturalHeight * currentEffectiveScale);

      // Calculate new center based on new scale
      const newCenterX = ratioX * (naturalWidth * newEffectiveScale);
      const newCenterY = ratioY * (naturalHeight * newEffectiveScale);

      // Calculate new position that keeps the same center point visible
      const newX = crop.x + crop.width / 2 - newCenterX;
      const newY = crop.y + crop.height / 2 - newCenterY;

      // Update state
      setScale(newScale);
      setImagePosition({ x: newX, y: newY });

      // Generate crop data
      generateCropData({ x: newX, y: newY }, newEffectiveScale, crop);
    }
  };

  const getCroppedImageData = (
    imgPos: { x: number; y: number },
    imgScale: number,
    cropArea: CropArea
  ): string => {
    if (!imageRef.current || !canvasRef.current) return "";

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    // Set canvas size to crop size
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create clipping path based on cropShape
    ctx.beginPath();
    if (cropShape === "circle") {
      ctx.arc(
        cropArea.width / 2,
        cropArea.height / 2,
        Math.min(cropArea.width, cropArea.height) / 2,
        0,
        2 * Math.PI
      );
    } else {
      // For square or rectangle
      ctx.rect(0, 0, cropArea.width, cropArea.height);
    }
    ctx.clip();

    // Calculate the source rectangle (area of the original image to take)
    const sourceX = (cropArea.x - imgPos.x) / imgScale;
    const sourceY = (cropArea.y - imgPos.y) / imgScale;
    const sourceWidth = cropArea.width / imgScale;
    const sourceHeight = cropArea.height / imgScale;

    // Draw image with proper scaling and position
    ctx.drawImage(
      imageRef.current,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    // Return the data URL
    const formatMap = {
      png: "image/png",
      jpeg: "image/jpeg",
      webp: "image/webp",
    };

    return canvas.toDataURL(formatMap[outputFormat], outputQuality);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const saveCroppedImage = async () => {
    if (croppedImageData) {
      setIsSaving(true);

      try {
        if (onSave) {
          await onSave(croppedImageData);
        } else {
          // Default behavior: download the image
          const link = document.createElement("a");
          link.href = croppedImageData;
          link.download = `profile-picture.${outputFormat}`;
          link.click();
        }
      } catch (error) {
        console.error("Error saving image:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Get the effective scale for display (if 0, use initial scale)
  const effectiveScale =
    scale === 0 && initialScaleRef.current ? initialScaleRef.current : scale;

  // Styles with theme support
  const containerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    maxWidth: "100%",
    userSelect: "none",
    backgroundColor: mergedTheme.backgroundColor,
    border: `1px solid ${mergedTheme.borderColor}`,
    borderRadius: "8px",
    height: `${containerHeight}px`,
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    position: "absolute",
    left: `${imagePosition.x}px`,
    top: `${imagePosition.y}px`,
    transform: `scale(${effectiveScale})`,
    transformOrigin: "0 0",
    cursor: allowDrag ? (dragging ? "grabbing" : "grab") : "default",
    display: src && imageLoaded ? "block" : "none",
    maxWidth: "none",
  };

  const cropWindowStyle: React.CSSProperties = {
    position: "absolute",
    left: `${crop.x}px`,
    top: `${crop.y}px`,
    width: `${crop.width}px`,
    height: `${crop.height}px`,
    borderRadius: cropShape === "circle" ? "50%" : "0",
    boxShadow: `0 0 0 1000px ${mergedTheme.overlayColor}`,
    pointerEvents: "none",
    overflow: "hidden",
  };

  const borderStyle: React.CSSProperties = {
    position: "absolute",
    left: `${crop.x - 7.5}px`,
    top: `${crop.y - 7.5}px`,
    width: `${crop.width + 10}px`,
    height: `${crop.height + 10}px`,
    border: "2px dashed rgba(255, 255, 255, 0.8)",
    borderRadius: cropShape === "circle" ? "50%" : "0",
    pointerEvents: "none",
  };

  return (
    <div
      className={`profile-cropper-container ${containerClassName}`}
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {headerText && (
        <h1
          className={`profile-cropper-header ${headerClassName}`}
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "#333333",
            textAlign: "center",
          }}
        >
          {headerText}
        </h1>
      )}

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Upload area */}
      <div
        className={`upload-container ${showUpload ? "visible" : "hidden"}`}
        onClick={triggerFileInput}
        style={{
          display: showUpload ? "flex" : "none",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          cursor: "pointer",
          backgroundColor: "#f7f7f7",
          border: `2px dashed ${mergedTheme.borderColor}`,
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <div
          className="upload-icon"
          style={{ fontSize: "40px", marginBottom: "10px", color: "#888" }}
        >
          📷
        </div>
        <div
          className="upload-text"
          style={{
            fontSize: "16px",
            color: mergedTheme.textColor,
            marginBottom: "5px",
          }}
        >
          {uploadText}
        </div>
        <div
          className="upload-subtext"
          style={{ fontSize: "12px", color: "#888" }}
        >
          {uploadSubtext}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className={`error-container ${errorContainerClassname}`}
          style={{ textAlign: "center", margin: "10px 0" }}
        >
          <div
            className={`error-text ${errorTextClassname}`}
            style={{ color: "red", fontSize: "14px" }}
          >
            {error}
          </div>
        </div>
      )}

      {/* Image cropper */}
      {src && (
        <>
          <div
            ref={containerRef}
            className={className}
            style={containerStyle}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              handleDragStart(touch.clientX, touch.clientY);
              e.preventDefault();
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              handleDrag(touch.clientX, touch.clientY);
            }}
            onTouchEnd={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={src}
              alt="Crop"
              onLoad={handleImageLoad}
              style={imageStyle}
              draggable={false}
            />

            {imageLoaded && (
              <>
                {/* Semi-transparent overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                  }}
                />

                {/* Fixed crop area */}
                <div style={cropWindowStyle} />

                {/* Dashed border */}
                <div style={borderStyle} />
              </>
            )}
          </div>

          {/* Controls */}
          {imageLoaded && (
            <>
              {/* Zoom control */}
              {showZoomControls && (
                <div
                  className="zoom-controls"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "10px 0",
                  }}
                >
                  <span
                    style={{
                      marginRight: "10px",
                      fontSize: "14px",
                      color: mergedTheme.textColor,
                    }}
                  >
                    {zoomLabel}
                  </span>
                  <input
                    type="range"
                    min={minZoom}
                    max={maxZoom}
                    step={zoomStep}
                    value={scale}
                    onChange={handleZoom}
                    style={{
                      accentColor: mergedTheme.accentColor,
                      width: "100%",
                    }}
                    disabled={!allowZoom}
                  />
                </div>
              )}

              {/* Change image button */}
              {showChangeButton && (
                <button
                  className="change-button"
                  onClick={triggerFileInput}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: mergedTheme.buttonBackgroundColor,
                    color: mergedTheme.buttonTextColor,
                    border: `1px solid ${mergedTheme.borderColor}`,
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    margin: "10px 0",
                    display: "block",
                  }}
                >
                  {changeButtonText}
                </button>
              )}
            </>
          )}
        </>
      )}

      {showPreview && croppedImageData && (
        <div
          className={`preview-container ${previewContainerClassName}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "20px 0",
          }}
        >
          <img
            src={croppedImageData}
            alt="Preview"
            style={{
              width: `${previewSize}px`,
              height: `${previewSize}px`,
              borderRadius: cropShape === "circle" ? "50%" : "0",
              objectFit: "cover",
              border: `1px solid ${mergedTheme.borderColor}`,
              marginBottom: "10px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          />
          {previewText && (
            <span style={{ fontSize: "14px", color: mergedTheme.textColor }}>
              {previewText}
            </span>
          )}
        </div>
      )}

      <div
        className={`button-container ${buttonContainerClassName}`}
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        {onCancel && (
          <button
            className={`cancel-button ${cancelButtonClassName}`}
            onClick={onCancel}
            disabled={isSaving}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f0f0f0",
              color: "#333",
              border: "none",
              borderRadius: "4px",
              cursor: isSaving ? "not-allowed" : "pointer",
              fontWeight: "bold",
              opacity: isSaving ? 0.5 : 1,
            }}
          >
            {cancelButtonText}
          </button>
        )}

        <button
          className={`save-button ${saveButtonClassName}`}
          onClick={saveCroppedImage}
          disabled={!croppedImageData || isSaving}
          style={{
            padding: "10px 20px",
            backgroundColor: mergedTheme.buttonBackgroundColor,
            color: mergedTheme.buttonTextColor,
            border: "none",
            borderRadius: "4px",
            cursor: croppedImageData && !isSaving ? "pointer" : "not-allowed",
            fontWeight: "bold",
            opacity: croppedImageData && !isSaving ? 1 : 0.5,
            transition: "all 0.2s ease",
          }}
        >
          {isSaving ? loadingText : saveButtonText}
        </button>
      </div>
    </div>
  );
};

export default ProfileCropper;
