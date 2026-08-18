/**
 * AI 销售工作台 - 网页客服组件
 *
 * 最简接入（复制到任意网站的 </body> 前）：
 * <script src="https://ai-sales-workbench-liart.vercel.app/chat-widget.js"></script>
 *
 * 可选配置：
 * <script>
 *   window.CHAT_WIDGET_CONFIG = {
 *     url: 'https://ai-sales-workbench-liart.vercel.app/widget',
 *     title: '课程顾问',
 *     primaryColor: '#0891b2',
 *     bottom: '20px',
 *     right: '20px',
 *     welcome: '您好，我是AI课程顾问~'
 *   };
 * </script>
 * <script src="https://ai-sales-workbench-liart.vercel.app/chat-widget.js" async></script>
 */
(function () {
  "use strict";

  if (window.__CHAT_WIDGET_LOADED__) return;
  window.__CHAT_WIDGET_LOADED__ = true;

  var config = window.CHAT_WIDGET_CONFIG || {};
  // 默认指向 Vercel 部署（支持 API 和实时通信）
  var DEFAULT_BASE = "https://ai-sales-workbench-liart.vercel.app";
  var WIDGET_URL = config.url || DEFAULT_BASE + "/widget";
  var BTN_COLOR = config.primaryColor || "#0891b2";
  var BTN_SIZE = config.buttonSize || 58;
  var TITLE = config.title || "在线咨询";
  var SUBTITLE = config.subtitle || "AI顾问在线，通常1分钟内回复";

  // 创建 iframe（默认 0 尺寸）
  var iframe = document.createElement("iframe");
  iframe.src = WIDGET_URL;
  iframe.title = TITLE;
  iframe.setAttribute("allow", "clipboard-write");
  iframe.style.cssText = [
    "position:fixed",
    "bottom:0",
    "right:0",
    "width:0",
    "height:0",
    "border:0",
    "z-index:2147483647",
    "background:transparent",
    "transition:none",
  ].join(";");

  // 创建悬浮按钮
  var btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", TITLE);
  btn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
  btn.style.cssText = [
    "position:fixed",
    "bottom:" + (config.bottom || "20px"),
    "right:" + (config.right || "20px"),
    "width:" + BTN_SIZE + "px",
    "height:" + BTN_SIZE + "px",
    "border-radius:50%",
    "background:linear-gradient(135deg," + BTN_COLOR + ",#14b8a6)",
    "color:#fff",
    "border:0",
    "cursor:pointer",
    "z-index:2147483646",
    "box-shadow:0 8px 24px -4px " + BTN_COLOR + "66, 0 4px 12px rgba(0,0,0,0.15)",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "transition:transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .2s, opacity .3s",
    "opacity:0",
    "transform:scale(.6)",
  ].join("");

  // 脉冲圈
  var pulse = document.createElement("span");
  pulse.setAttribute("aria-hidden", "true");
  pulse.style.cssText = [
    "position:absolute",
    "inset:0",
    "border-radius:50%",
    "background:" + BTN_COLOR,
    "opacity:.35",
    "animation:chatWidgetPulse 2.2s ease-out infinite",
    "pointer-events:none",
  ].join(";");
  btn.appendChild(pulse);

  // 未读徽章
  var badge = document.createElement("span");
  badge.style.cssText = [
    "position:absolute",
    "top:-4px",
    "right:-4px",
    "min-width:20px",
    "height:20px",
    "padding:0 6px",
    "border-radius:10px",
    "background:#ef4444",
    "color:#fff",
    "font:600 11px/20px -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif",
    "text-align:center",
    "box-shadow:0 0 0 2px #fff",
    "display:none",
  ].join("");
  btn.appendChild(badge);

  var isOpen = false;
  var isReady = false;

  function setOpen(open) {
    isOpen = open;
    if (open) {
      iframe.style.cssText = [
        "position:fixed",
        "bottom:" + (config.bottom || "20px"),
        "right:" + (config.right || "20px"),
        "width:min(400px, calc(100vw - 24px))",
        "height:min(620px, calc(100vh - 24px))",
        "max-height:calc(100vh - 24px)",
        "border:0",
        "border-radius:16px",
        "z-index:2147483647",
        "background:#fff",
        "box-shadow:0 20px 60px -10px rgba(0,0,0,.25), 0 0 0 1px rgba(0,0,0,.06)",
        "transition:width .25s ease, height .25s ease, opacity .2s",
      ].join(";");
      btn.style.opacity = "0";
      btn.style.transform = "scale(.6)";
      btn.style.pointerEvents = "none";
      pulse.style.display = "none";
    } else {
      iframe.style.cssText = [
        "position:fixed",
        "bottom:0",
        "right:0",
        "width:0",
        "height:0",
        "border:0",
        "z-index:2147483647",
        "background:transparent",
        "transition:none",
      ].join(";");
      btn.style.opacity = "1";
      btn.style.transform = "scale(1)";
      btn.style.pointerEvents = "auto";
      pulse.style.display = "";
      badge.style.display = "none";
    }
  }

  function toggle() {
    setOpen(!isOpen);
    if (isOpen && isReady) {
      iframe.contentWindow.postMessage({ type: "CHAT_WIDGET_OPEN" }, "*");
    }
  }

  btn.addEventListener("click", toggle);

  // 接收 iframe 消息
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || typeof d !== "object") return;
    if (d.type === "CHAT_WIDGET_READY") {
      isReady = true;
      return;
    }
    if (d.type === "CHAT_WIDGET_CLOSE") {
      setOpen(false);
      return;
    }
    if (d.type === "CHAT_WIDGET_UNREAD" && typeof d.count === "number") {
      if (d.count > 0 && !isOpen) {
        badge.textContent = d.count > 99 ? "99+" : String(d.count);
        badge.style.display = "block";
      } else {
        badge.style.display = "none";
      }
    }
  });

  // 添加脉冲动画样式
  var styleEl = document.createElement("style");
  styleEl.textContent =
    "@keyframes chatWidgetPulse{0%{transform:scale(1);opacity:.4}70%{transform:scale(1.8);opacity:0}100%{transform:scale(1.8);opacity:0}}";
  document.head.appendChild(styleEl);

  // 延迟挂载按钮，等页面 load，避免抢占首屏资源
  function mount() {
    if (!document.body) {
      setTimeout(mount, 100);
      return;
    }
    document.body.appendChild(iframe);
    document.body.appendChild(btn);
    // 入场动画
    requestAnimationFrame(function () {
      btn.style.opacity = "1";
      btn.style.transform = "scale(1)";
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

  // 对外暴露 API
  window.ChatWidget = {
    open: function () {
      setOpen(true);
      if (isReady) iframe.contentWindow.postMessage({ type: "CHAT_WIDGET_OPEN" }, "*");
    },
    close: function () {
      setOpen(false);
    },
    toggle: toggle,
  };
})();
