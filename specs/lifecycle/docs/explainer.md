# Minipp Lifecycle explainer

> Note: This document serves as a supplementary explanation of the [MiniApp Lifecycle](https://w3c.github.io/miniapp/specs/lifecycle/) 
spec. If there is any inconsistency with the spec, you should consider the spec to be authoritative.

## Authors：

Qing An (Alibaba)

## What is this

This is a proposal for a new Web API for MiniApp lifecycle to manage the lifecycle events of both global MiniApp application 
lifecycle and each MiniApp page’s lifecycle.

MiniApp is composed of two layers, app layer and page layer. Therefore, MiniApp lifecycle contains application lifecycle and 
page lifecycle.

To better understand MiniApp lifecycle, here is the description of MiniApp running mechanism:

* Download

MiniApp is install-free. When user opens a MiniApp for the first time, the hosted native App will download MiniApp resource 
from backend server. The downloaded MiniApp resource will be cached in the hosted native App for some duration. Afterwards, 
when user reopens the cached MiniApp, the downloading procedure can be skipped, therefore the MiniApp can be opened more quickly.

* Cold Launch and Host Launch

Cold launch means the procedure of opening a MiniApp that has never been launched locally, or has been destroyed. During this 
procedure, MiniApp will implement initialization.

Hot launch means the procedure of opening a MiniApp that is running in the background. In this case, MiniApp is only switching 
from running in the background to running in the foreground

* Foreground and Background

Running in the foreground: when user firstly opens a MiniApp, it is in the state of running in the foreground.

Running in the background: when user closes the MiniApp, or leaves the hosted Native App, the MiniApp will not be destroyed 
directly. Instead, it will switch to run in the background.

Switching from running in the background to foreground: when the have-not-been-destroyed MiniApp is reopened, it will switch 
from running in the background to running in the foreground.

* Destroy

When MiniApp is closed, it just switches to be running in the background. Only after the MiniApp have been running in the 
background for a specific duration, or it has occupied too many system resources, then it will be destroyed.

## MiniApp application lifecycle states

*	MiniApp initialization: after MiniApp initialization is completed, MiniApp application enters the state of “Launched”. 
At this moment, the path and query of MiniApp URI can be obtained.
*	MiniApp running in foreground: once the MiniApp launch is completed, or once the MiniApp switches to be running in 
foreground from background, MiniApp application enters the state of “Shown”
*	MiniApp running in background: once the MiniApp switches to be running from foreground to background, MiniApp application 
enters the state of “Hidden”
*	MiniApp error: once the MiniApp is confronted with script error, MiniApp application enters the state of “Error”

## MiniApp page lifecycle states

*	MiniApp page loading: once MiniApp page loading is completed, MiniApp page enters the state of “Loaded”
*	MiniApp page first rendering ready: once the MiniApp page first rendering is completed, MiniApp page enters the state
*	MiniApp page running in foreground: once the page switches to be running in foreground from background, MiniApp page enters 
the state of “Shown”
*	MiniApp page running in background: once the MiniApp page switches to be running from foreground to background, MiniApp page 
enters the state of “Hidden”
*	MiniApp page unloading: once the MiniApp page is destroyed, MiniApp page enters the state of “Unloaded”

## Procedure of MiniApp lifecycle

<figure id="lifecycle-img">
  <span style="text-align:center;"><img src="lifecycle/images/lifecycle.png" alt="MiniApp page lifecycle" width="600"></span>
</figure>

## Sample code

*	MiniApp application lifecycle: 

Assume MiniApp URI is: miniapp://foo;version=1.0.1-trial@example.com:8080/pages/index?k=v#bar

```js
App({ 
  onLaunch(options) { // MiniApp is launched for the first time
    console.log(options.query); // k=v#bar
    console.log(options.path);  // pages/index
  },
  onShow(options) { // MiniApp launch is completed, or MiniApp switches to be running in foreground from background
    console.log(options.query); // k=v#bar
    console.log(options.path);  // pages/index
  },
  onHide() { // MiniApp switches to be running from foreground to background
    console.log('app hide');
  },
  onError(error) { // MiniApp is confronted with script error
    console.log(error);
  },
});
```

* MiniApp page lifecycle: 

```js
Page({
  onLoad(query) {
    // MiniApp page loading is completed
  },
  onShow() {
    // MiniApp page switches to be running in foreground from background
  },
  onReady() {
    // MiniApp page first rendering is completed
  },
  onHide() {
    // MiniApp page switches to be running from foreground to background
  },
  onUnload() {
    // MiniApp page is destroyed
  },
});
```
