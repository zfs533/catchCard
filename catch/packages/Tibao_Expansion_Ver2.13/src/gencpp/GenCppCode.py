#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import os
import random
import re
from string import Template
import GenTools

strNumber0 = '1234'
strNumber1 = '56789'
strNumber  = '0123456789' 

integerValueTypeList = ['int', 'long', 'unsigned int', 'unsigned long']
floatValueTypeList = ['double', 'float']
allValueTypeList = ['int', 'double', 'long', 'float', 'char', 'unsigned int', 'unsigned long', 'bool', 'vector']
valueTypeList2 = ['int', 'long', 'bool', 'unsigned int', 'unsigned long'] 
operTypeList = '+-*/'
binoperTypeList = '&|%'

# 测试 tools
def testGenTools():
    return GenTools.randMemberFuncName('CCStyle') + '@@@@' + GenTools.randClassNameByModuleName('CCStryle') + '@@@@' + GenTools.randMemberPropertyName('int') + '@@@@' + GenTools.randCName('CCStyle')

# 生成函数体1, 简单参数操作
# paramList = {{valType = 'int', valName = 'addGold'} ... }
def genSampleParamExp(paramList, inputName, cstyle):
    strExp = ''
    sumName = GenTools.randCStyleName() if(cstyle == 'c') else GenTools.randTFName()
    if inputName != '':
        sumName = inputName

    if inputName == '':
        strExp = integerValueTypeList[random.randint(0, len(integerValueTypeList) - 1)] + ' ' + sumName + ' = 0;\n'

    # gen: sum = p1 + p2 + ...
    for i in range(len(paramList)):
        param = paramList[i]
        if param['valType'] != 'bool':
            if i == 0:
                strExp = strExp + '\t' + sumName + ' = ' +  param['valName'] + ' '
            else:
                strExp = strExp + random.choice(operTypeList) + ' ' + param['valName'] + ' '
        else:
            strBooleanValue = random.choice(strNumber)
            if i == 0:
                strExp = strExp + '\t' + sumName + ' = ' + strBooleanValue + ' '
            else:
                strExp = strExp + random.choice(operTypeList) + ' ' + strBooleanValue + ' '
    strExp = strExp + ';\n\n'
    
    
    for i in range(len(paramList)):
        param = paramList[i]
        if param['valType'] == 'int' or param['valType'] == 'long' or param['valType'] == 'char' or param['valType'] == 'unsigned int' or param['valType'] == 'unsigned long':
            expName = GenTools.randCStyleName() if(cstyle == 'c') else GenTools.randTFName()
            # int name = sum<<param
            exp = '\tint ' + expName + ' = ' + sumName + ' ' + random.choice(operTypeList) + ' ' + param['valName'] + ';\n'
            # 生成规则，后面完善
            if random.randint(0,1) > 0: # sum = sum + sum&val
                exp = exp + '\t' + sumName + ' = ' + sumName + ' + '  + sumName + '&' + expName + ';\n'
            else: # value = sum|cos(val%rand) + sum&sin(val%rand)
                exp = exp + '\t' + sumName + ' = ' + sumName + '/' + 'cos(' + expName + " + " + (random.choice(strNumber1) if(random.randint(0,1) > 0 ) else random.choice(strNumber0)) + ')' + ' + '
                exp = exp + sumName + '*' + 'sin(' + expName + '-' + (random.choice(strNumber1) if(random.randint(0,1) > 0 ) else random.choice(strNumber0)) + ')'
                exp = exp + ';\n'
            strExp = strExp + exp + '\n\n'
        elif param['valType'] == 'double' or param['valType'] == 'float':
            expName = GenTools.randCStyleName() if(cstyle == 'c') else GenTools.randTFName()
            exp = '\tdouble ' + expName + ' = ' + sumName + random.choice(operTypeList) + 'tan(' + param['valName'] + ')' + ' + ' + sumName + '*' + '1.0/tan(' + param['valName'] + ');\n'
            exp = exp + '\t' + sumName + ' += ' + expName + ';\n\n'
            strExp = strExp + exp + '\n\n'
        elif param['valType'] == 'bool':
            exp = '\tif(' + param['valName'] + ') {\n\t\t' + sumName + ' = ' + sumName + '<<' + str(random.randint(1,4)) + ';\n\t} else {\n\t\t'
            exp = exp + sumName + ' = ' + sumName + '<<' + str(random.randint(1,4)) + ';\n\t}\n'
            strExp = strExp + exp + '\n\n'
    return strExp

