import React from "react";

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CropShape = "circle" | "square" | "rectangle";
export type OutputImageType = "png" | "jpeg" | "webp";
export type CropCompleteCallback = (
  area: CropArea,
  croppedImageData?: string
) => void;

export interface ThemeOptions {
  backgroundColor?: string;
  overlayColor?: string;
  borderColor?: string;
  accentColor?: string;
  textColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
}

export interface ProfileCropperProps {
  // Core functionality
  initialImage?: string;
  onSave?: (imageData: string) => void;
  onCancel?: () => void;
  cropShape?: CropShape;
  aspectRatio?: number;
  outputFormat?: OutputImageType;
  outputQuality?: number;

  // Style and appearance
  theme?: ThemeOptions;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  containerHeight?: number;

  // Features and controls
  maxZoom?: number;
  minZoom?: number;
  zoomStep?: number;
  allowZoom?: boolean;
  allowDrag?: boolean;

  // Text customization
  headerText?: string;
  previewText?: string;
  saveButtonText?: string;
  cancelButtonText?: string;
  loadingText?: string;
  uploadText?: string;
  uploadSubtext?: string;
  zoomLabel?: string;
  changeButtonText?: string;

  // Image constraints
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;

  // Component visibility controls
  showPreview?: boolean;
  previewSize?: number;
  showZoomControls?: boolean;
  showChangeButton?: boolean;

  // CSS class names
  containerClassName?: string;
  headerClassName?: string;
  previewContainerClassName?: string;
  buttonContainerClassName?: string;
  saveButtonClassName?: string;
  cancelButtonClassName?: string;
  errorContainerClassname?: string;
  errorTextClassname?: string;

  // Error handling
  onError?: (error: string) => void;
}
