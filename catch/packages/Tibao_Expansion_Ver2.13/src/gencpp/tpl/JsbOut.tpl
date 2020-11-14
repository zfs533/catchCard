# 模块名称
[${MODULE_NAME}]

# 绑定回调函数的前缀，也是生成的自动绑定文件的前缀
prefix = ${MODULE_NAME}

# 绑定的类挂载在 JS 中的哪个对象中，类似命名空间
target_namespace =

# 自动绑定工具基于 Android 编译环境，此处配置 Android 头文件搜索路径
android_headers = -I%(androidndkdir)s/platforms/android-14/arch-arm/usr/include -I%(androidndkdir)s/sources/cxx-stl/gnu-libstdc++/4.8/libs/armeabi-v7a/include -I%(androidndkdir)s/sources/cxx-stl/gnu-libstdc++/4.8/include -I%(androidndkdir)s/sources/cxx-stl/gnu-libstdc++/4.9/libs/armeabi-v7a/include -I%(androidndkdir)s/sources/cxx-stl/gnu-libstdc++/4.9/include

# 配置 Android 编译参数
android_flags = -D_SIZE_T_DEFINED_

# 配置 clang 头文件搜索路径
clang_headers = -I%(clangllvmdir)s/%(clang_include)s

# 配置 clang 编译参数
clang_flags = -nostdinc -x c++ -std=c++11 -U __SSE__


# 配置引擎的头文件搜索路径
cocos_headers = -I%(cocosdir)s/cocos -I%(cocosdir)s/cocos/platform/android -I%(cocosdir)s/external/sources

# 配置引擎编译参数
cocos_flags = -DANDROID -DCOCOS2D_JAVASCRIPT

# 配置额外的编译参数ok
extra_arguments = %(android_headers)s %(clang_headers)s %(cocos_headers)s %(android_flags)s %(clang_flags)s %(cocos_flags)s %(extra_flags)s

# 需要自动绑定工具解析哪些头文件ok 等待修改
headers = ${HEADER_CONTENT} 


# 在生成的绑定代码中，重命名头文件
replace_headers=

# 需要绑定哪些类，可以使用正则表达式，以空格为间隔
classes = ${BIND_CLASS_CONTENT} 

# 哪些类需要在 JS 层通过 cc.Class.extend，以空格为间隔
classes_need_extend = 

# 需要为哪些类绑定属性，以逗号为间隔
field = 

# 需要忽略绑定哪些类，以逗号为间隔
skip = 

# 重命名函数，以逗号为间隔
rename_functions = 

# 重命名类，以逗号为间隔
rename_classes = 

# 配置哪些类不需要搜索其父类
classes_have_no_parents = 

# 配置哪些父类需要被忽略
base_classes_to_skip =

# 配置哪些类是抽象类，抽象类没有构造函数，即在 js 层无法通过 var a = new SomeClass();的方式构造 JS 对象
abstract_classes = 

# 配置哪些类是始终以一个实例的方式存在的，游戏运行过程中不会被销毁
persistent_classes = 

# 配置哪些类是需要由 CPP 对象来控制 JS 对象生命周期的，未配置的类，默认采用 JS 控制 CPP 对象生命周期
classes_owned_by_cpp =

remove_prefix=
script_control_cpp = no
