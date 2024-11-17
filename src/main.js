const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require("@actions/io");
const tc = require('@actions/tool-cache');
const os = require('os');
const crypto = require('crypto');
const path = require('path');

const TOOL_NAME = 'IDAPro';

function getPlatform() {
  switch (os.platform()) {
    case 'win32':
      return 'windows';
    case 'linux':
      return 'linux';
    default:
      throw new Error(`Unsupported platform: ${os.platform()}`);
  }
}

async function download() {
  const osPlatform = getPlatform();
  core.debug(`platform: ${osPlatform}`);
  const osArch = os.arch();
  core.debug(`arch: ${osArch}`);

  const downloadLink = core.getInput('download-link');
  core.debug(`download-link: ${downloadLink}`);
  const overlayLinks = core.getInput('overlay-links') || '';
  const overlayLinkList = overlayLinks.split('\n').filter(Boolean);
  core.debug(`overlay-links: ${overlayLinkList.join(' ')}`);
  const installCommand = core.getInput('install-command');
  core.debug(`install-command: ${installCommand}`);

  // compute a hash of the download link and overlay links
  const hash = crypto.createHash('md5');
  hash.update(downloadLink);
  hash.update(overlayLinks);
  const digest = hash.digest('hex');

  core.info(`Checking cache for ${TOOL_NAME} (${digest})`);
  const cachePath = tc.find(TOOL_NAME, digest);
  if (cachePath) {
    core.info(`Found in cache: ${cachePath}`);
    core.addPath(cachePath);
    return;
  } else {
    core.notice(`Not found in cache`);
  }

  core.info(`Downloading ${TOOL_NAME} from ${downloadLink}`);
  let downloadPath = await tc.downloadTool(downloadLink);
  core.debug(`downloadPath: ${downloadPath}`);

  const overlayPaths = await Promise.all(overlayLinkList.map(async (overlayLink) => {
    core.info(`Downloading overlay from ${overlayLink}`);
    const path = await tc.downloadTool(overlayLink);
    core.debug(`overlayPath: ${path}`);
    return path;
  }));

  // mark as executable on linux
  if (osPlatform === 'linux') {
    await exec.exec('chmod', ['+x', downloadPath]);
  } else if (osPlatform === 'windows') {
    const newDownloadPath = downloadPath + '.exe';
    await io.mv(downloadPath, newDownloadPath);
    downloadPath = newDownloadPath;
  }

  core.info(`Installing ${downloadPath}`);

  const runnerTemp = process.env.RUNNER_TEMP || os.tmpdir();
  const extractPath = path.join(runnerTemp, crypto.randomUUID());
  await io.mkdirP(extractPath);

  // run the installer
  const installerArgs = [
    '--mode', 'unattended',
    '--unattendedmodeui', 'none',
    '--prefix', extractPath
  ];
  if (osPlatform === 'windows') {
    installerArgs.push('--install_python');
  }
  await exec.exec(downloadPath, installerArgs);

  // apply overlays
  for (const overlayPath of overlayPaths) {
    core.info(`Applying overlay ${overlayPath}`);
    await tc.extractZip(overlayPath, extractPath);
  }

  if (installCommand) {
    core.info(`Running install command: ${installCommand}`);
    await exec.exec('bash', ['-c', installCommand], {cwd: extractPath});
  }

  core.info(`Caching ${TOOL_NAME} (${digest})`);
  const newCachePath = await tc.cacheDir(extractPath, TOOL_NAME, digest);
  core.debug(`newCachePath: ${newCachePath}`);

  core.addPath(newCachePath);
}

async function run() {
  try {
    await download();
    core.info('Successfully installed IDA Pro');
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = {run}