# -*- mode: python ; coding: utf-8 -*-

from PyInstaller.utils.hooks import collect_data_files


a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[('routes', 'routes')] + collect_data_files('whisper', include_py_files=False),
    hiddenimports=['routes.health', 'routes.chat', 'routes.audio', 'whisper_service', 'config', 'models', 'prompts'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['sympy', 'tensorboard', 'tensorflow', 'matplotlib'],
    noarchive=False,
    optimize=2,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='aivex-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=True,
    upx=True,
    upx_exclude=[],
    upx_dir=".",
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
