# MiniApp Manifest explainer

> Note: This document serves as a supplementary explanation of the [MiniApp Manifest](https://github.com/w3c/miniapp/tree/gh-pages/specs/manifest/) spec. If there is any inconsistency with the spec, you should consider the spec to be authoritative.

## Authors

Shouren Lan, Zhiqiang Yu, Xiaofeng zhang, Yongjing Zhang

## 1. Introduction

### What is this?

MiniApp Manifest defines a JSON-based profile file that provides developers with a centralized place to put essential information associated with a MiniApp ([What is MiniApp?](https://w3c.github.io/miniapp/white-paper/#what-is-miniapp)). In fact, every MiniApp must have a manifest file which describes essential information about MiniApp to build tools, host platform, users, and app market.

### Why should we care?

Manifest, as the manifest file of MiniApp, includes configuration information that is necessary for application development, release, installation and running, such as desktop display, application ID, version management, version upgrade, permission statement and UX configuration, etc.

## 2. Manifest Design

To ensure the overall design requirements of [MiniApp Packaging](https://w3c.github.io/miniapp/specs/packaging/), [MiniApp Widget](https://w3c.github.io/miniapp/specs/widget-req/), and [MiniApp URI Scheme](https://w3c.github.io/miniapp/specs/uri/) are met, the manifest file of MiniApp should contain basic information of the application, page routing scope, window configuration information and widget configuration information, etc.

### Key Considerations

#### Why is the basic metadata needed?

* Home screen display: Show the name and icon of the application to users by `appName` and `icon`.
* Locales: Set different languages ​​and text directions to meet the localization requirement by `lang` and `dir`.
* Version management: Show version information of MiniApp, control application and device compatibility to users by `versionName`.
* Version upgrade: Provide maintainability and security of MiniApp by `versionCode`.
* Permission statement: Declare the necessary permissions required for running MiniApp, such as geolocation, storage, camera, etc.

#### Why are `pages` and `window` needed?

* The [pages](https://w3c.github.io/miniapp/specs/manifest/#pages) array needs to cover all the pages included in the MiniApp and specify a reasonable page jump range and home page settings.
* The [window](https://w3c.github.io/miniapp/specs/manifest/#window) object needs to cover the basic elements of the MiniApp window, such as the status bar, navigation bar, title and window style, etc.

#### Why is `widgets` needed?

Widgets can be embedded in various local applications, and directly display the content that the user is most concerned about in an interactive way to better meet the user's requirements.

## 3. Sample

So far only a basic subset of MiniApp Manifest is specified. It will be gradually updated and supplemented according to the demands of different scenarios.

```json
{
  "dir": "ltr",
  "lang": "en-US",
  "appID": "org.example.miniApp1",
  "appName": "My MiniApp Demo",
  "shortName": "Demo X",
  "versionName": "1.0.0",
  "versionCode": 1,
  "description": "A Simple MiniApp Demo",
  "icon": [
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

## 4. Relationship with Web App Manifest
The MiniApp manifest is developed in the way that it covers the most common practices in the  target ecosystems like 'Mini Program' [[1]](https://smartprogram.baidu.com/developer/index.html)[[2]](https://open.alipay.com/channel/miniIndex.htm)[[3]](https://mp.weixin.qq.com/cgi-bin/wx) and [Quick App](https://www.quickapp.cn/), while trying to be aligned (compatible) as much as possible with other ongoing web standard development i.e. [Web App Manifest](https://www.w3.org/TR/appmanifest/). Therefore common elements (e.g. `dir`, `lang`) or counterparts (e.g. `shortName` vs. `short_name`) can be found in both manifest specifications. A detailed comparison given in appendix [A](#a-miniapp-manifest-comparison-with-web-app-manifest).

On the other hand, MiniApp manifest has different assumptions on the hosting platforms and the form of application from those of Web App Manifest, so there are aspects that are not matched:
1. **Platform difference:** MiniApp needs to cover the cases that the application hosting platforms are not based on the web/browser, such as a native OS or a hosting application running on top of the OS. The software architecture is more like a native application rather than a web application (although it leverages some web technologies). Therefore, a MiniApp manifest needs to manage the compatibility more strictly between its application version and the platform version than that in the web environment. Member properties such as `versionName`, `versionCode` and `minPlatformVersion` are specified for that purpose, but are not necessary for a web application. 
2. **Application form difference:** A MiniApp typically consists of a set of pages and/or widgets. A MiniApp page/widget is similar to a web page in the sense of developing techniques (e.g. JS, CSS), but is different in many other ways like the life-cycle, the layout, components and system APIs. More importantly, these pages/widgets are organically composed views/activities of the MiniApp rather than independent web pages. The MiniApp manifest needs to provide means to organize and configure them into a common look and feel (e.g. navigation bar, scrolling behavior, width adaptation) by the properties like `window`, `pages` and `widgets`.

As both work are still under development, it worths further evaluating the possibilities of alignment from each side. From MiniApp perspective, further study could be investigating the usability of some unmapped member properties (such as `categories`, `screenshots`) of Web App Manifest in the context of MiniApp.



## A. MiniApp Manifest comparison with Web App Manifest
The following table mainly describes the comparison between the manifest properties in Mini App and Web App. "-" in the table means that there is no such property in the corresponding manifest.

[Mini App Manifest](https://www.w3.org/TR/appmanifest/)| [Web App Manifest](https://www.w3.org/TR/appmanifest/) |	Comparison 
:---    |:--        |:---
dir	    |   dir     |	Same
lang    |	lang    |	Same
appID	|-          |	MiniApp only
appName	|name       |	Same
shortName	|short_name|	Same
description	|description|	Same
icons	|icons	| Same
versionName	|-	| MiniApp only
versionCode	|-	| MiniApp only
minPlatformVersion	|-	|MiniApp only
pages	|scope	| Similar. `pages` lists the local URIs to the app pages of a MiniApp while the `scope` in Web App can vary from a local URL to a remote URL.  
pages.[0]	|start_url	| Different but comparable. The first element of `pages` represents the starting page in MiniApp instead of an explicit URL.
window  |-  | MiniApp only. `window` contains a set of properties for the default configuration of MiniApp pages and widgets. Most of them are unique to MiniApp except for a few that are mappable to Web App Manifest.(See below.)
window.backgroundColor	|background_color	|Similar. MiniApp accepts only 'HexColor' for now.
window.orientation	|orientation	|Same
window.fullscreen	|display=fullscreen	|Same but in different formation (boolean vs enum). 
widgets	|-	|MiniApp only
\-	|theme_color	|Web App only.  (For further study in MiniApp)
\-	|iarc_rating_id	| Web App only. (For further study in MiniApp)
\-	|related_applications	| Web App only (For further study in MiniApp)
\-	|prefer_related_applications	| Web App only (For further study in MiniApp)
\-	|categories	| Web App only.  (For further study in MiniApp)
\-	|screenshots	| Web App only.  (For further study in MiniApp)
\-	|shortcuts	| Web App only  (For further study in MiniApp)

## References & acknowledgements

In the process of writing the MiniApp Manifest specification, many people have given valuable comments, thank you all.

The following name list will be continuously updated, in the order of alphabetical.

* Chun Wang
* Changjun Yang
* ...