# 参数是列表时,列表不能是bool数据类型
# lstParam = {valType, valName}
def genListParamExp(lstParam, inputName, cstyle):
    strExp = ''
    sumName = GenTools.randCStyleName() if(cstyle == 'c') else GenTools.randTFName()

    if inputName != '':
        sumName = inputName
    
    if inputName == '':
        if lstParam['valType'] == 'int' or lstParam['valType'] == 'long' or lstParam['valType'] == 'unsigned int' or lstParam['valType'] == 'unsigned long':
            strExp = strExp + 'long ' + sumName + ' = 0;\n\n'
        else:
            strExp =  strExp + 'double ' + sumName + ' = 0.0;\n\n'
    
    strExp = strExp + 'for(unsigned i = 0; i < ' + lstParam['valName'] + '.size(); i++) {\n'
    strExp = strExp + genSampleParamExp([{'valType':lstParam['valType'], 'valName':lstParam['valName'] + '[i]'}], sumName, cstyle)
    strExp = strExp + '}\n'

    return strExp

#生成数据列表
def genStaticData(staticName, valueType):
    strTpl = 'static ${VALUE_TYPE} ${VALUE_NAME}[] = { ${CONTENT} \n}'
    strContnt = ''
    iLen = random.randint(32, 512)
    if valueType == 'int' or valueType == 'long' or valueType == 'unsigned int' or valueType == 'unsigned long':
        for i in range(iLen):
            if i%16 == 0:
                strContnt = strContnt + '\n\t'
            strContnt = strContnt + str(random.randint(0, 1920)) + ','
    elif valueType == 'double' or valueType == 'float':
        for i in range(iLen):
            if i%16 == 0:
                strContnt = strContnt + '\n\t'
            strContnt =  strContnt + ('%5.4f'%random.random()) + ','
    elif valueType == 'bool':
        valueType = 'char'
        for i in range(iLen):
            if i%16 == 0:
                strContnt = strContnt + '\n\t'
            strContnt = strContnt + ('1' if(random.randint(0,1) > 0 ) else '0') + ','
    elif valueType == 'char':
        for i in range(iLen):
            if i%16 == 0:
                strContnt = strContnt + '\n\t'
            strContnt = strContnt + '0x%x'%random.randint(0, 127) + ','
    return ''.join( Template(strTpl).substitute(VALUE_TYPE = valueType, VALUE_NAME = staticName, CONTENT = strContnt) ) + ';'

# 生成成员属性
def genClassMemberProperty():
    strExp = ''
    valueList = [] # lst = [{'valType': 'int', 'valName': 'member'}]
    strTemplate = '${MEMBER_TYPE} ${MEMBER_NAME};'
    memberNumber = random.randint(5, 50)
    for _ in range(memberNumber):
        strValType = allValueTypeList[random.randint(0, len(allValueTypeList) - 2)] #排除vector
        strValName = GenTools.randMemberPropertyName(strValType)
        if strValType == 'vector':
            strValType = 'std::vector<' + allValueTypeList[random.randint(0, len(allValueTypeList) - 3)] + '>'
        strExp = strExp + '\t' + ''.join( Template(strTemplate).substitute(MEMBER_TYPE = strValType, MEMBER_NAME = strValName) ) + '\n'
        valueList.append({'valType': strValType, 'valName': strValName})
    return {'exp': strExp, 'mbrlst': valueList}

# 生成属性getter, setter声明
def genGetterAndSetterPropertyFunction(propertyInfo):
    strExp = ''
    funLst = [] # lst = [{'rt': returnType, 'name': functionName, 'prmlst': paramList, 'prmexp': void}]
    strTemplate = '${RETURN} ${NAME}(${PARAM});'
    propLst = propertyInfo['mbrlst']
    for i in range(len(propLst)):
        prop = propLst[i]
        getFunc = '\t' + ''.join(Template(strTemplate).substitute(RETURN = prop['valType'], NAME = 'out' + prop['valName'], PARAM = 'void')) + '\n'
        param = prop['valType'] + ' pp' +  prop['valName']
        if 'std::vector' in prop['valType']:
            param = 'const ' + prop['valType'] + '& pp' + prop['valName']
        setFunc = '\t' + ''.join(Template(strTemplate).substitute(RETURN = 'void', NAME = 'in' + prop['valName'], PARAM = param)) + '\n\n'
        strExp = strExp + getFunc + setFunc
        funLst.append({'rt': prop['valType'], 'name': 'out' + prop['valName'], 'prmlst':[], 'prmexp': 'void'}) # get func
        #set func
        funLst.append({'rt': 'void', 'name': 'in' + prop['valName'], 'prmlst':[{'valType': prop['valType'], 'valName': 'pp' + prop['valName']}], 'prmexp': param})
    return strExp

