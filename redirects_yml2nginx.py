#!/usr/bin/env python

import yaml

f = open('redirects.yml', 'r')
data = f.read()
f.close()

redirs = yaml.load(data)

for k in redirs.keys():
    # If a key has no value, redirect to /
    if redirs[k] == None:
        redirs[k] = '/'
    # Add leading / to values
    if redirs[k][0] != '/' and not redirs[k].startswith('http://') \
                           and not redirs[k].startswith('https://'):
        redirs[k] = '/' + redirs[k]

for k in redirs:
    print 'rewrite %s\t%s\tpermanent;' % (k, redirs[k])
