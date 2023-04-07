/*
 * ******************************************************************************
 *
 * CONFIDENTIAL, PROPRIETARY, AND TRADE SECRET INFORMATION
 *
 * Copyright © [2020] - [2022] LotLinx, Inc. All Rights Reserved.
 *
 * NOTICE: The entire contents of this file/document, the intellectual and
 * technical concepts it contains, and all intellectual property embodied
 * within it is the property of LotLinx, Inc.  Additionally, some or all of this
 * file/document may be covered by patents, issued and pending, in the United
 * States and other countries, and is itself a trade secret, and contains trade
 * secrets, of LotLinx, Inc.
 * You have no license or right to use any portion of this file/document without
 * express written permission from LotLinx, Inc. and any unauthorized use,
 * publication, or reproduction of the contents of this file/document is
 * strictly prohibited.
 *
 * *****************************************************************************
 */

var LxLoader = (function() {
  function LxLoader() {
    this.debug = false;
    this.dev = false;
    this.testHost = "";
    this.queue = window.VinAds || [];
    this.process();
  }
  LxLoader.prototype.setPage = function(page) {
    console.trace("Set Page");
    this.page = page;
    if (page.debug) {
      this.debug = page.debug;
    }
    if (page.dev) {
      this.dev = page.dev;
      if (page.host) {
        this.testHost = page.host;
      }
    }
  };;;
  LxLoader.prototype.domain = function() {
    if (this.dev) {
      if (this.testHost != "") {
        return this.testHost;
      }
      return "https://dev-ads.lotlinx.com";
    }
    return "https://ads.lotlinx.com";
  };;
  LxLoader.prototype.post = function(url, body, handler) {
    console.log('Payload:', body);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(body);
    xhr.onload = function() {
      if (xhr.status != 200) {
        handler.failure(xhr.response);
        return;
      }
      try {
        var resp = JSON.parse(xhr.response);
        if (typeof resp.status != 'undefined') {
          if (resp.status == 'ok') {
            if (typeof resp.data != 'undefined') {
              handler.success(resp);
              return;
            }
          }
        }
        handler.failure(resp);
        return;
      } catch (err) {
        console.error(err);
      }
      handler.failure({
        "status": "error",
        "data": {
          "message": "Unhandled error from server",
          "rawResponse": xhr.response
        }
      });
      return;
    };
  };;
  LxLoader.prototype.getVins = function (operation) {
        console.trace("Get Vins");
        var url = this.domain() + "/v2/getVins";
        var body = JSON.stringify({
            "page": this.page,
            "op": operation
        });
        if (typeof operation.success != "function") {
            console.error("No function defined for success on call");
            return;
        }
        if (typeof operation.failure != "function") {
            operation.failure = function (resp) {
                console.trace(resp.data.message);
            };
        }
        var handler = {
            success: operation.success,
            failure: operation.failure
        };
        this.post(url, body, handler);
    };
    ;
  LxLoader.prototype.getDetails = function(operation) {
    console.trace("Get Details");
    var url = this.domain() + "/v2/getDetails";
    var body = JSON.stringify({
      "page": this.page,
      "op": operation
    });
    if (typeof operation.success != "function") {
      console.error("No function defined for success on call");
      return;
    }
    if (typeof operation.failure != "function") {
      operation.failure = function(resp) {
        console.trace(resp.data.message);
      };
    }
    var handler = {
      success: operation.success,
      failure: operation.failure
    };
    this.post(url, body, handler);
  };;
  LxLoader.prototype.buildAd = function(operation) {
    console.trace("Build Ad");
    var url = this.domain() + "/v2/buildAd";
    var body = JSON.stringify({
      "page": this.page,
      "op": operation
    });
    var fun = this.populateFrame;
    if (typeof operation.failure != "function") {
      operation.failure = function(resp) {
        console.trace(resp.data.message);
      };
    }
    var handler = {
      success: function(resp) {
        if (resp.data.url != "undefined") {
          fun(operation.container, resp.data.url, operation.width, operation.height);
          return;
        } else {
          console.log("Error parsing response url");
        }
      },
      failure: operation.failure
    };
    this.post(url, body, handler);
  };;
  LxLoader.prototype.buildCustom = function(operation) {
    console.trace("Build Custom");
    var url = this.domain() + "/v2/buildCustom";
    var body = JSON.stringify({
      "page": this.page,
      "op": operation
    });
    var success = operation.success;
    var failure = operation.failure;
    var callback = operation.callback;
    if (typeof success != "function") {
      if (typeof callback != "function") {
        console.error("Build Custom operation requires success or callback function");
        return;
      } else {
        success = function(resp) {
          console.log('Response:', resp);
          console.trace(resp.data.message);
          callback(resp.data);
        };
        failure = function(resp) {
          console.trace(resp.data.message);
          callback("");
        };
      }
    } else {
      if (typeof failure != "function") {
        failure = function(resp) {
          console.trace(resp.data.message);
        };
      }
    }
    var handler = {
      success: success,
      failure: failure
    };
    this.post(url, body, handler);
  };;
  LxLoader.prototype.managedLoadAd = function(operation) {
    console.trace("Managed Load Ad");
    var url = this.domain() + "/v2/managedLoadAd";
    var body = JSON.stringify({
      "page": this.page,
      "op": operation
    });
    if (typeof operation.lineItem == "undefined") {
      console.error("LineItem is required for managed load");
      return;
    }
    var fun = this.populateFrame;
    var handler = {
      success: function(resp) {
        if (resp.data.url != "undefined") {
          fun(operation.container, resp.data.url, operation.width, operation.height);
          return;
        } else {
          console.log("Error parsing response url");
        }
      },
      failure: function(resp) {
        console.error(resp.data.message);
      }
    };
    this.post(url, body, handler);
  };;
  LxLoader.prototype.populateFrame = function(container, sourceUrl, width, height) {
    var frame = document.createElement("iframe");
    frame.setAttribute("scrolling", "no");
    frame.style.border = "none";
    if (typeof width == "undefined" || width <= 0)
      frame.style.width = "100%";
    else
      frame.style.width = width + "px";
    if (typeof height == "undefined" || height <= 0)
      frame.style.height = "100%";
    else
      frame.style.height = height + "px";
    frame.style.overflow = "hidden";
    frame.src = sourceUrl;
    document.getElementById(container).appendChild(frame);
  };;
  LxLoader.prototype.process = function() {
    if (typeof this.page == "undefined") {
      var pageIsSet = false;
      for (var i = 0; i < this.queue.length; i++) {
        if (typeof this.queue[i].op != 'undefined' &&
          this.queue[i].op == 'setPage') {
          var operation = this.queue.splice(i, 1);
          this.setPage(operation[0]);
          pageIsSet = true;
          break;
        }
      }
      if (!pageIsSet)
        return;
    }
    while (this.queue.length > 0) {
      var e = this.queue.shift();
      if (typeof e.op != 'undefined') {
        switch (e.op) {
          case "setPage":
            this.setPage(e);
            break;
          case "getVins":
            this.getVins(e);
            break;
          case "buildAd":
            this.buildAd(e);
            break;
          case "getDetails":
            this.getDetails(e);
            break;
          case "buildCustom":
            this.buildCustom(e);
            break;
          case "managedLoadAd":
            this.managedLoadAd(e);
            break;
        }
        continue;
      }
    }
  };
  LxLoader.prototype.push = function() {
    var ops = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      ops[_i] = arguments[_i];
    }
    for (var i = 0; i < ops.length; i++) {
      console.trace("Push");
      this.queue.push(ops[i]);
    }
    this.process();
  };;
  return LxLoader;
}());
window.VinAds = (function() {
  return new LxLoader();
})();
