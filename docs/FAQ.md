# FAQ

## Is MiniApp a part of Web Platform? What is the relationship between MiniApp and Web Platform?

If "web platform" means the browser environment, then the answer is no. MiniApp uses many web technologies like CSS and JavaScript, but its operating environment is far beyond the limit of the browser, and does not depend on the existence of the same-origin policy.

## If MiniApp uses certain parts of Web technologies, how come it runs without a browser engine?

In principle, any rendering engine, as long as it can correctly parse the structure of MiniApp package, dereference the resources and render UI components/APIs cross-platform with no difference should be fine. No matter what rendering engine is used, it can meet the MiniApp standard.

The implementation method depends on user agents. If a user agent does not use a browser engine, it needs to implement the runtime of converting front-end source code to native source code, render template in native, and implement the mechanism of communication between native and JS.

## How is MiniApp Manifest different from the Web App Manifest? Could MiniApp Manifest become a unique case for Web App Manifest? Could MiniApp Manifest be merged into the Web App Manifest?

Some of the [members](https://www.w3.org/TR/appmanifest/#webappmanifest-dictionary) of Web App Manifest are reused in MiniApp Manifest, but since MiniApp is essentially an application rather than a web page, it requires configuration management of the application and hosting platform compatibility, permissions control, and window style, which are beyond the scope of the Web App Manifest. On the other hand, some members and their semantics in the Web App Manifest may not be fully applicable to the context of MiniApp (such as [scope](https://www.w3.org/TR/appmanifest/#scope-member) and [start_url](https://www.w3.org/TR/appmanifest/#start_url-member)), and further research is needed. See the [explainer](https://github.com/w3c/miniapp/blob/gh-pages/specs/manifest/docs/explainer.md) for more details. We are willing to communicate with the Web App Manifest editors and seek as much technical compatibility as possible.

## Why is there a need to create a new URI Scheme specification? How to use the new URI Scheme specification to handle origin? How to handle SecureContext without origin? How to handle CORS?

See the [explainer](https://github.com/w3c/miniapp/blob/gh-pages/specs/uri/docs/explainer.md) for more details.

## Is it possible to harmonize [Page Lifecycle](https://wicg.github.io/page-lifecycle/), [Page Visibility](https://w3c.github.io/page-visibility/), [Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle), and MiniApp Lifecycle specifications? If so, how?

But MiniApp Lifecycle has its unique requirements that cannot be fully supported by Page Lifecycle.

Page Lifecycle is Page-level, but MiniApp Lifecycle is App-level, which is composed of multiple pages.

If only look at MiniApp Page Lifecycle, the `onLoad` and `onReady` is not covered by Page Lifecycle.

If W3C community can find common use cases among different lifecycle specs, it is reasonable to define a harmonized lifecycle. For now, it is recommended to develop MiniApp Lifecycle.

See also the [explainer](https://github.com/w3c/miniapp/blob/gh-pages/specs/lifecycle/docs/explainer.md).

## Is it possible for MiniApp packaging to leverage the existing discussions such as [signed exchanges](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html) and [Web Packaging](https://www.w3.org/TR/2015/WD-web-packaging-20150115/)?

It's not feasible to reuse Signed Exchanges/Web Packaging (WPACK) for MiniApp since the design purposes are quite different. MiniApp package is basically to pack the resources (e.g. page layouts, UI components, app logics) that comprise a mobile app (which happens to be JS-based), while WPACK is to pack HTTP exchanges (requrests and responses) which are not the building blocks of a MiniApp. Using web technologies doesn't change the nature of MiniApp as a mobile app rather than a web app. The HTTP-oriented design of WPACK is not suitable for MiniApp. The runtime envrionments are also different (App/OS-based vs. browser-based) hence the archiving and parsing requirements are different too.

See also the detailed analysis in the [explainer](https://github.com/w3c/miniapp/blob/gh-pages/specs/packaging/docs/explainer.md).

## What is the implementation expectations of MiniApp specifications in the globe? Are the implementations only expected from Chinese MiniApp vendors?

We welcome international vendors to participate in the formulation and implementation of standards.

## Does MiniApp have its own security model?

MiniApp user agent has a security model, including the following:

- View: MiniApp can not access DOM and global object `window`, user agents provide high-level components and APIs to makes that feasible.
- Framework: 
  - use package digital signature checking when fetching and processing packages
  - perform permission management on some components and APIs
- Network:
  - use HTTPs to transmit miniapp packages
  - use domain name safelist to restrict the requests from miniapp
  - restrict the use of cookies
- Storage: 
  - the file access is isolated, only the user directory of the miniapp can be accessed
  - the storage path is limited, and the real physical address is hidden