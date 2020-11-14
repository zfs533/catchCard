#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import os.path
import random
import string


def getRand():
    str1 = ''.join(random.sample(string.hexdigits, 16))
    str2 = ''.join(random.sample(string.hexdigits, 16))
    return str1 + str2


def JudgeSuffix(path, sl):
    suffix = os.path.splitext(path)[-1][1:]
    if suffix in sl:
        return False
    return True


if __name__ == '__main__':
    rootPath = sys.argv[1]
    password = sys.argv[3]
    sl = ['plist', 'mp3', 'jsc', 'resources', 'manifest', 'atlas']

    if not os.path.exists(rootPath):
        print("文件夹 %s 不存在请检查路径！" % rootPath)
        exit(-1)

    for parent, dirnames, filenames in os.walk(rootPath):
        for filename in filenames:
            if filename[0:1] != '.':
                path = parent + "/" + filename
                if not JudgeSuffix(path, sl):
                    continue
                comm = "./Encryption %s %s %s %s" % (
                    path, path, password, sys.argv[2])
                os.system(comm)
