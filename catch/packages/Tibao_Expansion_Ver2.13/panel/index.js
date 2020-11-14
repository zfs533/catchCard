var path = require('path');
var fs = require('fs');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Editor.Panel.extend({
    style: fs.readFileSync(Editor.url('packages://tibao-tool/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://tibao-tool/panel/index.html', 'utf8')) + "",

    ready() {
        var that = this;
        this._vm = new window.Vue({
            el: this.shadowRoot,
            data: {
                iconPath: '',           // icon 路径
                startImagePath: '',     // 启动图路径
                meixImagePath: '',      // 美宣图路径
                invalid_res: true,      // 是否在res文件夹内生成垃圾文件
                invalid_src: true,      // 是否在src文件夹内生成垃圾文件
                invalid_script: true,   // 是否在script文件夹内生成垃圾文件
                invalid_factor: 1,      // 生成垃圾文件的全局因子
                encryption_res: true,   // 是否加密res文件夹内的文件
                encryption_src: true,   // 是否加密src文件夹内的文件
                encryption_script: true,// 是否加密script文件夹内的文件
                isRename: true,         // 是否重命名
                isMd5: true,            // 是否改变文件md5
                sceneUrl: [],           // 游戏内所有场景的数组
                buildScene: '',         // 游戏的第一个场景
                projName: 'pack',       // 游戏名称，默认pack
                cppParam: '',           // 生成C++类参数
                xxteaKey: '',           // js脚本加密密钥
                hotXxteaKey: 'null',    // 热更新加密密钥
                orientation: {          // 旋转选项，默认横屏
                    "landscapeLeft": true,
                    "landscapeRight": true,
                    "portrait": false,
                    "upsideDown": false
                },
                openXcode: false,       // 是否在构建结束后自动打开Xcode
                hotUpdateML: [          // 热更新结束后更改main.js文件,包含使用的cocos creator 引擎
                    { text: "无热更新，不修改", value: "null" },
                    { text: "cocos creator 1.9.3", value: "193" },
                    { text: "cocos creator 2.0.9", value: "209" }
                ],
                hotUpdateM: "",         // 热更新结束后更改main.js文件
                IsModifyClass: true,    // 是否修改自定义引擎的类名
                IsModifyEngine: true,    //混淆引擎源代码
                logView: "",            // log视图
                isBuilding: false,         // 是否正在构建
            },
            methods: {

                /**
                 * 打开对话框框选择一个文件
                 */
                onChooseFile: function (event) {
                    event.stopPropagation();
                    var target = event.target;
                    var defaultPath = '';
                    switch (target.id) {
                        case 'chooseIcon':
                            defaultPath = this.iconPath;
                            break;
                        case 'chooseStartImage':
                            defaultPath = this.startImagePath;
                            break;
                        case 'chooseMeixImage':
                            defaultPath = this.meixImagePath;
                            break;
                        default:
                            break;
                    }

                    let res = Editor.Dialog.openFile({
                        defaultPath: defaultPath,
                        properties: ['openFile']
                    });

                    if (res && res[0]) {
                        switch (target.id) {
                            case 'chooseIcon':
                                this.iconPath = res[0];
                                break;
                            case 'chooseStartImage':
                                this.startImagePath = res[0];
                                break;
                            case 'chooseMeixImage':
                                this.meixImagePath = res[0]
                                break;
                            default:
                                break;
                        }
                    }
                },

                /**
                 *点击构建按钮
                 */
                onBuildClick: function (event) {
                    event.stopPropagation();
                    this.logView = " "
                    let genInvalid = {
                        res: this.invalid_res,
                        src: this.invalid_src,
                        script: this.invalid_script,
                        factor: this.invalid_factor
                    }
                    let enc = {
                        res: this.encryption_res,
                        src: this.encryption_src,
                        script: this.encryption_script
                    }
                    that._save();
                    Editor.Ipc.sendToMain("tibao-tool:buildProj", this.iconPath, this.startImagePath, this.projName, this.buildScene, this.xxteaKey, genInvalid, enc, this.orientation, this.openXcode, this.isMd5, this.hotUpdateM, this.IsModifyClass, this.cppParam, this.isRename, this.IsModifyEngine, this.meixImagePath)
                },

                /**
                 * 随机生成密钥
                 */
                onGenJsbXxteaKey: function () {
                    let str1 = Math.random().toString(36).substr(2).slice(0, 8)
                    let str2 = Math.random().toString(36).substr(2).slice(0, 4)
                    let str3 = Math.random().toString(36).substr(2).slice(0, 2)
                    let str = str1 + '-' + str2 + '-' + str3
                    this.xxteaKey = str
                },

                /**
                 * 改变热更新平台密钥
                 */
                onChangeHotXX: function () {
                    switch (this.hotXxteaKey) {
                        case "null":
                            this.onGenJsbXxteaKey();
                            break;
                        case "clear":
                            this.xxteaKey = "";
                            break;
                        default:
                            this.xxteaKey = this.hotXxteaKey;
                            break;
                    }
                    that._save();
                },

                onChangeCppNumber: function () {
                    this.cppParam = getRandomInt(123, 321).toString();
                },
            }
        });
        this._getScenes();
        this._init();
        this._save();
        this._vm.onChangeCppNumber();
        this._vm.onChangeHotXX();
    },

    messages: {
        setlog(event, log, type) {
            this._vm.logView += `${log}\n`
        },

        save() {
            this._save()
        },

        setBuild(event, isBuild) {
            this._vm.isBuilding = isBuild;
        }
    },

    /**
     * 初始化属性
     */
    _init: function () {
        let builderJsonPath = path.join(Editor.url("db://assets"), '../settings/builder.json')
        if (!fs.existsSync(builderJsonPath)) {
            Editor.log('builder.json--- 不存在 ---');
            return;
        }
        var data = fs.readFileSync(builderJsonPath, "utf-8")
        let buildJson = JSON.parse(data)

        for (let key in this._vm) {
            this._vm[key] = buildJson[key] === undefined ? this._vm[key] : buildJson[key];
        }
    },

    /**
     * 保存属性
     */
    _save: function () {
        let builderJsonPath = path.join(Editor.url("db://assets"), '../settings/builder.json')
        if (!fs.existsSync(builderJsonPath)) {
            Editor.log('builder.json--- 不存在 ---');
            return;
        }
        var data = fs.readFileSync(builderJsonPath, "utf-8")
        let buildJson = JSON.parse(data)

        for (const key in this._vm) {
            if (key.indexOf('$') != 0 && key.indexOf('_') != 0) {
                buildJson[key] = this._vm[key] === undefined ? buildJson[key] : this._vm[key]
            }
        }

        fs.writeFile(builderJsonPath, JSON.stringify(buildJson, null, '\t'), function (err) {
            if (err) Editor.error(err.messages);
        });
    },

    /**
     * 获取游戏中全部场景
     */
    _getScenes: function () {
        Editor.assetdb.queryAssets('db://assets/**\/*', 'scene', (err, results) => {
            var ret = [];
            results.forEach((result) => {
                ret.push({
                    value: result.uuid,
                    text: result.url
                })
            });

            this._vm.sceneUrl = ret;
            this._vm.buildScene = ret[ret.length - 1].value
            this._vm.hotUpdateM = this._vm.hotUpdateML[0].value;
        });
    }
});