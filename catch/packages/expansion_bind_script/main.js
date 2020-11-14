'use strict';
module.exports = {
    //初始化
    load() {
        Editor.clearLog("", true);
    },
    //卸载
    unload() { },
    //事件（消息）注册监听
    messages: {
        jsonCallMain() {
            Editor.clearLog("", true);
            Editor.log(Editor.Project.path);
            Editor.log(Editor.assetdb.exists("db://assets"));
            Editor.info(Editor.url("db://assets"));
            Editor.success(Editor.url("packages://bindscript"));
        },

        /**
         * 打开面板
         */
        opanPanel() {
            Editor.Panel.open("bindscript");
            setTimeout(() => {
                Editor.log("-----------1")
                Editor.Ipc.sendToPanel("bindscript", "panelFunc");
            }, 5000);
        },

        /**
         * 渲染界面按钮事件响应，调用场景脚本
         * @param {*} event 
         * @param {脚本文件名} className 
         * @param {保存路径} filePath 
         */
        callSceneScript(event, className, filePath) {
            Editor.Scene.callSceneScript("bindscript", "getCanvasChildren", className, filePath);
        },

        /**
         * 刷新编辑器资源面板
         * @param {*} event 
         */
        async refreshAssets(event) {
            return new Promise(resolve => {
                Editor.assetdb.refresh('db://assets/scripts', (err, results) => {
                    Editor.success("refresh success!");
                    if (event.reply) {
                        event.reply(null, "");
                    }
                    resolve();
                });
            });
        }
    }
}
