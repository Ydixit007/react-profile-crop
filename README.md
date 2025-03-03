# React Profile Cropper

A flexible, customizable React component for cropping profile pictures with real-time preview.

<!-- [![npm version](https://img.shields.io/npm/v/react-profile-cropper.svg)](https://www.npmjs.com/package/react-profile-cropper) -->
<!-- [![License](https://img.shields.io/npm/l/react-profile-cropper.svg)](https://github.com/yourusername/react-profile-cropper/blob/main/LICENSE) -->

## Features

- 🖼️ Circular, square, or rectangular crop shapes
- 🔄 Real-time preview
- 📱 Responsive and mobile-friendly with touch support
- 🎚️ Zoom and drag controls
- 🎨 Fully customizable theming
- 📤 Multiple output formats (PNG, JPEG, WebP)
- ⚙️ Configurable aspect ratio
- 🔍 Error handling for file types and size

## Installation

```bash
npm install react-profile-cropper
# or
yarn add react-profile-cropper
```

## Basic Usage

```jsx
import React from "react";
import { ProfileCropper } from "react-profile-cropper";

function App() {
  return (
    <div className="app">
      <ProfileCropper
        onSave={(imageData) => {
          console.log("Cropped image:", imageData);
          // Save to server or state
        }}
      />
    </div>
  );
}

export default App;
```

## Advanced Usage

```jsx
import React, { useState } from "react";
import { ProfileCropper } from "react-profile-cropper";

function ProfileEditor() {
  const [profileImage, setProfileImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleSave = (imageData) => {
    setProfileImage(imageData);
    setShowCropper(false);
    // Upload to server
  };

  return (
    <div className="profile-editor">
      {profileImage ? (
        <div className="current-profile">
          <img src={profileImage} alt="Profile" className="profile-image" />
          <button onClick={() => setShowCropper(true)}>Change Picture</button>
        </div>
      ) : (
        <button onClick={() => setShowCropper(true)}>
          Add Profile Picture
        </button>
      )}

      {showCropper && (
        <div className="cropper-modal">
          <ProfileCropper
            initialImage={profileImage}
            onSave={handleSave}
            onCancel={() => setShowCropper(false)}
            cropShape="circle"
            outputFormat="png"
            maxFileSizeMB={2}
            theme={{
              accentColor: "#4a90e2",
              buttonBackgroundColor: "#4a90e2",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ProfileEditor;
```

## Custom Theming

```jsx
import { ProfileCropper } from "react-profile-cropper";

const customTheme = {
  backgroundColor: "#ffffff",
  overlayColor: "rgba(0, 0, 0, 0.7)",
  borderColor: "#cccccc",
  accentColor: "#ff5722",
  textColor: "#333333",
  buttonBackgroundColor: "#ff5722",
  buttonTextColor: "white",
};

function App() {
  return (
    <ProfileCropper
      theme={customTheme}
      // other props...
    />
  );
}
```

## Props

### Core Functionality

| Prop            | Type                                  | Default     | Description                              |
| --------------- | ------------------------------------- | ----------- | ---------------------------------------- |
| `initialImage`  | `string`                              | `undefined` | Base64 or URL of initial image to crop   |
| `onSave`        | `(imageData: string) => void`         | `undefined` | Callback when save button is clicked     |
| `onCancel`      | `() => void`                          | `undefined` | Callback when cancel button is clicked   |
| `cropShape`     | `'circle' \| 'square' \| 'rectangle'` | `'circle'`  | Shape of the crop area                   |
| `aspectRatio`   | `number`                              | `undefined` | Aspect ratio of crop area (width/height) |
| `outputFormat`  | `'png' \| 'jpeg' \| 'webp'`           | `'png'`     | Output image format                      |
| `outputQuality` | `number`                              | `0.9`       | Output image quality (0-1)               |

### Style and Appearance

| Prop              | Type                  | Default   | Description                          |
| ----------------- | --------------------- | --------- | ------------------------------------ |
| `theme`           | `ThemeOptions`        | See below | Theme customization object           |
| `size`            | `number`              | `250`     | Size of the crop area (width in px)  |
| `className`       | `string`              | `''`      | Class name for the container element |
| `style`           | `React.CSSProperties` | `{}`      | Inline styles for the container      |
| `containerHeight` | `number`              | `350`     | Height of the container (px)         |

### Controls and Features

| Prop               | Type      | Default | Description                   |
| ------------------ | --------- | ------- | ----------------------------- |
| `maxZoom`          | `number`  | `4`     | Maximum zoom level            |
| `minZoom`          | `number`  | `0`     | Minimum zoom level            |
| `zoomStep`         | `number`  | `0.1`   | Step size for zoom controls   |
| `allowZoom`        | `boolean` | `true`  | Enable zoom controls          |
| `allowDrag`        | `boolean` | `true`  | Enable image dragging         |
| `showPreview`      | `boolean` | `true`  | Show preview of cropped image |
| `previewSize`      | `number`  | `120`   | Size of preview image (px)    |
| `showZoomControls` | `boolean` | `true`  | Show zoom slider              |
| `showChangeButton` | `boolean` | `true`  | Show button to change image   |

### Text Customization

| Prop               | Type     | Default                       | Description              |
| ------------------ | -------- | ----------------------------- | ------------------------ |
| `headerText`       | `string` | `'Profile Picture Cropper'`   | Header text              |
| `previewText`      | `string` | `'Preview'`                   | Text below preview image |
| `saveButtonText`   | `string` | `'Save Profile Picture'`      | Save button text         |
| `cancelButtonText` | `string` | `'Cancel'`                    | Cancel button text       |
| `loadingText`      | `string` | `'Saving...'`                 | Text shown when saving   |
| `uploadText`       | `string` | `'Click to upload image'`     | Upload area main text    |
| `uploadSubtext`    | `string` | `'JPG, PNG or GIF. Max 5MB.'` | Upload area subtext      |
| `zoomLabel`        | `string` | `'Zoom:'`                     | Label for zoom control   |
| `changeButtonText` | `string` | `'Change Image'`              | Change image button text |

### Image Constraints

| Prop                | Type     | Default     | Description                    |
| ------------------- | -------- | ----------- | ------------------------------ |
| `acceptedFileTypes` | `string` | `'image/*'` | Accepted file types for upload |
| `maxFileSizeMB`     | `number` | `5`         | Maximum file size in MB        |

### CSS Class Names

| Prop                        | Type     | Default | Description                   |
| --------------------------- | -------- | ------- | ----------------------------- |
| `containerClassName`        | `string` | `''`    | Class for the outer container |
| `headerClassName`           | `string` | `''`    | Class for the header text     |
| `previewContainerClassName` | `string` | `''`    | Class for preview container   |
| `buttonContainerClassName`  | `string` | `''`    | Class for button container    |
| `saveButtonClassName`       | `string` | `''`    | Class for save button         |
| `cancelButtonClassName`     | `string` | `''`    | Class for cancel button       |
| `errorContainerClassname`   | `string` | `''`    | Class for error container     |
| `errorTextClassname`        | `string` | `''`    | Class for error text          |

### Error Handling

| Prop      | Type                      | Default     | Description                   |
| --------- | ------------------------- | ----------- | ----------------------------- |
| `onError` | `(error: string) => void` | `undefined` | Callback when an error occurs |

## Default Theme

```javascript
{
  backgroundColor: "#f3f2ef",
  overlayColor: "rgba(0, 0, 0, 0.6)",
  borderColor: "#e0e0e0",
  accentColor: "#0077B5",
  textColor: "#333333",
  buttonBackgroundColor: "#0077B5",
  buttonTextColor: "white"
}
```

## TypeScript Support

The package includes TypeScript definitions. You can import the types:

```typescript
import {
  ProfileCropperProps,
  CropArea,
  ThemeOptions,
  CropShape,
  OutputImageType,
} from "react-profile-cropper";
```

## Development

### Building the package

```bash
npm run build
```

### Running tests

```bash
npm test
```

## License

MIT © [Your Name](https://github.com/yourusername)
