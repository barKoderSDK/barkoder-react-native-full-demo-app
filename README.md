# barKoder React Native Demo App

This repository contains a **public, free-to-use React Native demo application** showcasing the capabilities of the **barKoder Barcode Scanner SDK**.

The app is designed as a **reference implementation and learning tool** for developers who want to explore different barcode scanning modes, understand performance trade-offs, and see practical examples of advanced scanning features.

## Purpose of This Repository

This project exists to:

- Demonstrate how to integrate the barKoder SDK in a React Native app
- Showcase multiple barcode scanning modes and advanced features
- Serve as a **starting point or reference** for custom implementations
- Help developers compare scanning modes based on use case and performance

⚠️ This app is **not intended for production use**. It is a demo and reference application only.

## Features & Showcases

### Anyscan (Universal Mode)
Automatically scans all supported barcode types without prior configuration.

- Supports 1D, 2D, and specialized barcodes
- Useful when the barcode type is unknown
- Loads multiple scanning models, which may increase startup time on older devices

**Best for:** mixed or unknown barcode environments  
**For optimal performance:** use a dedicated scanning mode when possible

### All 1D Barcodes
Optimized mode for linear (1D) barcodes.

Examples include:
- EAN / UPC
- Code 128
- Code 39

**Benefits:**
- Faster scanning
- Lower CPU usage
- Ideal for retail, logistics, and inventory workflows


### All 2D Barcodes
Dedicated scanning mode for matrix-based barcodes.

Examples include:
- QR Code
- Data Matrix
- Aztec
- PDF417

**Benefits:**
- Faster than Anyscan when only 2D barcodes are expected
- Reduced processing overhead

### MRZ Scanning
Specialized mode for **Machine Readable Zone (MRZ)** detection.

Typical use cases:
- Passports
- National ID cards
- Driver licenses
- Boarding passes

**Notes:**
- Uses dedicated OCR models
- Should only be enabled when MRZ scanning is required
- Demonstrates document-focused scanning workflows

### DotCode Scanning
Scanning mode optimized for **DotCode** symbology.

Common use cases:
- Pharmaceutical packaging
- Industrial and manufacturing environments
- Inkjet-printed codes

**Benefits:**
- Improved detection on low-contrast or distorted prints

### Scan from Gallery
Allows scanning barcodes from images stored on the device.

- Supports photos and screenshots
- Useful for offline workflows or post-capture processing
- Image quality directly affects detection accuracy


### AR Scanning Mode
Augmented Reality showcase that visually highlights detected barcodes in real time.

**Purpose:**
- Demonstrates advanced tracking capabilities
- Visual feedback in multi-barcode environments
- Interactive scanning experience

This mode is intended as a **technology showcase**, not a production pattern.

## Continuous Scanning

The demo app supports **Continuous Scanning**, which can be enabled in **any scanning mode**.

When enabled, the scanner remains active after a successful scan and continues scanning additional barcodes automatically.

### How It Works
- Continuous Scanning is controlled via a **toggle in the Settings**
- A **Duplicate Delay** can be configured to control how often the same barcode can be reported again

### Duplicate Delay Options
The duplicate delay defines the minimum time between consecutive scans of the same barcode:

- **0 seconds** – scans as fast as the device allows  
  (on faster devices this may result in multiple scans per second)
- **1 second**
- **2 seconds**
- Up to **10 seconds**

### Use Cases
- High-throughput scanning
- Inventory counting
- Batch processing
- Industrial and logistics workflows

For optimal performance and accuracy, the duplicate delay should be chosen based on device speed and scanning environment.

## App Structure

The app is structured around **mode-based navigation**, where each scanning mode:

- Initializes only the required SDK components
- Demonstrates best-practice configuration
- Is isolated for easier understanding and experimentation

This approach allows developers to:
- Compare scanning behavior between modes
- Understand when to use each mode
- Avoid unnecessary model loading

## Performance Notes

- Universal modes load more models and may impact startup time on slower devices
- Dedicated modes are faster and more efficient
- Advanced modes (MRZ, AR) should only be enabled when needed
- Continuous scanning with a 0-second duplicate delay may significantly increase scan frequency on high-performance devices

## SDK License & Trial

The barKoder React Native Demo App is **free to use as a sample and reference project**.

However, the **barKoder Barcode Scanner SDK itself requires a valid license** in order to function.

### Trial License
To run the demo app and explore the scanning features, you can obtain a **free trial license** from:

https://barkoder.com/trial

The trial license allows you to:
- Test all supported scanning modes
- Explore performance and device compatibility
- Evaluate the SDK for your use case

### Production Use
For production applications or long-term use, a **commercial license** is required.

This repository does not include a license key. You must supply your own license when running the app.

## Requirements

- React Native environment (Android & iOS)
- Camera permissions
- Physical device recommended for best scanning performance

Some features may require additional configuration depending on platform and SDK setup.


## Usage

### Setting up the License Key

This app uses `react-native-dotenv` to manage environment variables. You need to provide a valid barKoder license key to run the app.

1.  Create a file named `.env` in the root directory of the project (same level as `package.json`).
2.  Add your license key to the file:

    ```env
    BARKODER_LICENSE_KEY=your_license_key_here
    ```

    > **Note:** You can obtain a free trial license from [https://barkoder.com/trial](https://barkoder.com/trial).

### Running the App

To start the application on a connected Android device or emulator:

```bash
npx react-native run-android
```

For iOS (macOS only):

```bash
npx react-native run-ios
```

### Building the Android APK

To build a release APK for Android:

1.  Navigate to the `android` directory:
    ```bash
    cd android
    ```
2.  Run the Gradle build command:
    ```bash
    gradlew :app:assembleRelease
    ```

The generated APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

## License

This repository is:
- **Public**
- **Free to use**
- Intended as a **demo and reference application**

You are free to:
- Clone
- Modify
- Use parts of the code in your own projects

Refer to the repository license for exact terms.

---

## Contributions

Contributions, improvements, and fixes are welcome.

If you find issues or want to enhance the demo:
- Open an issue
- Submit a pull request
- Suggest improvements to documentation or examples

---

## Additional Resources

For SDK documentation, integration guides, and feature details, refer to the official barKoder documentation and resources.
