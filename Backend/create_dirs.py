#!/usr/bin/env python3
import os
import sys

base_path = r"D:\SE-2 Project\Assets-Tracking-System-SE2\Backend\auth-service\src\main\java\com\assets\authservice"
dirs = ["model", "repository", "service", "controller", "config", "dto", "exception", "security", "util"]

for dir_name in dirs:
    dir_path = os.path.join(base_path, dir_name)
    os.makedirs(dir_path, exist_ok=True)
    print(f"Created: {dir_path}")

print("\n" + "="*60)
print("Verification - All created directories:")
print("="*60)
created_dirs = sorted([d for d in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, d))])
for d in created_dirs:
    print(f"  ✓ {d}")
