# -*- coding: utf-8 -*-
import hashlib
import sys
import os
import re


def encryption(srcStr):
    """
    MD5的方式加密字符串
    """

    return hashlib.md5(srcStr).hexdigest().upper()


if __name__ == '__main__':
    key = re.findall('.', sys.argv[1])
    rootDir = sys.argv[2]
    try:
        for parent, dirnames, filenames in os.walk(rootDir, False):
            for file in filenames:
                path = os.path.join(parent, file)
                if not os.path.exists(path):
                    continue
                newName = encryption(file)
                newPath = os.path.join(parent, newName)
                os.system('mv %s %s' % (path, newPath))
            for d in dirnames:
                path = os.path.join(parent, d)
                if not os.path.exists(path):
                    continue
                newName = encryption(d)
                newPath = os.path.join(parent, newName)
                os.system('mv %s %s' % (path, newPath))
    except Exception as identifier:
        print("发生异常：" + identifier)
