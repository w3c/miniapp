# Minipp URI Scheme explainer

> Note: This document serves as a supplementary explanation of draft report [MiniApp URI Scheme](https://w3c.github.io/miniapp/specs/uri/). If there is any inconsistency with the MiniApp URI Scheme, you should consider the draft report to be authoritative.


## Authors：
Dan Chou, Shuo Wang, Qian Liu, Tengyuan Zhang

## 1. Introduction
### What is this?
MiniApp URI Scheme defines the Uniform Resource Identifier of a MiniApp ([What is MiniApp?](https://w3c.github.io/miniapp/white-paper/#what-is-miniapp)).

Applications including Web applications can use MiniApp URI Scheme to claim the MiniApp resource it's trying to reference.

### Why do we care？

Each MiniApp vendors, i.e. the MiniApp packaging service providers, are now using very different methods to obtain the MiniApp package. Meanwhile, every user agent has their own way to describe a MiniApp resource. This is creating difficulty to visit a MiniApp across platforms.

For example:

<table>
    <thead>
        <tr class="thead-first-child"><th align="left"> User Agent    </th><th align="left"> URI                                                             </th></tr>
    </thead>
    <tbody>
        <tr class="tbody-first-child"><td align="left"> Wechat App    </td><td align="left"> <code>weixin://dl/&lt;path&gt;/?appid=&lt;appId&gt;&amp;businessType=&lt;businessType&gt;</code> </td></tr>
        <tr class="tbody-even-child"><td align="left"> Alipay App    </td><td align="left"> <code>alipays://platformapi/startapp?appId=&lt;appId&gt;&amp;url=&lt;path&gt;</code>       </td></tr>
        <tr class="tbody-odd-child"><td rowspan="3" align="left"> Quick App     </td><td align="left"> <code>http://hapjs.org/app/&lt;package&gt;/[path][?key=value]</code>             </td></tr>
        <tr class="tbody-even-child"><td align="left"> <code>https://hapjs.org/app/&lt;package&gt;/[path][?key=value]</code>            </td></tr>
        <tr class="tbody-odd-child"><td align="left"> <code>hap://app/&lt;package&gt;/[path][?key=value]</code>                        </td></tr>
        <tr class="tbody-even-child"><td align="left"> Baidu App     </td><td align="left"> <code>baiduboxxapp://swan/appKey/path?key=value</code>                     </td></tr>
        <tr class="tbody-odd-child"><td rowspan="2" align="left"> Bytedance App </td><td align="left"> <code>sslocal://microapp?app_id=&lt;appId&gt;&amp;start_page=pages/home/home</code>  </td></tr>
        <tr class="tbody-even-child"><td align="left"> <code>snssdk143://microapp?app_id=&lt;appId&gt;&amp;start_page=&lt;path&gt;</code>         </td></tr>
    </tbody>
</table>

## 2. Goals

The MiniApp URI Scheme specification aims to provide a set of conform syntax rules to concatenate the information of a miniapp, such as id, version, package address, so that the user agents can identify, parse, and obtain the miniapp resource on any platform.

The miniapp URI achieve this goal by the following design:

* Identify the miniapp package resource by its id, host, port and version components. In most cases, through host and IP, a user agent can discover a miniapp package management service, then access a specific miniapp package by providing the unique ID and version of the miniapp.
* Identify the resource inside miniapp package by its path, query and fragment components. The definition of these three components is close to a HTTP url in browser. How those components can be used relies on other miniapp specs, especially, the [MiniApp package specification](https://w3c.github.io/miniapp/specs/packaging/).

### Key Considerations
#### Why is host and port needed?
If there is no host and port, we'd have to build a unique and centralized miniapp package manager，which is considered difficult and cannot satisfy the demand of the current development of miniapp in China.

In addition, we expect to support a variety of ways to get miniapp packages by URI besides downloading from Internet, such as local files. In this case, the host may not be considered as a domain.

#### Where does id come from?
Only id uniqueness in host is required. May use some algorithm to genereate a universally unique id, or there exists some third party miniapp registers. This depends on the host the miniapp belong to.

#### Why is version components needed?
When a user visit a web page, the page content is always up to date. This is same for miniapp in most cases, so the version  in miniapp URI usually is null. But in some cases, a user agent or user needs to access some specific versions of miniapp. So we reserve the version component.

## 3. Non-goals

The following titles are also important but out of the scope of the MiniApp URI Scheme draft report:

1. the identifier of the resource within a miniapp package, which may include path, query, fragment(this may be defined in the [packaging specification](https://w3c.github.io/miniapp/specs/packaging/));
2. the storage and management of a miniapp package;
3. how to generate the id of a miniapp package;
4. the rule to define a version number;
5. how the Web developers obtain the id and version of a miniapp package;
6. how to obtain a miniapp package(we just provide a suggested way to obtain the package as [an use case](https://w3c.github.io/miniapp/specs/uri/#https)).

## 4. Key scenarios

### Scenario 1 A link to a miniapp in a web page

<p><img style="width: 500px!important;" src="https://images-cdn.shimo.im/BqkA6Gqh1CQArUFl/image.png__thumbnail" alt="figure1. the use case which link to a miniapp in a web page" /></p>

example code:
```html
<!doctype html>
<html>
<a href="miniapp://foo;version=1.0.1-trial@example.com:8080/pages/index?category=book#section-3">open a MiniApp</a>
</html>
```
Browsers may handle the click action of Link A inconsistently for this Web page.

* If it is running in a web page or MiniApp page or Native App that has a miniapp runtime, the URI can be parsed properly, and it will be retrieved  the resource from the *example.com*, then locate the URI path, query, fragment and other information to dereference the corresponding resource.
* If it is in a web page of or Native App that does not have a miniapp runtime, the platform can parse the URI properly but can not run the miniapp resource. To provide a smooth user experience, it may trigger other user agent to open the miniapp.

### Scenario 2 Use MiniApp URI within a miniapp
Similar to parsing the URLs of each parts of the context for a web page, in MiniApp's runtime context, developers also need to know all the necessary information of the URI corresponding to the current MiniApp page. These information may include,

```javascript
console.log(location.href);     // miniapp://foo;version=1.0.1-trial@example.com:8080/pages/index?k=v#bar
console.log(location.protocol); // miniapp:
console.log(location.origin);   // miniapp://foo;version=1.0.1-trial@example.com:8080
console.log(location.id);       // foo
console.log(location.version);  // 1.0.1-trial
console.log(location.host);     // example.com
console.log(location.port);     // 8080
console.log(location.pathname); // /pages/index
console.log(location.search);   // ?k=v
console.log(location.hash);     // #bar
```

More use case of MiniApp can be found in the [MiniApp White Paper use case](https://w3c.github.io/miniapp/white-paper/#case-studies).

## 5. Security and Privacy Considerations

### Security:
1. Similar to other URLs, MiniApp URI may expose the host and port of a miniapp package, so there may be a risk of being scanned and attacked for the other hidden ports. Service providers are suggested to avoid the risks through authentication or other efficient means.
2. When the UA reads and dereferences the URI, there maybe security risks such as injection, hijacking, and man-in-the-middle attacks during the requests to obtain the package from the service provider. User agents are suggested to send requests using HTTPS and data encryption. Packet integrity and security validation can also help to identify and terminate abnormal URI access to tampered package files.
3. When the user agent stores the package resource locally, it is necessary to ensure the storage security of files and isolate them properly.

### Privacy:
1. User Agent should isolate the resources of the local package. Only the current miniapp can cache or access these resources, while other miniapp or applications are not supposed to. In addition, the user agent needs to obfuscate the resource names and provide mapping for the paths of the stored files, to prevent file privacy leaks.
2. User agent should restrict the permissions of the miniapp to access certain information, miniapp can only access the user's private information (such as user address, mobile number, or email) after the user has authorized.

## 6. Detailed design discussion

The proposal of the URI scheme is still in an early stage. The main form of discussion are meetings and offline communication.

### 6.1 issues
[https://github.com/w3c/miniapp/issues/20](https://github.com/w3c/miniapp/issues/20)

### 6.2 Q&A

#### Q1：About Syntax-appId
**Question: The syntax `foo@example.com` represents the username for traditional usage in URL. Is it appropriate to reuse this syntax for appId in MiniApp URIs?（by @hax)**


**Answer：** In some URI protocol, the content before `@`  does indeed represent username. And those protocals are usually used to locate a specific resource related to a person's identify, such as email or ftp.

But in MiniApp URI, there is no concept of 'user', so we needn't a real username.  What's the more , appid as the identity of the MiniApp can correspond to the meaning of username relative to resources.

Therefore, in our opinion, it is appropriate for appId to take the  username component.

 



#### Q2: About syntax-host
**Question: Traditionally,  in an URI like "scheme://foo", foo represents the host like HTTP(s) URL, or the path like file URL. But with MiniApp URI, foo is not host or path. That's mean the original correspondence is changed. Is this appropriate? (by @hax)**


**Answer：** Unlike regular resources that must be obtained through the network,  it is determined by the user agent where to obtain the resources (either network or local).

For this feature, we have designed the MiniApp URI syntax that the host of the authority can be omitted, but appId, as the unique identifier of the MiniApp cannot be omitted.

The MiniApp URI 'miniapp://foo' which has only appId  is similar to the known URN, such as tel: + 1-816-555-0000, isbn: 0451450523.


**Opening question:** Judging from the syntax description of RFC 3986 specification and the known URL, we did not find the case which authority is required but host is omitted. We want your help to review whether this design complies with RFC 3986 specification.?





#### Q3 About security
**Question: Does MiniApp URI has security risk?(by @hax)**

**Answer:** The MiniApp URI protocol may exposes the package address in some situation, which makes someone think that there may be security risk.  However, for the time being, the address of the package is not secret information. That can be obtained easily by capturing the accessing, etc. Therefore, expressing the package address in the URI does not increase the security risk.

For other possible security risks, we have explained in the "Security and Privacy" section.

For the security of the entire MiniApp, not only does the provider of the package need to guarantee the security of package transmission, caching, and dereferencing, but also the user agent needs to consider the security of the use of each high-level component or api.





#### Q4 About syntax-version
**Question: What is the relationship between version in URI and versionName / versionCode in manifest? (By @hax)**

**Answer:** According to the editor's explaining for the Maniafest spec, versionName is a semantic, optional field that can be used by the user agent or developer to show it to the user; and versionCode is a number that is incremented each time the MiniApp is released. Therefore, the version syntax component in the MiniApp URI can be mapped to the versionCode in the Manifest proposal.





#### Q5 About dereference
**Question: it seems the "dereferencing" process ends up with a standard HTTP(s) URL. Wouldn't using that as is make it more accessible to end-users? This would trip unless you have a runtime (which would be also presumably, be a browser) - it feels like this tripwire mechanism's main motivation is to make the user install the runtime (in which case, what does this runtime provide that the current browser does not?), which I'm not sure is something that I personally would agree with. (by @cynthia)**

**Answer:** I understand your question contains two points,

1. Why not directly use the HTTPS protocol as the MiniApp URI?

2. The current MiniApp URI mechanism requires a set of runtimes to parse it. Why is it necessary? What is the difference between that **runtime** and a conventional browser?

For point 1: Downloading a package through the network is just one of the ways to get a package. In addition, there are many ways to access a miniapp resource:

For example, after accessing the miniapp once, the miniapp package would be stored locally. Or the user agent can preset the miniapp package before the user accesses the URI for performance(as we introduced in the white paper). Or when debugging the Miniapp, the developer can directly push the miniapp package to the user agent through a debugging tool.

In these cases, the user agent open miniapp locally according to the appId in MiniApp URI without having to request a package server.

In other case, the user agent can specific its own mapping relationship with "host" component. For example, the "bar" in "miniapp: // foo @ bar" can correspond a domain or a local directory, anyway.

In summary, MiniApp URI are designed to locate MiniApp resource cross-platform, regardless of how they are obtained.That cannot be expressed intuitively through HTTPS URLs only. This is why we mentioned in Chapter 6 that it is non-normative, and it just describes a user scenario.

For point 2, the runtime make miniapp can help to fill the gap of the Web and the Native.(like we mentioned in [miniapp white paper introduction](https://w3c.github.io/miniapp/white-paper/#what-is-miniapp). And because the design of the MiniApp is different from traditional web applications (like we mentioned in [miniapp white paper core-features)](https://w3c.github.io/miniapp/white-paper/#core-features)). Even if the miniapp packaged is downloaded by a traditional browser, it cannot be opened and run.

And with the necessity of the MiniApp URI demonstrated above, therefore, browsers need to implement MiniApp URI specifications to correctly parse MiniApp URIs and implement MiniApp runtime related specifications (under development) to open and run MiniApps properly.



## References & acknowledgements

In the process of writing the MiniApp URI specification, many people have given valuable comments, thank you all.

The following name list will be continuously updated, in the order of alphabetical.

* Hax
* Langyu Liu
* Jing Huang
* Wei Sun
* Xiaohong Deng
* Xiaoqian Wu
* Yuan Lu
* Ming Zu
* ...
