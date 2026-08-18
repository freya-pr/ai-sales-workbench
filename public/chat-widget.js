/**
 * AI 销售工作台 - 网页客服组件
 * 将此脚本嵌入任意网站即可启用在线客服功能
 *
 * 使用方法：
 * <script src="https://freya-pr.github.io/ai-sales-workbench/chat-widget.js"></script>
 *
 * 可选配置：
 * <script>
 *   window.CHAT_WIDGET_CONFIG = {
 *     title: '在线咨询',
 *     subtitle: 'AI顾问在线',
 *     primaryColor: '#0891b2'
 *   };
 * </script>
 */
(function () {
  "use strict";

  var config = window.CHAT_WIDGET_CONFIG || {};
  var WIDGET_URL = config.url || "https://freya-pr.github.io/ai-sales-workbench/widget";
  var BTN_COLOR = config.primaryColor || "#0891b2";
  var BTN_SIZE = config.buttonSize || 56;

  // 创建 iframe
  var iframe = document.createElement("iframe");
  iframe.src = WIDGET_URL;
  iframe.style.cssText = [
    "position:fixed",
    "bottom:0",
    "right:0",
    "width:0",
    "height:0",
    "border:0",
    "z-index:2147483647",
    "transition:none",
    "background:transparent",
  ].join(";");
  iframe.setAttribute("allow", "clipboard-write");
  iframe.title = "在线客服";

  // 创建悬浮按钮
  var btn = document.createElement("button");
  btn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
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
    "box-shadow:0 4px 16px rgba(8,145,178,0.35)",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "transition:transform 0.2s ease, box-shadow 0.2s ease",
  ].join(";");

  // 脉冲动画
  var pulse = document.createElement("span");
  pulse.style.cssText = [
    "position:absolute",
    "inset:0",
    "border-radius:50%",
    "background:rgba(8,145,178,0.3)",
    "animation:chatWidgetPulse 2s ease-out infinite",
    "pointer-events:none",
  ].join(";");
  btn.appendChild(pulse);

  var isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      // 展开窗口
      var w = Math.min(400, window.innerWidth - 24);
      var h = Math.min(560, window.innerHeight * 0.75);
      iframe.style.width = w + "px";
      iframe.style.height = h + "px";
      iframe.style.right = (config.right || "16px");
      iframe.style.bottom = (config.bottom || "16px");
      iframe.style.borderRadius = "16px";
      iframe.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)";
      iframe.style.transition = "all 0.3s ease";
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
      btn.style.transform = "scale(1)";
      pulse.style.display = "none";
      // 通知 iframe 打开
      try {
        iframe.contentWindow.postMessage({ type: "CHAT_WIDGET_OPEN" }, "*");
      } catch (e) {}
    } else {
      // 收起
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.boxShadow = "none";
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
      btn.appendChild(pulse);
      pulse.style.display = "";
    }
  }

  btn.addEventListener("click", toggle);
  btn.addEventListener("mouseenter", function () {
    btn.style.transform = "scale(1.08)";
    btn.style.boxShadow = "0 6px 20px rgba(8,145,178,0.45)";
  });
  btn.addEventListener("mouseleave", function () {
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "0 4px 16px rgba(8,145,178,0.35)";
  });

  // 监听 iframe 内的关闭消息
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "CHAT_WIDGET_CLOSE" && isOpen) {
      toggle();
    }
  });

  // 添加动画样式
  var style = document.createElement("style");
  style.textContent =
    "@keyframes chatWidgetPulse{0%{transform:scale(1);opacity:0.7}70%{transform:scale(1.8);opacity:0}100%{transform:scale(1);opacity:0}}";
  document.head.appendChild(style);

  // 等待 DOM ready
  function mount() {
    document.body.appendChild(iframe);
    document.body.appendChild(btn);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