# 定义属性函数getter, setter
def genGetterAndSetterPropertyFunctionDefine(className, propertyInfo):
    strExp = ''
    tplFile = open(r'./tpl/CppMemberFunctionTemplate.tpl','r')
    strTpl  = tplFile.read()
    tplFile.close()

    propLst = propertyInfo['mbrlst']
    for i in range(len(propLst)):
        prop = propLst[i]
        gname = 'out' + prop['valName']
        gbody = 'return ' + prop['valName'] + ';'
        getFunc = ''.join(Template(strTpl).substitute(RETURN_TYPE = prop['valType'], CLASS_NAME = className, FUNCTION_NAME = gname, FUNCTION_PARAM_LIST = 'void', FUNCTION_BODY = gbody))
        strExp = strExp + getFunc
        strExp = strExp + '\n\n'

        sname = 'in' + prop['valName']
        sbody = prop['valName'] + ' = pp' + prop['valName'] + ';'
        sparam = prop['valType'] + ' pp' +  prop['valName']
        if 'std::vector' in prop['valType']:
            sparam = 'const ' + prop['valType'] + '& pp' + prop['valName']
        setFunc = ''.join(Template(strTpl).substitute(RETURN_TYPE = 'void', CLASS_NAME = className, FUNCTION_NAME = sname, FUNCTION_PARAM_LIST = sparam, FUNCTION_BODY = sbody))
        strExp = strExp + setFunc
        strExp =  strExp + '\n\n\n\n'
    return strExp

# 生成属性初始化
def genInitProperty(propertyInfo):
    strExp = ''
    propLst = propertyInfo['mbrlst']
    for i in range(len(propLst)):
        prop = propLst[i]
        if 'std::vector' in prop['valType']:
            strExp = strExp + '\t' + prop['valName'] + '.clear();\n\n'
        else:
            strExp = strExp + '\t' + prop['valName'] + ' = 0;\n\n'
    return strExp

# 生成反初始化
def genDeleteProperty(propertyInfo):
    strExp = ''
    propLst = propertyInfo['mbrlst']
    for i in range(len(propLst)):
        prop = propLst[i]
        if 'std::vector' in prop['valType']:
            strExp = strExp + '\t' + prop['valName'] + '.clear();\n\n'
    return strExp

# 生成成员函数声明
def genClassMemberFunc(className):
    strExp = ''
    funList = [] # lst = [{'rt': returnType, 'name': functionName, 'prmlst': paramList, 'prmexp': void}]
    strTemplate = '${RETURN} ${NAME}(${PARAM});'
    for _ in range(random.randint(5, 50)):
        paramList = [] # lst = [{'valType': 'int', 'valName': 'member'}]
        strReturnType = allValueTypeList[random.randint(0, len(allValueTypeList) - 2 )] #排除vector
        if random.randint(0,3) == 0:
            strReturnType = 'void'
        strFuncName = GenTools.randMemberFuncName(className)

        strParamExp = ''
        paramNumber = random.randint(0, 5)
        for i in range(paramNumber):
            strParamType = allValueTypeList[random.randint(0, len(allValueTypeList) - 2 )] #排除vector
            strParamName = GenTools.randTFName()
            strParamExp = strParamExp + strParamType + ' ' + strParamName
            if i < paramNumber - 1:
                strParamExp = strParamExp + ','
            paramList.append({'valType': strParamType, 'valName': strParamName})
        if strParamExp == '':
            strParamExp = 'void'
        strFunExp = '\t' + ''.join(Template(strTemplate).substitute(RETURN = strReturnType, NAME = strFuncName, PARAM = strParamExp)) + '\n'
        strExp = strExp + strFunExp
        funList.append({'rt': strReturnType, 'name': strFuncName, 'prmlst': paramList, 'prmexp': strParamExp})
    return {'exp': strExp, 'funlst': funList}

