#!/usr/bin/env/python3

import os
import webbrowser

url = f'file://{os.path.abspath(".")}/index.html'

ok = webbrowser.open(url)
if ok:
    raise SystemExit(0)
else:
    raise SystemExit(1)

