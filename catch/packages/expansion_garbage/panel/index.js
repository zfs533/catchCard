let Fs = require('fs');
Editor.Panel.extend({
  /* 面板样式 */
  style: Fs.readFileSync(Editor.url('packages://garbage/panel/index.css', 'utf8')),
  /* 面板模版 */
  template: Fs.readFileSync(Editor.url('packages://garbage/panel/index.html', 'utf8')),

  ready() {
    new window.Vue({
      el: this.shadowRoot,
      /* 面板属性值 */
      data: {
        saveYes: true,
      },
      /* 面板调用方法 */
      methods: {
        onStartClick(event) {
          /* 面板渲染进程与主进程数据通讯 */
          Editor.Ipc.sendToMain('garbage:panelBtnClick', "panel_call_main");
        },
      },
    });
  },
  /* 接收主进程消息 */
  messages: {
    mainToPanel(event, param) {
      Editor.log(param);
    }
  }
});
