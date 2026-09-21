# barKoder React Native Barcode Scanner SDK

Add native, enterprise-grade barcode scanning to **React Native applications for Android and iOS** with the official barKoder React Native package. The plugin bridges React Native applications to the barKoder native scanning engine so developers can build fast barcode capture directly into logistics, retail, manufacturing, automotive, identity and inventory workflows.

barKoder supports common 1D and 2D symbologies together with advanced modes for difficult real-world barcodes, multi-code capture and specialized data capture.

## Quick links

- **React Native Barcode Scanner SDK:** [https://barkoder.com/barcode-scanner-sdk/frameworks/react-native](https://barkoder.com/barcode-scanner-sdk/frameworks/react-native)
- **npm package:** [https://www.npmjs.com/package/barkoder-react-native](https://www.npmjs.com/package/barkoder-react-native)
- **Installation guide:** [https://barkoder.com/docs/v1/react-native/react-native-installation](https://barkoder.com/docs/v1/react-native/react-native-installation)
- **Examples:** [https://barkoder.com/docs/v1/react-native/react-native-examples](https://barkoder.com/docs/v1/react-native/react-native-examples)
- **API reference:** [https://barkoder.com/docs/v1/react-native/react-native-api-reference](https://barkoder.com/docs/v1/react-native/react-native-api-reference)
- **Full demo app:** [https://github.com/barKoderSDK/barkoder-react-native-full-demo-app](https://github.com/barKoderSDK/barkoder-react-native-full-demo-app)
- **Free trial:** [https://barkoder.com/trial](https://barkoder.com/trial)

## Key capabilities

barKoder is designed for production barcode capture workflows where speed and decode reliability matter. Depending on the license and configuration, the SDK supports capabilities such as:

- 30+ 1D and 2D barcode symbologies, including QR Code, Data Matrix, PDF417, Code 128, Code 39, EAN/UPC, Aztec, DotCode and GS1 formats
- [Direct Part Marking (DPM) scanning](https://barkoder.com/barcode-scanner-sdk/dpm) for difficult Data Matrix codes on metal, plastic and other industrial surfaces
- [Batch MultiScan](https://barkoder.com/barcode-scanner-sdk/batch-multiscan) for decoding multiple barcodes in a single camera view
- [VIN barcode scanning](https://barkoder.com/barcode-scanner-sdk/vin-scanning) for automotive workflows
- [MRZ scanning](https://barkoder.com/barcode-scanner-sdk/mrz) for passports, ID cards and travel documents
- Continuous scanning, image/gallery scanning and configurable regions of interest
- Advanced decoding for damaged, deformed, low-quality and blurry barcodes
- On-device scanning for normal mobile scanning workflows

For the complete feature set and platform-specific configuration options, use the official documentation linked below.


## Installation

Install from npm:

```bash
npm install barkoder-react-native
```

or Yarn:

```bash
yarn add barkoder-react-native
```

Import the plugin in your React Native code:

```javascript
import { Barkoder, BarkoderView } from 'barkoder-react-native';
```

Complete the Android and iOS native setup described in the [React Native installation guide](https://barkoder.com/docs/v1/react-native/react-native-installation). Camera access requires the appropriate permissions on each platform; on iOS, include `NSCameraUsageDescription` in `Info.plist`.

## Examples

Use the official resources for current integration patterns:

- [React Native examples](https://barkoder.com/docs/v1/react-native/react-native-examples)
- [React Native API reference](https://barkoder.com/docs/v1/react-native/react-native-api-reference)
- [Full React Native demo app](https://github.com/barKoderSDK/barkoder-react-native-full-demo-app)

## Trial license

You can evaluate barKoder in your own application with a free trial license:

**[Get a free barKoder SDK trial](https://barkoder.com/trial)**

The SDK can be initialized without a valid license for integration testing, but decoded results may be partially masked or marked as unlicensed. Use a valid trial or production license for complete results and licensed functionality.

Do not publish a trial license in a production application or public source repository.


## Support

Need help with integration or testing?

- Documentation: [https://barkoder.com/docs/v1/home](https://barkoder.com/docs/v1/home)
- Technical support: [support@barkoder.com](mailto:support@barkoder.com)
- Sales and licensing: [sales@barkoder.com](mailto:sales@barkoder.com)

## License

See the `LICENSE` file in this repository for the terms applicable to the repository contents. Use of the barKoder SDK itself is subject to the applicable barKoder license agreement.