# 生成成员函数定义
def genClassMemberFuncDefine(className, funcInfo, propertyInfo):
    strExp = ''
    funcLst = funcInfo['funlst']
    tplFile = open(r'./tpl/CppMemberFunctionTemplate.tpl','r')
    strTpl  = tplFile.read()
    tplFile.close()

    for i in range(len(funcLst)):
        func = funcLst[i]
        funcBody = ''

        prmLst = func['prmlst']
        prmVecLst = []

        if len(prmLst) == 0 or random.randint(0, 1) > 0:
            propLen = len(propertyInfo['mbrlst'])
            for _ in range(random.randint(3, propLen)):
                prop = propertyInfo['mbrlst'][random.randint(0, propLen - 1)]
                if 'std::vector' in prop['valType']:
                    prmVecLst.append(prop)
                else:
                    prmLst.append(prop)
        
        strSumName = GenTools.randTFName() if(random.randint(0,1) > 0) else GenTools.randCStyleName()
        funcBody = funcBody + integerValueTypeList[random.randint(0, len(integerValueTypeList) - 1)] + ' ' + strSumName + ' = 0;\n\n'
        
        # 通过传入参数生成函数体
        if len(prmLst) > 0 :
            funcBody = funcBody + genSampleParamExp(prmLst, strSumName, 'none')
            funcBody = funcBody + '\n'
        
        # 关联类成员变量
        if len(prmVecLst) > 0:
            for j in range(len(prmVecLst)):
                prmvec = prmVecLst[j]
                val = ''.join(re.compile('<.*>').search(prmvec['valType']).group())
                param = {'valType': ''.join(val[1:len(val) - 1]), 'valName': prmvec['valName']}
                funcBody = funcBody + genListParamExp(param, strSumName, 'none')
                funcBody = funcBody + '\n'

        funcBody = funcBody + '\n\n'

        # 最后一行
        if func['rt'] == 'void':
            prop = propertyInfo['mbrlst'][random.randint(0, len(propertyInfo['mbrlst']) -1)]
            if 'std::vector' in prop['valType']:
                funcBody = funcBody + '\t' + prop['valName'] + '.push_back(' + strSumName + ');' + '\n\n'
            elif prop['valType'] == 'bool':
                funcBody = funcBody + '\t' + prop['valName'] + ' = ' + strSumName + ' > ' + str(random.randint(0, 9999)) + ' ? true : false;\n\n'
            else:
                funcBody = funcBody + '\t' + prop['valName'] + ' = ' + '(' + prop['valType'] + ')' + strSumName + ';\n\n'
        else:
            funcBody = funcBody + '\treturn (' + func['rt'] + ')' + strSumName + ';\n\n'
        

        funcExp = ''.join(Template(strTpl).substitute(RETURN_TYPE = func['rt'], CLASS_NAME = className, FUNCTION_NAME = func['name'], FUNCTION_PARAM_LIST = func['prmexp'], FUNCTION_BODY = funcBody))
        funcExp = funcExp + '\n\n'
        strExp =  strExp + funcExp
    return strExp

# 生成全局静态函数
def genStaticFunc():
    strExp = ''
    strTemp = '${RETURN_TYPE} ${NAME}(${PARAM});'
    funcNumber = random.randint(3, 10)
    funList = [] # lst = [{'rt': returnType, 'name': functionName, 'prmlst': paramList, 'prmexp': void}]
    for _ in range(funcNumber):
        paramList = [] # lst = [{'valType': 'int', 'valName': 'member'}]
        funcName = 'out' + GenTools.randCStyleName()
        returnType = allValueTypeList[random.randint(0, len(allValueTypeList) - 2)] + '*'
        paramType = 'int'
        paramName = 'len_' + GenTools.randCStyleName()
        paramExp = paramType + '& ' + paramName
        if returnType == 'bool*':
            returnType = 'char*'

        funcExp = ''.join(Template(strTemp).substitute(RETURN_TYPE = returnType, NAME = funcName, PARAM = paramExp))
        strExp =  strExp + funcExp + '\n\n\n'

        paramList.append({'valType': paramType, 'valName': paramName})
        funList.append({'rt': returnType, 'name': funcName, 'prmlst': paramList, 'prmexp': paramExp })
    return {'exp': strExp, 'funlst': funList}

# 定义局静态函数
def genStaticFuncDefine(funInfo):
    strExp = ''
    funcLst = funInfo['funlst']
    tplFile = open(r'./tpl/CppGlobalFunctionTemplate.tpl','r')
    strTpl  = tplFile.read()
    tplFile.close()                

    for i in range(len(funcLst)):
        fun = funcLst[i]
        datName = ''.join(fun['name'][4:])
        datType = ''.join(fun['rt'][0: len(fun['rt']) - 1])
        strDataExp = genStaticData(datName, datType)
        funcBody = fun['prmlst'][0]['valName'] + ' = sizeof(' + datName + ');\n' 
        funcBody = funcBody + '\treturn ' + datName + ';\n'
        funcExp = ''.join(Template(strTpl).substitute(RETURN_TYPE = fun['rt'], FUNCTION_NAME = fun['name'], FUNCTION_PARAM_LIST = fun['prmexp'], FUNCTION_BODY = funcBody))
        strExp = strExp + strDataExp + '\n' + funcExp + '\n\n\n'
    return strExp

