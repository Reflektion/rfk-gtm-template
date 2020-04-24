const fs = require('fs-extra');
const path = require('path');
const { getSrcFilePath, buildTemplateParameters, buildCode } = require('../src/helpers');
const { main: mainPath } = require('../package.json');

const DIST_PATH = path.resolve(mainPath);

async function build() {
  const testsContent = await fs.readFile(getSrcFilePath('tests.txt'));
  const tosContent = await fs.readFile(getSrcFilePath('terms-of-service.txt'));
  const infoContent = await fs.readFile(getSrcFilePath('info.json'));
  const templateParametersContent = buildTemplateParameters();
  const webPermissionsContent = await fs.readFile(
    getSrcFilePath('web-permissions.json')
  );
  const sandboxedJsContent = buildCode(await fs.readFile(
    getSrcFilePath('template.js')
  ));

  const templateContent = [
    '___TERMS_OF_SERVICE___',
    String(tosContent).trim(),
    '___INFO___',
    String(infoContent).trim(),
    '___TEMPLATE_PARAMETERS___',
    String(templateParametersContent).trim(),
    '___WEB_PERMISSIONS___',
    String(webPermissionsContent).trim(),
    '___SANDBOXED_JS_FOR_WEB_TEMPLATE___',
    String(sandboxedJsContent).trim(),
    '___TESTS___',
    String(testsContent).trim(),
  ].join('\n\n');

  await fs.writeFile(DIST_PATH, templateContent);
}

build();
