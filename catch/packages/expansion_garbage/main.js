'use strict';

module.exports = {
  load() {
  },
  unload() {
  },
  messages: {
    async openPanel() {
      Editor.log("hello3td!");
      Editor.log(Editor.Project.path);
      Editor.Panel.open("garbage");
    },
    panelBtnClick(event, param) {
      Editor.log(param);
      /* 主进程与面板渲染进程数据通讯 */
      Editor.Ipc.sendToPanel('garbage', 'mainToPanel', 'main_call_panel');
    }
  },
};