#!/bin/bash
# Patch Aliyun mirrors ahead of mavenCentral() in every Gradle repo block.
#
# Why: the sandbox IP gets rate-limited (HTTP 429) by repo.maven.apache.org
# during Gradle's parallel dependency storm. Aliyun's public mirror proxies
# Maven Central with the same paths; putting it FIRST means central is only
# touched for artifacts the mirror lacks (rare). Run AFTER `expo prebuild`.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ALIYUN_PUBLIC="https://maven.aliyun.com/repository/public"
ALIYUN_PLUGIN="https://maven.aliyun.com/repository/gradle-plugin"

patch_groovy() {
  local file="$1"
  [ -f "$file" ] || return 0
  if ! grep -q "aliyun mirror" "$file"; then
    python3 - "$file" "$ALIYUN_PUBLIC" "$ALIYUN_PLUGIN" << 'PYEOF'
import sys, re
path, public, plugin = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(path).read()
snippet = "    maven { url '%s' } // aliyun mirror (sandbox 429 workaround)\n    maven { url '%s' } // aliyun plugin mirror\n    google() // androidx/AGP live here — must precede central\n" % (public, plugin)
s = re.sub(r"^(\s*)mavenCentral\(\)", lambda m: m.group(1) + snippet + m.group(1) + "mavenCentral()", s, flags=re.M)
open(path, "w").write(s)
PYEOF
    echo "patched $file"
  fi
}

patch_kts() {
  local file="$1"
  [ -f "$file" ] || return 0
  if ! grep -q "aliyun mirror" "$file"; then
    python3 - "$file" "$ALIYUN_PUBLIC" "$ALIYUN_PLUGIN" << 'PYEOF'
import sys, re
path, public, plugin = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(path).read()
snippet = '%smaven { url = uri("%s") } // aliyun mirror (sandbox 429 workaround)\n%smaven { url = uri("%s") } // aliyun plugin mirror\n%sgoogle() // androidx/AGP live here — must precede central\n'
s = re.sub(
    r"^(\s*)mavenCentral\(\)",
    lambda m: (snippet % (m.group(1), public, m.group(1), plugin, m.group(1))) + m.group(1) + "mavenCentral()",
    s,
    flags=re.M,
)
open(path, "w").write(s)
PYEOF
    echo "patched $file"
  fi
}

# 1. app-level gradle files (groovy)
for f in "$APP_DIR/android/build.gradle" "$APP_DIR/android/app/build.gradle"; do
  patch_groovy "$f"
done

# app settings.gradle: merge mirror repositories into the existing pluginManagement block
SETTINGS="$APP_DIR/android/settings.gradle"
if [ -f "$SETTINGS" ] && ! grep -q "aliyun mirror" "$SETTINGS"; then
  python3 - "$SETTINGS" "$ALIYUN_PUBLIC" "$ALIYUN_PLUGIN" << 'PYEOF2'
import sys
path, public, plugin = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(path).read()
repos = "  repositories {\n    maven { url \"%s\" } // aliyun mirror (sandbox 429 workaround)\n    maven { url \"%s\" } // aliyun plugin mirror\n    mavenCentral()\n    google()\n    gradlePluginPortal()\n  }\n" % (public, plugin)
if "pluginManagement {" in s and "aliyun mirror" not in s:
    s = s.replace("pluginManagement {", "pluginManagement {\n" + repos, 1)
elif "pluginManagement {" not in s:
    s = "pluginManagement {\n" + repos + "}\n\n" + s
open(path, "w").write(s)
PYEOF2
  echo "patched $SETTINGS (mirrors merged into pluginManagement)"
fi

# 2. included builds (RN gradle plugin + expo gradle plugin) — sweep EVERY .gradle.kts
python3 - "$APP_DIR" << 'PYEOF3'
import pathlib, re, sys
app = pathlib.Path(sys.argv[1])
PUBLIC = "https://maven.aliyun.com/repository/public"
PLUGIN = "https://maven.aliyun.com/repository/gradle-plugin"
snippet = '%smaven { url = uri("%s") } // aliyun mirror (sandbox 429 workaround)\n%smaven { url = uri("%s") } // aliyun plugin mirror\n'
patched = 0
for tree in [app / "node_modules/@react-native/gradle-plugin",
             app / "node_modules/expo-modules-autolinking/android/expo-gradle-plugin"]:
    if not tree.is_dir(): continue
    for f in tree.rglob("*.gradle.kts"):
        s = f.read_text()
        if "aliyun mirror" in s: continue
        s2 = re.sub(r"^(\s*)mavenCentral\(\)",
                    lambda m: (snippet % (m.group(1), PUBLIC, m.group(1), PLUGIN)) + m.group(1) + "mavenCentral()",
                    s, flags=re.M)
        if s2 != s:
            f.write_text(s2); patched += 1
print(f"swept {patched} included-build gradle files")
PYEOF3

# 3. expo-module-gradle-plugin (included build with NO settings file) — give it mirror-first plugin resolution
EMGP="$APP_DIR/node_modules/expo-modules-core/expo-module-gradle-plugin/settings.gradle.kts"
if [ -d "$(dirname "$EMGP")" ] && [ ! -f "$EMGP" ]; then
  cat > "$EMGP" << 'EMGPEOF'
// sandbox-only: mirror-first plugin resolution (Maven Central 429 workaround)
pluginManagement {
  repositories {
    maven { url = uri("https://maven.aliyun.com/repository/public") }
    maven { url = uri("https://maven.aliyun.com/repository/gradle-plugin") }
    gradlePluginPortal()
    mavenCentral()
    google()
  }
}
EMGPEOF
  echo "created $EMGP"
fi
patch_kts "$APP_DIR/node_modules/expo-modules-core/expo-module-gradle-plugin/build.gradle.kts"

