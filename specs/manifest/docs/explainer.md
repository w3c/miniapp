# MiniApp Manifest explainer

> Note: This document serves as a supplementary explanation of the [MiniApp Manifest](https://github.com/w3c/miniapp/tree/gh-pages/specs/manifest/) spec. If there is any inconsistency with the spec, you should consider the spec to be authoritative.

## Authors

Shouren Lan, Zhiqiang Yu, Xiaofeng zhang

## 1. Introduction

### What is this?

MiniApp Manifest defines a JSON-based profile file that provides developers with a centralized place to put essential information associated with a MiniApp ([What is MiniApp?](https://w3c.github.io/miniapp/white-paper/#what-is-miniapp)). In fact, every MiniApp must have a manifest file which describles essential information about MiniApp to build tools, host platform, users, and app market.

### Why should we care?

Manifest, as the manifest file of MiniApp, includes configuration information that is neccessary for application development, release, installation and running, such as desktop display, application ID, version management, version upgrade, permission statement and UX configuration, etc.

## 2. Manifest Design

To ensure the overall design requirements of [MiniApp Packaging](https://w3c.github.io/miniapp/specs/packaging/), [MiniApp Widget](https://w3c.github.io/miniapp/specs/widget-req/), and [MiniApp URI Scheme](https://w3c.github.io/miniapp/specs/uri/) are met, the manifest file of MiniApp should contain basic information of the application, page routing scope, window configuration information and widget configuration information, etc.

### Key Considerations

#### Why is basic information needed?

* Home screen display: Show the name and icon of the application to users by `appName` and `icon`.
* Locales: Set different languages ​​and text directions to meet the localization requirement by `lang` and `dir`.
* Version management: Show version information of MiniApp, control application and device compatibility to users by `versionName`.
* Version upgrade: Provide maintainability and security of MiniApp by `versionCode`.
* Permission statement: Declare the necessary permissions required for running MiniApp, such as geolocation, storage, camera, etc.

#### Why are pages and window needed?

* The [pages](https://w3c.github.io/miniapp/specs/manifest/#pages) array needs to cover all the pages included in the MiniApp and specify a reasonable page jump range and home page settings.
* The [window](https://w3c.github.io/miniapp/specs/manifest/#window) object needs to cover the basic elements of the MiniApp window, such as the status bar, navigation bar, title and window style, etc.

#### Why is `widgets` needed?

Widgets can be embedded in various local applications, and directly display the content that the user is most concerned about in an interactive way to better meet the user's requirements.

## 3. Sample

So far only a basic subset of MiniApp Manifest is listed, which will be gradually updated and supplemented according to the demands of different scenarios.

```json
{
  "dir": "ltr",
  "lang": "en-US",
  "appID": "org.w3c.miniapp",
  "appName": "MiniApp Demo",
  "shortName": "MiniApp",
  "versionName": "1.0.0",
  "versionCode": 1,
  "description": "A Simple MiniApp Demo",
  "icons": [
    {
      "src": "common/icon/icon.png",
      "sizes": "48x48"
    }
  ],
  "minPlatformVersion": "1.0.0",
  "pages": [
    "pages/index/index",
    "pages/detail/detail"
  ],
  "window": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "Demo",
    "navigationBarBackgroundColor": "#f8f8f8",
    "backgroundColor": "#ffffff",
    "fullscreen": false
  },
  "widgets": [
    {
      "name": "widget",
      "path": "widgets/index/index",
      "minPlatformVersion": "1.0.0"
    }
  ]
}
```

## References & acknowledgements

In the process of writing the MiniApp Manifest specification, many people have given valuable comments, thank you all.

The following name list will be continuously updated, in the order of alphabetical.

* Chun Wang
* Changjun Yang
* ...