# 生成C++类文件
def genCppClassFile(projectName, number, path):
    tplHFile = open(r'./tpl/GenTempCpp.h.tpl','r')
    strHTpl  = tplHFile.read()
    tplHFile.close()

    tplCppFile = open(r'./tpl/GenTempCpp.cpp.tpl','r')
    strCppTpl = tplCppFile.read()
    tplCppFile.close()

    classInfo = [] # lst = [{'name': className, 'prop': property, 'member': memberFunction}]

    for _ in range(number):
        className = GenTools.randClassNameByModuleName(projectName)

        # property
        propertyInfo = genClassMemberProperty()
        propertyFuncExp = genGetterAndSetterPropertyFunction(propertyInfo)
        propertyFuncDefineExp = genGetterAndSetterPropertyFunctionDefine(className, propertyInfo)
        propertyInitExp = genInitProperty(propertyInfo)
        propertyDeletExp = genDeleteProperty(propertyInfo)

        memberFunctionInfo = genClassMemberFunc(className)
        memberFunctionDefineExp = genClassMemberFuncDefine(className, memberFunctionInfo, propertyInfo)
        
        strHExp = ''.join(Template(strHTpl).substitute(CLASS_NAME = className, PUBLIC_FUNC = propertyFuncExp + memberFunctionInfo['exp'], CLASS_MEMBER = propertyInfo['exp']))
        propertyDeletExp = propertyDeletExp if(propertyDeletExp != '') else '// add your logic here'
        strCppExp = ''.join(Template(strCppTpl).substitute(HEAD_FILE_NAME = className, CLASS_NAME = className, MEMBER_INIT_CODE = propertyInitExp, DELETE_MEMBER_CODE = propertyDeletExp, MEMBER_FUNC_DEFINE = propertyFuncDefineExp + memberFunctionDefineExp))

        hfile = open(path + className + '.h','w')
        hfile.write(strHExp)
        hfile.close()

        cppfile = open(path + className + '.cpp','w')
        cppfile.write(strCppExp)
        cppfile.close()

        classInfo.append({'name': className, 'prop': propertyInfo, 'member': memberFunctionInfo})
    return classInfo

# 生成静态数据函数
def genStaticGlobalFile(projectName, number, path):
    tplHFile = open(r'./tpl/GenStaticDataCppCode.h.tpl','r')
    strHTpl  = tplHFile.read()
    tplHFile.close()

    tplCppFile = open(r'./tpl/GenStaticDataCppCode.cpp.tpl','r')
    strCppTpl = tplCppFile.read()
    tplCppFile.close()

    classInfo = [] # lst = [{'name': className, 'prop': property, 'member': memberFunction}]

    for _ in range(number):
        className = GenTools.randCStyleName()

        staticInfo = genStaticFunc()
        staticFuncExp = genStaticFuncDefine(staticInfo)

        strHExp = ''.join(Template(strHTpl).substitute(DATA_FUNCTION = staticInfo['exp']))
        strCppExp = ''.join(Template(strCppTpl).substitute(HEAD_FILE_NAME = className, FUNCTION_DEFINE = staticFuncExp))

        hfile = open(path + className + '.h','w')
        hfile.write(strHExp)
        hfile.close()

        cppfile = open(path + className + '.cpp','w')
        cppfile.write(strCppExp)
        cppfile.close()
        classInfo.append({'name': className, 'prop': 'none', 'member': staticInfo})
    return classInfo

