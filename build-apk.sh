#!/bin/bash
export ANDROID_HOME=/home/runner/android-sdk
export ANDROID_SDK_ROOT=/home/runner/android-sdk
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
export GRADLE_OPTS="-Xmx1536m -XX:MaxMetaspaceSize=512m"

cd /home/runner/workspace/wifi-wps-repo

echo "Building WiFi WPS WPA Tester debug APK..."
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"
echo ""

./gradlew assembleOpenDebug --no-daemon

if [ $? -eq 0 ]; then
    APK_PATH="app/build/outputs/apk/open/debug/app-open-debug.apk"
    DEST="/home/runner/workspace/wifi-wps-wpa-tester-debug.apk"
    cp "$APK_PATH" "$DEST"
    echo ""
    echo "BUILD SUCCESSFUL"
    echo "APK location: $DEST"
    echo "APK size: $(ls -lh $DEST | awk '{print $5}')"
    echo ""
    echo "To download: Right-click the file 'wifi-wps-wpa-tester-debug.apk' in the file tree and select 'Download'"
else
    echo ""
    echo "BUILD FAILED - check the output above for errors"
fi
