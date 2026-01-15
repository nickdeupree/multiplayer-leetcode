#!/usr/bin/env python3
"""
Setup script to ensure the Python environment has the required dependencies
for running the Python code runner.
"""

import subprocess
import sys

def install_package(package_name):
    """Install a Python package using pip."""
    print(f"Installing {package_name}...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
        print(f"✓ {package_name} installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install {package_name}: {e}")
        return False

def check_package(package_name):
    """Check if a Python package is installed."""
    try:
        __import__(package_name.replace('-', '_'))
        return True
    except ImportError:
        return False

def main():
    """Main setup function."""
    print("=" * 60)
    print("Python Code Runner - Dependency Setup")
    print("=" * 60)
    
    required_packages = [
        "leetcode-py-sdk",
        "pytest"
    ]
    
    for package in required_packages:
        print(f"\nChecking {package}...")
        if check_package(package):
            print(f"✓ {package} is already installed")
        else:
            install_package(package)
    
    print("\n" + "=" * 60)
    print("Setup complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
