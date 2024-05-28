# setup-airfold

The `airfold/setup-airfold` action is a JavaScript action that sets up Airfold CLI in your GitHub Actions workflow by:

- Downloading a specific version of Airfold CLI and adding it to the `PATH`.
- Configuring the [Airfold CLI](https://docs.airfold.co/quickstart_cli#set-up-the-cli) with a provided API key.
- Installing a wrapper script to wrap subsequent calls of the `af` binary and expose its STDOUT, STDERR, and exit code as outputs named `stdout`, `stderr`, and `exitcode` respectively.

After you've used the action, subsequent steps in the same job can run arbitrary Airfold CLI commands using [the GitHub Actions `run` syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsrun).
This allows these commands to work exactly like they do on your local command line.


## Usage

This action can be run on `ubuntu-latest` and `macos-latest` GitHub Actions runners.
When running on self-hosted GitHub Actions runners, NodeJS must be previously installed with the version specified in the [`action.yml`](https://github.com/airfold/setup-airfold/blob/main/action.yml).

The default configuration installs the latest version of Airfold CLI and installs the wrapper script to wrap subsequent calls to the `af` binary:

```yaml
steps:
- uses: airfold/setup-airfold@v1
  with:
    api-token: aft_6eab8fcd902e4cbfb63ba174469989cd.Ds1PME5dQsJKosKQWVcZiBSlRFBbmhzIocvHg8KQddV
```
To get the token see the Airfold docs: [here](https://docs.airfold.co/quickstart_cli#set-up-the-cli).


A specific version of Airfold CLI can be installed:

```yaml
steps:
- uses: airfold/setup-airfold@v1
  with:
    api-token: aft_6eab8fcd902e4cbfb63ba174469989cd.Ds1PME5dQsJKosKQWVcZiBSlRFBbmhzIocvHg8KQddV
    airfold-version: "0.9.2"
```

The wrapper script installation can be skipped by setting the `use-wrapper` variable to `false`:

```yaml
steps:
- uses: airfold/setup-airfold@v1
  with:
    api-token: aft_6eab8fcd902e4cbfb63ba174469989cd.Ds1PME5dQsJKosKQWVcZiBSlRFBbmhzIocvHg8KQddV
    use-wrapper: false
```

Subsequent steps can access outputs when the wrapper script is installed:

```yaml
steps:
- uses: airfold/setup-airfold@v1
  with:
    api-token: aft_6eab8fcd902e4cbfb63ba174469989cd.Ds1PME5dQsJKosKQWVcZiBSlRFBbmhzIocvHg8KQddV

- id: plan
  run: af push --dry-run

- run: echo ${{ steps.plan.outputs.stdout }}
- run: echo ${{ steps.plan.outputs.stderr }}
- run: echo ${{ steps.plan.outputs.exitcode }}
```

Outputs can be used in subsequent steps to comment on the pull request:

> **Notice:** There's a limit to the number of characters inside a GitHub comment (65535).
>
> Due to that limitation, you might end up with a failed workflow run even if the plan succeeded.
>
> Another approach is to append your plan into the $GITHUB_STEP_SUMMARY environment variable which supports markdown.

```yaml
permissions:
  pull-requests: write
steps:
- uses: actions/checkout@v4
- uses: airfold/setup-airfold@v1
  with:
    api-token: aft_6eab8fcd902e4cbfb63ba174469989cd.Ds1PME5dQsJKosKQWVcZiBSlRFBbmhzIocvHg8KQddV

- name: Plan
  id: plan
  run: af push ./airfold --dry-run
  continue-on-error: true

- uses: actions/github-script@v7
  if: github.event_name == 'pull_request'
  env:
    PLAN: "airfold\n${{ steps.plan.outputs.stdout }}"
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    script: |
      const output = `#### Airfold Plan \`${{ steps.plan.outcome }}\`

      <details><summary>Show Plan</summary>

      \`\`\`\n
      ${process.env.PLAN}
      \`\`\`

      </details>

      *Pusher: @${{ github.actor }}, Action: \`${{ github.event_name }}\`, Working Directory: \`${{ env.tf_actions_working_dir }}\`, Workflow: \`${{ github.workflow }}\`*`;

      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: output
      })
```

## Inputs

The action supports the following inputs:

- `api-token` - (required) The Airfold API key for the workspace you want to manage/push to.
- `api-url` - (optional) The Airfold API endpoint. Defaults to `https://api.airfold.io`.
- `airfold-version` - (optional) The version of Airfold CLI to install. Instead of a full version string,
  you can also specify a constraint string (see [Semver Ranges](https://www.npmjs.com/package/semver#ranges)
  for available range specifications). Examples are: `"<1.2.0"`, `"~1.1.0"`, `"1.1.7"` (all three installing
  the latest available `1.1` version). Prerelease versions can be specified and a range will stay within the
  given tag such as `beta` or `rc`. If no version is given, it will default to `latest`.
- `use-wrapper` - (optional) Whether to install a wrapper to wrap subsequent calls of
  the `af` binary and expose its STDOUT, STDERR, and exit code as outputs
  named `stdout`, `stderr`, and `exitcode` respectively. Defaults to `true`.

## Outputs

This action does not configure any outputs directly. However, when you set the `use-wrapper` input
to `true`, the following outputs are available for subsequent steps that call the `af` binary:

- `stdout` - The STDOUT stream of the call to the `af` binary.
- `stderr` - The STDERR stream of the call to the `af` binary.
- `exitcode` - The exit code of the call to the `af` binary.

## License

[MIT](LICENSE)