# 生成调用代码
def genCallClassCode(classInfo, refClassLst, useClassLst, stsClassInfo, strFmt):
    tplFile = open(r'./tpl/CallClassCode.tpl','r')
    strTpl = tplFile.read()
    tplFile.close()

    strCallExp = ''

    # 调用成员函数生成判断逻辑
    strLogicContent = ''
    logicParamList = [] # lst = [{'valType': 'int', 'valName': name}]
    callClassPropTpl = '${FMT}${CLASS_NAME} ${PROP_NAME};\n${FMT}${PARAM} = ${PROP_NAME}.out${PROP}();'
    for _ in range(random.randint(2, 5)):
        strName = GenTools.randTFName()
        strType = valueTypeList2[random.randint(0,len(valueTypeList2) - 1)]
        for i in range(len(useClassLst)):
            clsinf = useClassLst[i]
            subLogicExp = ''
            for j in range(len(clsinf['prop']['mbrlst'])):
                prop = clsinf['prop']['mbrlst'][j]
                if ((strType in integerValueTypeList) and (prop['valType'] in integerValueTypeList)) or strType == prop['valType']:
                    propName = GenTools.randTFName()
                    subLogicExp = (strFmt if(strLogicContent != '') else '') + strType + ' ' + strName + ' = 0;\n'
                    subLogicExp = subLogicExp + ''.join(Template(callClassPropTpl).substitute(FMT = strFmt, CLASS_NAME = clsinf['name'], PROP_NAME = propName, PARAM = strName, PROP = prop['valName'])) + '\n\n'
                    strLogicContent = strLogicContent + subLogicExp
                    break
            if subLogicExp != '':
                break
        logicParamList.append({'valType': strType, 'valName': strName})
    strLogic = ''
    strAdd = ''
    for i in range(len(logicParamList)):
        prm = logicParamList[i]
        strLogic = strLogic + prm['valName']
        strAdd = strAdd + prm['valName']
        if i < len(logicParamList) - 1:
            strAdd = strAdd + ' + '
            strLogic = strLogic + (' && ' if(random.randint(0, 1) > 0) else '|')
    # 调用函数生成初始化程序
    strCallContent = ''
    callClassPropTplSet = '${FMT}${HAND_NAME}->in${PROP}(${SET_PARAM});'
    memberName = ''.join(Template('p${RETURN_CLASS}').substitute(RETURN_CLASS = classInfo['name']))
    propInfo = classInfo['prop']['mbrlst'][ random.randint(0, len(classInfo['prop']['mbrlst']) -1 ) ]
    strCallContent = strCallContent + ''.join(Template(callClassPropTplSet).substitute(FMT = strFmt, HAND_NAME = memberName, PROP = propInfo['valName'], SET_PARAM = strAdd))

    strCallExp = ''.join(Template(strTpl).substitute(LOGIC_CONTENT = strLogicContent, LOGIC = strLogic, CALL_CONTENT = strCallContent, FMT = strFmt))


    return strCallExp


# 生成调用类
# cppClassInfo = [{'name': className, 'prop': property, 'member': memberFunction}]
# staticClassInfo = [{'name': className, 'prop': property, 'member': memberFunction}]
def genCallFunctionClass(projectName, cppClassInfo, staticClassInfo, path):
    classInfo = [] # lst = [{'name': className, 'inst': getInstanceName 'member': memberFunction}]
    # className = projectName + 'Class' + ('Exporter' if(random.randint(0,1) > 0) else 'Factory')
    className = projectName + 'Class'
    classInfo.append({'name': className, 'inst': 'none', 'member': 'none'})
    
########################################################生成导出类声明##########################################################
    tplHFile = open(r'./tpl/ExportClassCpp.h.tpl','r')
    strHTpl  = tplHFile.read()
    tplHFile.close()

    # 导出类列表
    classRefenceList = [] # lst = [{'name': className, 'prop': property, 'member': memberFunction}]
    # 直接使用类列表
    classUseLst = [] # lst = [{'name': className, 'prop': property, 'member': memberFunction}]

    # 随机选择导出类与使用类
    cppClassLen = len(cppClassInfo)
    for i in range(cppClassLen):
        clsinf = cppClassInfo[i]
        if random.randint(0, 1) > 0:
            classRefenceList.append(clsinf)
        else:
            classUseLst.append(clsinf)
    if len(classUseLst) == 0:
        classUseLst = cppClassInfo
    if len(classRefenceList) == 0:
        classRefenceList = cppClassInfo

    # 调用类的声明
    classContentExp = ''
    # 工厂类函数声明
    publicFuncContentExp = ''
    # 类实例声明
    instObjectContent = ''

    strFactoryFuncTpl = '\t${RETURN_CLASS}* ${FUNCTION_NAME}();\n'
    strFactoryFuncNameTpl = 'sh${RETURN_CLASS}Inst'
    strInstObjectNameTpl = '\t${RETURN_CLASS}* p${RETURN_CLASS};\n'
    for i in range(len(classRefenceList)):
        clsf = classRefenceList[i]
        facFuncName = ''.join( Template(strFactoryFuncNameTpl).substitute(RETURN_CLASS = clsf['name']) )
        publicFuncContentExp = publicFuncContentExp + ''.join(Template(strFactoryFuncTpl).substitute(RETURN_CLASS = clsf['name'], FUNCTION_NAME = facFuncName))
        instObjectContent = instObjectContent + ''.join(Template(strInstObjectNameTpl).substitute(RETURN_CLASS = clsf['name']))
    # 写入文件
    for i in range(len(cppClassInfo)):
        clsf = cppClassInfo[i]
        classContentExp = classContentExp + '#include "' + clsf['name'] + '.h"\n'
    for i in range(len(staticClassInfo)):
        clsf = staticClassInfo[i]
        classContentExp = classContentExp + '#include "' + clsf['name'] + '.h"\n'
    strExportHExp = ''.join(Template(strHTpl).substitute(CLASS_CONTENT = classContentExp, CLASS_NAME = className, PUBLIC_FUNC = publicFuncContentExp, INSTANCE_OBJECT_CONTENT = instObjectContent))
    hfile = open(path + className + '.h','w')
    hfile.write(strExportHExp)
    hfile.close()


