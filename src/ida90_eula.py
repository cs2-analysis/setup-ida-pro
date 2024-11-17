#!/usr/bin/env python3
import os
import idapro
import ida_registry

## Agree to EULA
ida_registry.reg_write_int('EULA 90', 1, '')