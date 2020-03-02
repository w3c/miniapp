# Question & Answer

> Note: This document documents Q&A during all discussions about [MiniApp URI Scheme](https://w3c.github.io/miniapp/specs/uri/) spec.

## About syntax-host

### 1. Why does the URI need the `host` field, do we need to download the package from another website?

**Answer：** At present, there is such a demand for MiniApp. Such as, the Open Source Alliance of Baidu Smart Program has a scenario that an alliance member user agent to download MiniApp packages from package server that provided by another user agent.



### 2. For the syntax ["@" host [":" port]], does host is restricted?

**Answer：**: The host field is optional, and the value is parsed by the user agent. The host can be a null value, or it can represent some special package fetching logic, such as local debugging.


## About syntax-appId

### 1. The syntax `foo@example.com` represents the username for traditional usage in URL. Is it appropriate to reuse this syntax for appId in MiniApp URIs?（by @hax)

**Answer：** In some URI protocol, the content before `@`  does indeed represent username. And those protocals are usually used to locate a specific resource related to a person's identify, such as email or ftp.

But in MiniApp URI, there is no concept of 'user', so we needn't a real username.  What's the more , appid as the identity of the MiniApp can correspond to the meaning of username relative to resources.

Therefore, in our opinion, it is appropriate for appId to take the  username component.


### 2. Traditionally,  in an URI like "scheme://foo", `foo` represents the host like HTTP(s) URL, or the path like file URL. But with MiniApp URI, `foo` is not host or path. That means the original correspondence is changed. Is this appropriate? (by @hax)

**Answer：** Unlike regular resources that must be obtained through the network, where to obtain the resources (network or local) is up to the user agent.

For this feature, we have designed the MiniApp URI syntax that the host of the authority can be omitted, but appId, as the unique identifier of the MiniApp cannot be omitted.

The MiniApp URI 'miniapp://foo' which has only appId  is similar to the known URN, such as tel: + 1-816-555-0000, isbn: 0451450523.


**Opening question:** Judging from the syntax description of [RFC 3986](https://tools.ietf.org/html/rfc3986) specification and known URLs, we did not find the case where authority is required but host is omitted. We want your help to review whether this design complies with RFC 3986 specification.


## About syntax-version

### 1. What is the relationship between version in URI and [versionName](https://w3c.github.io/miniapp/specs/manifest/#versionname) / [versionCode](https://w3c.github.io/miniapp/specs/manifest/#versioncode) in manifest? (By @hax)

**Answer:** According to the description in the Maniafest spec, `versionName` is a semantic, optional field that can be used by the user agent or developer to show it to the user; and `versionCode` is a number that is incremented each time the MiniApp is released. Therefore, the version syntax component in the MiniApp URI can be mapped to the `versionCode` in the Manifest proposal.



## About use case

### 1. Is `location` in [Example 1](https://w3c.github.io/miniapp/specs/uri/#example-1-use-miniapp-uri-in-a-mini-app-1-miniapp-uri) related to `location` of dom?
**Answer：** There is no association. It is recommended that the user agent provide MiniApp URI analysis results in the runtime environment of the MiniApp.



## About security

### 1. Does MiniApp URI has security risks? (by @hax)**

**Answer:** The MiniApp URI Scheme may exposes the package address in some situation, which makes someone think that there may be security risk.  However, for the time being, the address of the package is not secret information. That can be obtained easily by capturing the accessing, etc. Therefore, expressing the package address in the URI does not increase the security risk.

For other possible security risks, there are more explanation in the "Security and Privacy" section.

For the security of the entire MiniApp, not only does the provider of the package need to guarantee the security of package transmission, caching, and dereferencing, but also the user agent needs to consider the security of the use of each high-level component or API.



## About accessibility

### 1. What happens when a browser without MiniApp runtime accesses the MiniApp URI?
**Answer:**  If the dereference of the MiniApp URI is not supported, then generally, the browser will give it to the system to identify it. If it cannot be identified, it will not respond or prompt.
And if the developer hopes that the MiniApp can still be called even if the MiniApp URI is running in an unsupported browser, the developer can use some known methods in the industry, such as the deep link, to call up the designated user agent which can recognize and parse MiniApp URIs.




## About dereference

### 1. Why using the HTTPS protocol to download MiniApp package?

**Answer:** There is no requirement on how to download packages. This chapter is only a practical way to describes a user scenario. User agent can also download packages using other protocols, or just obtain MiniApp packages locally.



### 2. It seems the "dereferencing" process ends up with a standard HTTP(s) URL. Wouldn't using that as is make it more accessible to end-users? This would trip unless you have a runtime (which would be also presumably, be a browser) - it feels like this tripwire mechanism's main motivation is to make the user install the runtime (in which case, what does this runtime provide that the current browser does not?), which I'm not sure is something that I personally would agree with. (by @cynthia)

**Answer:** I understand your question contains two points,

1. Why not directly use the HTTPS protocol as the MiniApp URI?

2. The current MiniApp URI mechanism requires a set of runtimes to parse it. Why is it necessary? What is the difference between that **runtime** and a conventional browser?

For point 1: downloading a package through the network is just one of the ways to get a package. In addition, there are many ways to access a miniapp resource.


For example, after accessing the miniapp once, the miniapp package would be stored locally. Or the user agent can preset the miniapp package before the user accesses the URI for performance (as we mentioned in [#2.1.6 of the miniapp white paper](https://w3c.github.io/miniapp/white-paper/#performance-and-user-experience
)). Or when debugging the Miniapp, the developer can directly push the miniapp package to the user agent through a debugging tool.


In these cases, the user agent open miniapp locally according to the appId in MiniApp URI without having to request a package server.

In other cases, the user agent can specify its own mapping relationship with "host" component. For example, the "bar" in "miniapp: // foo @ bar" can correspond a domain or a local directory, anyway.


In summary, MiniApp URI are designed to locate MiniApp resource cross-platform, regardless of how they are obtained. That cannot be expressed intuitively through HTTPS URLs only. This is why we mentioned in [Chapter 6 Use HTTPS](https://w3c.github.io/miniapp/specs/uri/#https) that it is non-normative, and it just describes a user scenario.

For point 2, the runtime make miniapp can help to fill the gap of the Web and the Native (like we mentioned in [miniapp white paper introduction](https://w3c.github.io/miniapp/white-paper/#what-is-miniapp)). And because the design of the MiniApp is different from traditional web applications (like we mentioned in [miniapp white paper core-features](https://w3c.github.io/miniapp/white-paper/#core-features)). Even if the miniapp packaged is downloaded by a traditional browser, it cannot be opened and run.

And with the necessity of the MiniApp URI demonstrated above, therefore, browsers need to implement MiniApp URI specifications to correctly parse MiniApp URIs and implement MiniApp runtime related specifications (under development) to open and run MiniApps properly.
