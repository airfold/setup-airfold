import io from "@actions/io";
import { platform } from "node:os";
import { sep } from "node:path";
import { exec } from "@actions/exec";
import core from "@actions/core";

class OutputListener {
  constructor (streamWriter) {
    this._buff = [];
    this._streamWriter = streamWriter;
  }

  get listener () {
    const listen = function listen (data) {
      this._buff.push(data);

      if (this._streamWriter) {
        this._streamWriter.write(data);
      }
    };
    return listen.bind(this);
  }

  get contents () {
    return this._buff
      .map(chunk => chunk.toString())
      .join("");
  }
}

function getAbsPath() {
  const exeSuffix = platform().startsWith("win") ? ".exe" : "";
  return [process.env.AIRFOLD_CLI_PATH, `af-orig${exeSuffix}`].join(sep);
}

async function main() {
  const path = getAbsPath();
  await io.which(path, true);
  const stdout = new OutputListener(process.stdout);
  const stderr = new OutputListener(process.stderr);
  const listeners = {
    stdout: stdout.listener,
    stderr: stderr.listener
  };
  const args = process.argv.slice(2);
  const options = {
    listeners,
    ignoreReturnCode: true,
    silent: true // avoid printing command in stdout: https://github.com/actions/toolkit/issues/649
  };
  const exitCode = await exec(path, args, options);
  core.setOutput("stdout", stdout.contents);
  core.setOutput("stderr", stderr.contents);
  core.setOutput("exitcode", exitCode.toString(10));
  if (exitCode !== 0) {
    core.setFailed(`Airfold CLI exited with code ${exitCode}.`);
  }
}

(async () => {
  await main();
})();
