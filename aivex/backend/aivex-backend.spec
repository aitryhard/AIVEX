# -*- mode: python ; coding: utf-8 -*-

from PyInstaller.utils.hooks import collect_data_files


a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[('ffmpeg/ffmpeg.exe', 'ffmpeg')],
    datas=[('routes', 'routes')] + collect_data_files('whisper', include_py_files=False),
    hiddenimports=['routes.health', 'routes.chat', 'routes.audio', 'whisper_service', 'config', 'models', 'prompts'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['sympy', 'numba', 'matplotlib', 'tensorboard', 'tensorflow', 'scipy', 'pandas', 'PIL', 'cv2', 'sklearn'],
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
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
