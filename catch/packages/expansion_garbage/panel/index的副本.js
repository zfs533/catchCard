Editor.Panel.extend({
  /* 面板样式 */
  style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,
  /* 面板模版 */
  template: `
    <h2>生成垃圾代码</h2>
    <ui-button id="btn">点击</ui-button>
    <hr />
    <div>状态: <span id="label">--</span></div>
  `,
  /* 获取面板元素 */
  $: {
    btn: "#btn",
    label: "#label",
  },
  /* 对面板元素中的事件进行处理和注册 */
  ready() {
    this.$btn.addEventListener('confirm', () => {
      this.$label.innerText = "hello";
      /* 面板渲染进程与主进程数据通讯 */
      Editor.Ipc.sendToMain('garbage:panelBtnClick', "panel_call_main");
    });
  },
  /* 接收主进程消息 */
  messages: {
    mainToPanel(event, param) {
      Editor.log(param);
      /* 回调函数处理 */
      // if (event.reply) {
      //   event.reply(null, "deal_call_back");
      // }
    }
  }
});

/*

var Fs = require('fs');
Editor.Panel.extend({
  // css style for panel
  style: Fs.readFileSync(Editor.url('packages://foobar/panel/index.css', 'utf8')),

  // html template for panel
  template: Fs.readFileSync(Editor.url('packages://foobar/panel/index.html', 'utf8')),
  //...
});

*/