#!/usr/bin/env python3
import os
import idapro
import ida_registry

## Agree to EULA using this simple hack
ida_registry.reg_write_int(f'EULA 90 {os.environ.get("USER")}', 1, '')