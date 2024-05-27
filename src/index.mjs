// @license MIT
import core from "@actions/core";
import io from "@actions/io";
import * as os from "node:os";
import { sep, resolve, dirname } from "node:path";
import { writeFile } from "node:fs/promises";
import {exec} from "@actions/exec";

async function installAirfold(version) {
  version = version.match(/^\d+(\.\d+\.\d+)?/) ? `==${version}` : version;
  await exec(`pip install airfold-cli${version}`)
  return dirname(await io.which("af"));
}

async function installWrapper(path) {
  let source, target;

  const exeSuffix = os.platform().startsWith("win") ? ".exe" : "";

  try {
    source = [path, `af${exeSuffix}`].join(sep);
    target = [path, `af-orig${exeSuffix}`].join(sep);
    core.debug(`Moving ${source} to ${target}.`);
    await io.mv(source, target);
  } catch (e) {
    core.error(`Unable to move ${source} to ${target}.`);
    throw e;
  }

  try {
    source = resolve([__dirname, "wrapper.cjs"].join(sep));
    target = [path, "af"].join(sep);
    core.debug(`Copying ${source} to ${target}.`);
    await io.cp(source, target);
  } catch (e) {
    core.error(`Unable to copy ${source} to ${target}.`);
    throw e;
  }

  core.exportVariable("AIRFOLD_CLI_PATH", path);
}

async function installConfig(apiUrl, apiToken) {
  try {
    const res = await fetch(`${apiUrl}/v1/auth/identity`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });
    let body = "";
    if (!res.ok) {
      try {
        body = await res.text();
      } catch {
        // ignore
      }
      core.setFailed(`Failed to fetch from Airfold API: ${body}`);
    }
    body = await res.json();
    if (!body?.orgId || !body?.projectId) {
      core.setFailed(`Failed to find Airfold workspace: ${body}`);
    }
    const config = `endpoint: ${apiUrl}
key: ${apiToken}
org_id: ${body.orgId}
proj_id: ${body.projectId}
`;
    const configFile = `${process.cwd()}/.airfold/config.yaml`;
    const configDir = dirname(configFile);
    core.debug(`Creating config dir ${configDir}`);
    await io.mkdirP(configDir);

    core.debug(`Adding config to ${configFile}`);
    await writeFile(configFile, config);
  } catch (e) {
    console.log(e);
  }
}

async function setup() {
  const version = core.getInput("airfold-version");
  const apiUrl = core.getInput("api-url");
  const apiToken = core.getInput("api-token");
  const wrapper = core.getInput("use-wrapper") === "true";

  const path = await installAirfold(version);
  if (wrapper) {
    await installWrapper(path);
  }
  // core.addPath(path);
  await installConfig(apiUrl, apiToken);
}

(async () => {
  try {
    await setup();
  } catch (error) {
    core.setFailed(error.message);
  }
})();
