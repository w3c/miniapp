# FAQ

## 1. Is MiniApp a part of Web Platform? What is the relationship between MiniApp and Web Platform?

If "web platform" means the browser environment, then the answer is no. MiniApp uses many web technologies like CSS and JavaScript, but its operating environment is far beyond the limit of the browser, and does not depend on the existence of the same-origin policy.

## 2. If MiniApp uses certain parts of Web technologies, how come it runs without a browser engine?

In principle, any rendering engine, as long as it can correctly parse the structure of MiniApp package, dereference the resources and render UI components/APIs cross-platform with no difference should be fine. No matter what rendering engine is used, it can meet the MiniApp standard.

The implementation method depends on user agents. If a user agent does not use a browser engine, it needs to implement the runtime of converting front-end source code to native source code, render template in native, and implement the mechanism of communication between native and JS.

## 3. How is MiniApp Manifest different from the Web App Manifest? Could MiniApp Manifest become a unique case for Web App Manifest? Could MiniApp Manifest be merged into the Web App Manifest?

Some of the [members](https://www.w3.org/TR/appmanifest/#webappmanifest-dictionary) of Web App Manifest are reused in MiniApp Manifest, but since MiniApp is essentially an application rather than a web page, it requires configuration management of the application and hosting platform compatibility, permissions control, and window style, which are beyond the scope of the Web App Manifest. On the other hand, some members and their semantics in the Web App Manifest may not be fully applicable to the context of MiniApp (such as [scope](https://www.w3.org/TR/appmanifest/#scope-member) and [start_url](https://www.w3.org/TR/appmanifest/#start_url-member)), and further research is needed. See the [explainer](https://github.com/w3c/miniapp/blob/gh-pages/specs/manifest/docs/explainer.md) for more details. We are willing to communicate with the Web App Manifest editors and seek as much technical compatibility as possible.

## 4. Why is there a need to create a new URI Scheme specification? How to use the new URI Scheme specification to handle origin? How to handle SecureContext without origin? How to handle CORS?

> 4.1 Why there is a need to create a new URI Scheme specification?

Because other schemes may not meet the needs of MiniApp, mainly including the following reasons:
The first and most important reason is that there is no centralized package service like "`https://miniapp.com`".
Second, We hope there is an easier way to recognize whether a URI is a MiniApp URI in advance to preload runtime.
What's more, Some MiniApp vendors (user agents) want more flexibility, such as using protocols other than HTTP to fetch packages.

See also [issue #34](https://github.com/w3c/miniapp/issues/34).

> 4.2 How to use the new URI Scheme specification to handle origin?

The new URI Scheme uses [Host and port](https://w3c.github.io/miniapp/specs/uri/#host-and-port-host-port) to identify the origin, and when we [use https to download MiniApp packages](https://w3c.github.io/miniapp/specs/uri/#https), the origin conforms to the rules in [HTTP origin](https://tools.ietf.org/html/rfc6454#section-7).

> 4.3 How to handle SecureContext without origin?

 If there isn't an origin, it may be a local debugging scenario. Since the miniapp package just used for debugging which will not spread across the web or across the platform, so strict security model is not required. User agents can verify it according to the actual situation.
Usually, miniapp uri requires an origin.
And, in fact, the current vendors still use the https protocol to download miniapp packages. The minapp uri is only used to identify that this is a miniapp (in advance), and where to download packages, and which miniapp need to download, and what page to open after downloading. So, in this case, the miniapp can be considered to be in a secure context.

> 4.4 How to handle CORS?

Now we use a built-in domain name safelist to allow CORS and ensure security. Each miniapp would configure the domain name safelist on the package management platform before it is released.
The user agent only allows requests to the domain name in the whitelist. And a minapp developer server would also allow the request from the MiniApp origin.

See the [explainer](https://github.com/w3c/miniapp/blob/gh-pages/specs/uri/docs/explainer.md) for more details.

## 5. Is it possible to harmonize [Page Lifecycle](https://wicg.github.io/page-lifecycle/), [Page Visibility](https://w3c.github.io/page-visibility/), [Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle), and MiniApp Lifecycle specifications? If so, how?

MiniApp Lifecycle has its unique requirements that cannot be fully supported by Page Lifecycle.

Page Lifecycle is Page-level, but MiniApp Lifecycle is App-level, which is composed of multiple pages.

If only look at MiniApp Page Lifecycle, the `onLoad` and `onReady` is not covered by Page Lifecycle.

If W3C community can find common use cases among different lifecycle specs, it is reasonable to define a harmonized lifecycle. For now, it is recommended to develop MiniApp Lifecycle.

See also the [explainer](https://github.com/w3c/miniapp/blob/gh-pages/specs/lifecycle/docs/explainer.md).

## 6. Is it possible for MiniApp packaging to leverage the existing discussions such as [signed exchanges](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html) and [Web Packaging](https://www.w3.org/TR/2015/WD-web-packaging-20150115/)?

It's not feasible to reuse Signed Exchanges/Web Packaging (WPACK) for MiniApp since the design purposes are quite different. MiniApp package is basically to pack the resources (e.g. page layouts, UI components, app logics) that comprise a mobile app (which happens to be JS-based), while WPACK is to pack HTTP exchanges (requrests and responses) which are not the building blocks of a MiniApp. Using web technologies doesn't change the nature of MiniApp as a mobile app rather than a web app. The HTTP-oriented design of WPACK is not suitable for MiniApp. The runtime envrionments are also different (App/OS-based vs. browser-based) hence the archiving and parsing requirements are different too.

See also the detailed analysis in the [explainer](https://github.com/w3c/miniapp/blob/gh-pages/specs/packaging/docs/explainer.md).

## 7. What is the implementation expectations of MiniApp specifications in the globe? Are the implementations only expected from Chinese MiniApp vendors?

We welcome international vendors to participate in the formulation and implementation of standards.

## 8. Does MiniApp have its own security model?

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