# cppClassInfo = [{'name': className, 'prop': property, 'member': memberFunction}]
# staticClassInfo = [{'name': className, 'prop': property, 'member': memberFunction}]
########################################################生成导出类定义##########################################################
    tplCppFile = open(r'./tpl/ExportClassCpp.cpp.tpl','r')
    strCppTpl = tplCppFile.read()
    tplCppFile.close()

    # 包含头文件类
    classHeadFileContent = ''
    # strHeaderTpl = '#include "${HEADER_NAME}.h"\n'
    # for i in range(len(cppClassInfo)):
    #     clsinf = cppClassInfo[i]
    #     classHeadFileContent = classHeadFileContent + ''.join(Template(strHeaderTpl).substitute(HEADER_NAME = clsinf['name']))
    # for i in range(len(staticClassInfo)):
    #     clsinf = staticClassInfo[i]
    #     classHeadFileContent = classHeadFileContent + ''.join(Template(strHeaderTpl).substitute(HEADER_NAME = clsinf['name']))

    # 初始化内容
    memberInitContent = ''
    strObjectNameInitTpl = '\tp${RETURN_CLASS} = nullptr;\n\n'
    for i in range(len(classRefenceList)):
        clsinf = classRefenceList[i]
        memberInitContent = memberInitContent + ''.join(Template(strObjectNameInitTpl).substitute(RETURN_CLASS = clsinf['name']))

    # 反初始化内容
    memberDeleteContent = ''
    strObjectDeleteTpl = '\tif( p${RETURN_CLASS} ) {\n\t\tdelete p${RETURN_CLASS};\n\t\tp${RETURN_CLASS} = nullptr;\n\t}\n\n'
    for i in range(len(classRefenceList)):
        clsinf = classRefenceList[i]
        memberDeleteContent = memberDeleteContent + ''.join(Template(strObjectDeleteTpl).substitute(RETURN_CLASS = clsinf['name']))

    # 工厂类函数内容
    memberFunctionContent = ''
    funcContFile = open(r'./tpl/ExportFunctionDefine.tpl','r')
    strExportFuncTpl = funcContFile.read()
    funcContFile.close()
    for i in range(len(classRefenceList)):
        clsinf = classRefenceList[i]
        memberName = ''.join(Template('p${RETURN_CLASS}').substitute(RETURN_CLASS = clsinf['name']))
        initContent = genCallClassCode(clsinf, classRefenceList, classUseLst, staticClassInfo, '\t\t')
        funcExp = ''.join(Template(strExportFuncTpl).substitute(RETURN_CLASS = clsinf['name'], DEFINE_CLASS = className, MEMBER_NAME = memberName, INIT_CODE_CONTENT = initContent)) + '\n\n'
        memberFunctionContent = memberFunctionContent + funcExp


    strExportCppExp = ''.join(Template(strCppTpl).substitute(HEAD_FILE_NAME = className, CLASS_HEAD_FILE_CONTENT = classHeadFileContent, CLASS_NAME = className, MEMBER_INIT_CODE = memberInitContent, DELETE_MEMBER_CODE = memberDeleteContent, MEMBER_FUNC_DEFINE = memberFunctionContent))
    cppfile = open(path + className + '.cpp','w')
    cppfile.write(strExportCppExp)
    cppfile.close()

    return classInfo


