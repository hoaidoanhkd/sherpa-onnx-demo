/**
 * Patches react-native-sherpa-onnx codegen.gradle to resolve react-native
 * from the root node_modules when it is not present in the library's own
 * node_modules (yarn/npm hoisting).
 */
const fs = require('fs')
const path = require('path')

const gradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-sherpa-onnx',
  'android',
  'codegen.gradle'
)

if (!fs.existsSync(gradlePath)) {
  process.exit(0)
}

let content = fs.readFileSync(gradlePath, 'utf8')

// Already patched
if (content.includes('rnRoot')) {
  process.exit(0)
}

// Replace the hardcoded react-native path resolution with a fallback
content = content.replace(
  'def codegenScript = file("${libraryRoot}/node_modules/react-native/scripts/generate-codegen-artifacts.js")',
  `// Resolve react-native: library-local first, then hoisted root node_modules
def rnLocal = file("\${libraryRoot}/node_modules/react-native")
def rnRoot  = file("\${rootProject.projectDir}/../node_modules/react-native")
def rnDir   = rnLocal.exists() ? rnLocal : rnRoot
def codegenScript = file("\${rnDir}/scripts/generate-codegen-artifacts.js")`
)

// Replace the check that throws the error
content = content.replace(
  '    if (!file("${libraryRoot}/node_modules/react-native").exists()) {\n      throw new RuntimeException(\n        "Codegen requires node_modules at library root. Run \'yarn install\' (or npm install) in ${libraryRoot}, then rebuild."\n      )\n    }',
  '    if (!rnDir.exists()) {\n      throw new RuntimeException(\n        "Codegen requires react-native. Could not find it at ${rnLocal} or ${rnRoot}."\n      )\n    }'
)

fs.writeFileSync(gradlePath, content, 'utf8')
