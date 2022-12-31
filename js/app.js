/* Template Name: Applock
   Author: Themesdesign
   Version: 1.0.0
   Created: Jan 2021
   File Description: Main Js file of the template
*/

!(function ($) {
  "use strict";
  var init = new Microsoft.ApplicationInsights.ApplicationInsights({
    config: { instrumentationKey: "83815acd-b71a-41d0-bf07-c6e427048db1" },
  });
  var appInsights = init.loadAppInsights();
  appInsights.trackPageView({ name: window.location.pathname });

  function checkOS() {
    if (/android/i.test(navigator.userAgent)) {
      return "Android";
    } else if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
      return "iOS";
    } else {
      return "PC";
    }
  }

  const adjustQRDict = {
    "start-china": "n1qdwoh_fqkv7fh",
    start: "dz6zw7b_f6x8jkg",
    bing: "hh15fre_vz667pg",
    "bing-china": "8h84smn_c8krox8",
  };

  function qrEnter() {
    // start-china : if url have qrcode scan parameter, go directly to download page
    const url = new URL(window.location.href);
    if (url.searchParams.get("isQRCode") && navigator.userAgent) {
      var appName = window.location.pathname.replaceAll("/", "");
      var platform = checkOS();
      var adjustRoot =
        navigator.language.toLocaleLowerCase().indexOf("in") != -1
          ? "https://app.adjust.net.in/"
          : "https://app.adjust.com/";
      var adjustQRCode =
        url.searchParams.get("adjust_qr") ||
        url.searchParams.get("adjust") ||
        adjustQRDict[appName];
      var deeplink = url.searchParams.get("deeplink") || "sapphire%3A%2F%2Fopen";

      appInsights.trackEvent({
        name: "QRScan",
        properties: {
          appName: appName,
          platform: platform,
          section: "banner",
          host: window.location.host,
          path: window.location.pathname,
          param: window.location.search,
          eventId: window.location.href.replace(window.location.origin, ""),
          QRScan: true,
        },
      });

      if (platform === "Android") {
        if (appName === "start-china") {
          const downloadAPKLink = "https://aka.ms/start-china-download";
          window.open(
            `${adjustRoot}${adjustQRCode}?redirect=${encodeURIComponent(downloadAPKLink)}`,
            "_self"
          );
        } else if (appName === "bing-china") {
          const downloadAPKLink = "https://aka.ms/bing-china-download";
          window.open(
            `${adjustRoot}${adjustQRCode}?redirect=${encodeURIComponent(downloadAPKLink)}`,
            "_self"
          );
        } else {
          // start, bing
          window.open(`${adjustRoot}${adjustQRCode}?deeplink=${deeplink}`, "_self");
        }
      } else if (platform === "iOS") {
        if (appName === "bing-china") {
          const bingchinaAppStore = "https://apps.apple.com/cn/app/id1114765817";
          window.open(`${adjustRoot}${adjustQRCode}?redirect_ios=${bingchinaAppStore}`, "_self");
        } else {
          window.open(`${adjustRoot}${adjustQRCode}?deeplink=${deeplink}`, "_self");
        }
      }
    }
  }

  // Loader
  $(window).on("load", function () {
    $("#status").fadeOut();
    $("#preloader").delay(50).fadeOut("slow");
    $("body").delay(50).css({
      overflow: "visible",
    });
    qrEnter();
  });

  // Menu
  $(window).scroll(function () {
    var scroll = $(window).scrollTop();

    if (scroll >= 50) {
      $(".sticky").addClass("nav-sticky");
    } else {
      $(".sticky").removeClass("nav-sticky");
    }
  });

  $(".navbar-nav a, .mouse-down").on("click", function (event) {
    var $anchor = $(this);
    $("html, body")
      .stop()
      .animate(
        {
          scrollTop: $($anchor.attr("href")).offset().top - 0,
        },
        1500,
        "easeInOutExpo"
      );
    event.preventDefault();
  });

  // Scrollspy
  $("#navbarCollapse").scrollspy({ offset: 70 });

  // Magnific Popup
  $(".mfp-image").magnificPopup({
    type: "image",
    closeOnContentClick: true,
    mainClass: "mfp-fade",
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0, 1],
    },
  });

  // Event: download link click
  function recordClickEvent(platform, section) {
    appInsights.trackEvent({
      name: "Download-Button-Click",
      properties: {
        appName: window.location.pathname.replaceAll("/", ""),
        platform: platform,
        section: section,
        host: window.location.host,
        path: window.location.pathname,
        param: window.location.search,
        eventId: window.location.href.replace(window.location.origin, ""),
      },
    });
  }

  $("#home #android_download").on("click", function () {
    recordClickEvent("android", "home");
  });
  $("#download #android_download").on("click", function () {
    recordClickEvent("android", "download");
  });
  $("#home #ios_download").on("click", function () {
    recordClickEvent("ios", "home");
  });
  $("#download #ios_download").on("click", function () {
    recordClickEvent("ios", "download");
  });

  // Event: diagnosing sms sending
  function trackDiagnosingEvent(region, inputElement) {
    appInsights.trackEvent({
      name: "Diagnosing",
      properties: {
        msg: "emptySMSNumber",
        region: region,
        input: inputElement,
      },
    });
  }

  // Event: SMS button click event
  function trackSMSClickEvent(status, region, body = "", msg = "") {
    appInsights.trackEvent({
      name: "SMS-Click",
      properties: {
        status: status,
        region: region,
        appName: window.location.pathname.replaceAll("/", ""),
        host: window.location.host,
        path: window.location.pathname,
        param: window.location.search,
        eventId: window.location.href.replace(window.location.origin, ""),
        body: body,
        msg: msg,
      },
    });
  }

  // SMS
  $("#sms #submit").on("click", function (event) {
    var number = $("#sms input#number").val() || "";
    number = number.replace(/ /g, "");
    number = number.replace(/-/g, "");
    number = number.replace(/\(/g, "");
    number = number.replace(/\)/g, "");

    var region = $("#sms #region").val();
    var code = $("#sms input#code").val() || "start";
    var adjustLink = $("#sms input#link").val() || "";
    var csrf = $("#sms input#csrf").val();

    if (number === "") {
      trackDiagnosingEvent(region, $("#sms input#number"));
    }
    var smsAlertSuccess = $("#sms #alert_success").html();
    var smsAlertWrong = $("#sms #alert_wrong").html();
    var smsAlertFailed = $("#sms #alert_failed").html();

    if (
      number &&
      parseInt(number) > 1000000 &&
      region &&
      parseInt(region) > 0 &&
      code &&
      code.length < 6
    ) {
      var link = "/api/sms/send";
      $.post(
        link,
        {
          _csrf: csrf,
          code: code,
          number: region + "" + number,
          adjustLink: adjustLink,
        },
        function (data) {
          if (data && data.status === "ok") {
            trackSMSClickEvent("success", region, data.body, data.msg);
            alert(smsAlertSuccess);
          } else {
            trackSMSClickEvent("wrong", region, data.body, data.msg);
            alert(smsAlertWrong);
          }
        }
      );
    } else {
      trackSMSClickEvent("failed", region, "", `region:${region}, code:${code}, number:${number}`);
      alert(smsAlertFailed);
    }

    return false;
  });

  // SMS QRCODE GENERATION
  $("#sms #qrcode_img").qrcode({
    render: "table",
    width: 128,
    height: 128,
    text:
      $("#sms input#jump").val() ||
      (navigator.language.toLocaleLowerCase().indexOf("in") != -1
        ? "https://app.adjust.net.in/"
        : "https://app.adjust.com/" + adjustQRDict[$("#sms input#code").val() || "start"]),
  });

  // START CHINA & BING CHINA QRCODE GENERATION
  $(".china .app-download #qrcode_img").qrcode({
    width: 120,
    height: 120,
    text:
      $(".app-download #qrcode_img #jump").val() ||
      (navigator.language.toLocaleLowerCase().indexOf("in") != -1
        ? "https://app.adjust.net.in/"
        : "https://app.adjust.com/" + adjustQRDict[$("#sms input#code").val() || "start-china"]),
  });

  //  Event: qrcode click
  $("#sms #qrcode_img").on("click", function () {
    appInsights.trackEvent({
      name: "Download-Button-Click",
      properties: {
        appName: window.location.pathname.replaceAll("/", ""),
        section: "qrcode",
        host: window.location.host,
        path: window.location.pathname,
        param: window.location.search,
        eventId: window.location.href.replace(window.location.origin, ""),
      },
    });
  });

  // BACK TO TOP
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $(".back-to-top").fadeIn();
    } else {
      $(".back-to-top").fadeOut();
    }
  });

  $(".back-to-top").on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 3000);
    return false;
  });
})(jQuery);