# 生成自定义类，数据，调用类
def genClassAll(projectName, classNumber, datNumber, projectPath):
    g_ProjectPath = projectPath

    g_ToolsPath = g_ProjectPath + 'build/jsb-default/frameworks/cocos2d-x/tools/tojs/'
    g_CppClassPath = g_ProjectPath + 'build/jsb-default/frameworks/cocos2d-x/cocos/out/'
    os.makedirs(g_CppClassPath)

    print('rootPah:', g_ProjectPath)
    print('toolsPath:', g_ToolsPath)
    print('cppclassPath:', g_CppClassPath)

    cppClassInfo = genCppClassFile(projectName, classNumber, g_CppClassPath)
    datClassInfo = genStaticGlobalFile(projectName, 0, g_CppClassPath)
    exportClassInfo = genCallFunctionClass(projectName, cppClassInfo, datClassInfo, g_CppClassPath)

    newClassInfo = cppClassInfo + datClassInfo + exportClassInfo
    classInfoLen = len(newClassInfo)
    print('cpplent = %d, datLen = %d, sumLen = %d'% (len(cppClassInfo), len(datClassInfo), len(newClassInfo)))
    
    headertpl = '%(cocosdir)s/cocos/out/${CLASS_NAME}.h'
    jsbTplFile = open(r'./tpl/JsbOut.tpl','r')
    jsbtpl = jsbTplFile.read()
    jsbTplFile.close()
    strJsbHeader = ''
    strJsbClass  = ''
    for i in range(classInfoLen):
        clsinf = newClassInfo[i]
        strJsbHeader = strJsbHeader + ''.join(Template(headertpl).substitute(CLASS_NAME = clsinf['name']))
        if  i < classInfoLen - 1:
            strJsbHeader = strJsbHeader + ' '
        strJsbClass = strJsbClass + clsinf['name']
        if i < classInfoLen - 1:
            strJsbClass = strJsbClass + ' '
    
    strJsbConfig = ''.join(Template(jsbtpl).substitute(MODULE_NAME = projectName ,HEADER_CONTENT = strJsbHeader, BIND_CLASS_CONTENT = strJsbClass))

    configFile = open(g_ToolsPath + projectName + '.ini','w')
    configFile.write(strJsbConfig)
    configFile.close()

    cmdTpl = '\'${MODULE_NAME}.ini\': (\'${MODULE_NAME}\', \'jsb_${MODULE_NAME}\'),'
    jsbPythonFile = open(r'./tpl/JsbBindCode.tpl','r')
    pythonTpl = jsbPythonFile.read()
    jsbPythonFile.close()

    strCmd = ''.join(Template(cmdTpl).substitute(MODULE_NAME = projectName) )
    strPythonCode = ''.join(Template(pythonTpl).substitute(COMMAND_ARGS = strCmd))

    pythonFile = open(g_ToolsPath + 'JsbBind.py','w')
    pythonFile.write(strPythonCode)
    pythonFile.close()

    cmd = ''.join(Template('source ~/.bash_profile \n cd ${EXECUTE_PATH}\n python JsbBind.py').substitute(EXECUTE_PATH = g_ToolsPath))

    os.system(cmd)

    # add cpp class to xcode
    cocosxcodefile  = g_ProjectPath + 'build/jsb-default/frameworks/cocos2d-x/build/cocos2d_libs.xcodeproj'
    addcocosdir     = g_ProjectPath + 'build/jsb-default/frameworks/cocos2d-x/cocos/out/'
    grouppathname   = 'out'
    cmd = 'ruby AddRefXcode.rb ' + cocosxcodefile + ' ' + addcocosdir + ' ' + grouppathname
    print(cmd)
    os.system(cmd)

    # add jsb class to xcode
    grouppathname   = 'auto'
    cocosxcodefile  = g_ProjectPath + 'build/jsb-default/frameworks/cocos2d-x/cocos/scripting/js-bindings/proj.ios_mac/cocos2d_js_bindings.xcodeproj'
    if not os.path.exists(cocosxcodefile):
        cocosxcodefile = g_ProjectPath + 'build/jsb-default/frameworks/cocos2d-x/build/cocos2d_libs.xcodeproj'
        grouppathname = 'js-bindings/auto'
    addcocosdir     = g_ProjectPath + 'build/jsb-default/frameworks/cocos2d-x/cocos/scripting/js-bindings/auto/'
    
    cmd = 'ruby AddRefXcode.rb ' + cocosxcodefile + ' ' + addcocosdir + ' ' + grouppathname
    print(cmd)
    os.system(cmd)

    # include call jsb binging code
    cppFilePath = g_ProjectPath + 'build/jsb-default/frameworks/runtime-src/Classes/jsb_module_register.cpp'
    registerFile = open(cppFilePath, 'r')
    registerFileTpl = registerFile.read()
    registerFile.close()

    strInclude = ''.join(Template('#include "cocos/scripting/js-bindings/auto/jsb_${PROJECT_NAME}.hpp"').substitute(PROJECT_NAME = projectName))
    strCallCode = ''.join(Template('se->addRegisterCallback(register_all_${PROJECT_NAME});').substitute(PROJECT_NAME = projectName))

    strCpp = ''.join(Template(registerFileTpl).substitute(INCLUDE_FILES = strInclude, CALL_FILES = strCallCode))
    newStrCpp = strCpp.replace('//--', '')

    cppNewFile = open(cppFilePath, 'w')
    cppNewFile.write(newStrCpp)
    cppNewFile.close()

    
