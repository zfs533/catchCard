#!/usr/bin/env python
# encoding: utf-8
import random
import string
import WordNameLib


CharList = 'abcdefghijklmnopqrstuvwxyz'


# 随机打乱字符串
def shufflestr(strVal):
    strlst = list(strVal)
    random.shuffle(strlst)
    return ''.join(strlst)

# 随机生成单词
def genNameInLib():
    # index = random.randint(0, len(WordNameLib.word) - 1)
    # print(index, len(WordNameLib.word) - 1)
    return ''.join(WordNameLib.word[random.randint(0, len(WordNameLib.word) - 1)])

# 随机字符串
def genNameInRand():
    return ''.join(random.sample(CharList, random.randint(3, 5)))

# 首字母大写
def upperFirstChar(name):
    return ''.join(name[0].upper() + name[1:])

# 随机生成驼峰名字
def randTFNameWithNumber():
    tfname = genNameInLib()
    for _ in range(random.randint(1, 2)):
        tfname = tfname + upperFirstChar(genNameInLib())
    if random.randint(0, 3) > 0:
        tfname = tfname + upperFirstChar(genNameInRand())
    if random.randint(0, 2) == 0:
        tfname = tfname + ''.join(str(random.randint(0, 100)))
    return ''.join(tfname)

# 随机生成驼峰名字不带数字
def randTFName():
    tfname = genNameInLib()
    for _ in range(random.randint(1, 2)):
        tfname = tfname + upperFirstChar(genNameInLib())
    if random.randint(0, 3) > 0:
        tfname = tfname + upperFirstChar(genNameInRand())
    return ''.join(tfname)

# 随机生成C风格名字
def randCStyleName():
    csname = genNameInLib() + '_'
    for _ in range(random.randint(1, 2)):
        csname = csname + genNameInLib()
        csname = csname + '_'
    csname = csname + genNameInRand()
    return ''.join(csname)

# 随机生成类名
def randClassNameByModuleName(moduleName):
    clsName = ''
    way = random.randint(0, 4)
    if way == 0: #普通生成
        clsName = clsName + ''.join(moduleName)
        clsName = clsName + upperFirstChar(randTFName())     
    elif way == 1:#随机选取片段生成
        upModName = moduleName.upper()
        clsName = clsName + ''.join(upModName[:random.randint(1, len(upModName))])
        clsName = clsName + randTFName()
    elif way == 2:#随机打乱生成
        upModName = shufflestr(moduleName).upper()
        clsName = clsName + ''.join(upModName[:random.randint(1, len(upModName))])
        clsName = clsName + randTFName()
    elif way == 3:
        clsName = moduleName.upper() + '__' + randTFName()
    else:
        for _ in range(random.randint(2, 4)):
            clsName = clsName + upperFirstChar(genNameInLib())
        if random.randint(0, 3) > 0:
            clsName = clsName + upperFirstChar(genNameInRand())
    return clsName

# 随机生成成员函数名
def randMemberFuncName(className):
    if random.randint(0, 2) > 0:
        return randTFName()
    if len(className) > 3:
        return className[:3].upper() + randTFName()
    return className.upper() + '_' + randTFName()

# 随机生属性名
def randMemberPropertyName(classType):
    return '_' + randTFNameWithNumber()

# 随机生成C风格名
def randCName(className):
    if random.randint(0, 2) > 0:
        return randCStyleName()
    if len(className) > 3:
        return className[:3].lower() + '_' + randCStyleName()
    return className.lower() + '__' + randCStyleName()