# 4. autolinked libraries (node_modules/*/android) — patch their buildscript repositories too
python3 - "$APP_DIR" << 'PYEOF4'
import pathlib, re, sys
app = pathlib.Path(sys.argv[1])
PUBLIC = "https://maven.aliyun.com/repository/public"
PLUGIN = "https://maven.aliyun.com/repository/gradle-plugin"
total = 0
for pattern in ["node_modules/*/android", "node_modules/@*/*/android"]:
    for d in app.glob(pattern):
        for name, kts in [("build.gradle", False), ("build.gradle.kts", True)]:
            f = d / name
            if not f.is_file(): continue
            s = f.read_text()
            if "aliyun mirror" in s: continue
            snip = ('%smaven { url = uri("%s") } // aliyun mirror (sandbox 429 workaround)\n%smaven { url = uri("%s") } // aliyun plugin mirror\n%sgoogle() // androidx/AGP live here — must precede central\n') if kts else ('%smaven { url "%s" } // aliyun mirror (sandbox 429 workaround)\n%smaven { url "%s" } // aliyun plugin mirror\n%sgoogle() // androidx/AGP live here — must precede central\n')
            s2 = re.sub(r"^(\s*)mavenCentral\(\)",
                        lambda m: (snip % (m.group(1), PUBLIC, m.group(1), PLUGIN, m.group(1))) + m.group(1) + "mavenCentral()",
                        s, flags=re.M)
            if s2 != s:
                f.write_text(s2); total += 1
print(f"autolinked sweep: {total} patched")
PYEOF4

echo "mirror patch complete"


# ----------------------------------------------------------------------------
# 5. Build-hardening (apply after every `expo prebuild` — android/ is
#    gitignored and regenerated, so all of this must be script-applied):
#    a) one-liner `repositories { mavenCentral() }` in the RN gradle-plugin
#       included builds (missed by the multi-line sweep above)
#    b) gradle.properties: 2 physical ABIs (skip x86/x86_64 emulator ABIs —
#       halves CMake time and APK size) + low-RAM build profile
#    c) app/build.gradle: release signing from android/app/keystore.properties
#       (gitignored; falls back to debug signing when absent) + ndk abiFilters
python3 - "$APP_DIR" << 'PYEOF5'
import pathlib, re, sys
app = pathlib.Path(sys.argv[1])
PUBLIC = "https://maven.aliyun.com/repository/public"
PLUGIN = "https://maven.aliyun.com/repository/gradle-plugin"

# (a) one-liner repo blocks in included builds
for f in ["node_modules/@react-native/gradle-plugin/shared/build.gradle.kts",
          "node_modules/@react-native/gradle-plugin/shared-testutil/build.gradle.kts"]:
    p = app / f
    if not p.exists():
        continue
    s = p.read_text()
    old = "repositories { mavenCentral() }"
    new = ("repositories {\n"
           "  maven { url = uri(\"%s\") } // aliyun mirror (sandbox 429 workaround)\n"
           "  maven { url = uri(\"%s\") } // aliyun plugin mirror\n"
           "  google()\n"
           "  mavenCentral()\n"
           "}") % (PUBLIC, PLUGIN)
    if old in s and "aliyun mirror" not in s:
        p.write_text(s.replace(old, new))
        print("one-liner patched:", f)

# (b) gradle.properties
gp = app / "android/gradle.properties"
if gp.exists():
    s = gp.read_text()
    s = re.sub(r"^reactNativeArchitectures=.*$",
               "reactNativeArchitectures=armeabi-v7a,arm64-v8a", s, flags=re.M)
    if "sandbox: low-RAM build profile" not in s:
        s = s.replace(
            "org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m",
            "org.gradle.jvmargs=-Xmx1024m -XX:MaxMetaspaceSize=384m\n"
            "kotlin.compiler.execution.strategy=in-process\n\n"
            "# sandbox: low-RAM build profile (3.9GB, no swap)\n"
            "org.gradle.workers.max=1\n"
            "org.gradle.parallel=false",
        )
    else:
        s = re.sub(r"^reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64$",
                   "reactNativeArchitectures=armeabi-v7a,arm64-v8a", s, flags=re.M)
    gp.write_text(s)
    print("gradle.properties tuned")

# (c) app/build.gradle — release signing + abiFilters
bg = app / "android/app/build.gradle"
if bg.exists():
    s = bg.read_text()
    if "keystoreProps" not in s:
        old = """    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }"""
        new = """    def keystoreProps = new Properties()
    def keystorePropsFile = rootProject.file("app/keystore.properties")
    if (keystorePropsFile.exists()) {
        keystorePropsFile.withInputStream { keystoreProps.load(it) }
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (keystorePropsFile.exists()) {
                storeFile file(keystoreProps['storeFile'])
                storePassword keystoreProps['storePassword']
                keyAlias keystoreProps['keyAlias']
                keyPassword keystoreProps['keyPassword']
            }
        }
    }"""
        assert old in s, "signingConfigs block not found"
        s = s.replace(old, new)
        old2 = """        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug"""
        new2 = """        release {
            signingConfig keystorePropsFile.exists() ? signingConfigs.release : signingConfigs.debug"""
        assert old2 in s, "release block not found"
        s = s.replace(old2, new2)
        print("release signing wired")
    if "abiFilters" not in s:
        anchor = '        versionName "'
        m = re.search(r'        versionName "[^"]+"', s)
        if m:
            s = s.replace(m.group(0), m.group(0) + """

        ndk {
            // physical-device APKs only — x86/x86_64 (emulator) excluded to halve build time + size
            abiFilters "arm64-v8a", "armeabi-v7a"
        }""", 1)
            print("abiFilters added")
    bg.write_text(s)
print("build-hardening complete")
PYEOF5
