# vscode-linter-erlc README

A linter for erlang, using the erlc compiler.

## Features

Squiggly lines under errors.

Supports deps directories (essentially does -pa deps/**/ebin)

Supports substituting `${directory}` and `${workspaceRoot}` in paths with the current file's directory and the workspace's top level directory respectively

Supports glob patterns in non-deps paths (eg. `"erlang.linter-erlc.include":"**/include"`)

## Requirements

erlc on your path, or wherever you configure it to be.

## Extension Settings

This extension contributes the following settings:

* `erlang.linter-erlc.executablePath"`: The path to erlc. Just use erlc if you want to search path.
* `erlang.linter-erlc.run`: `onSave` lints when you save, `onType` lints as you write, `off` doesn't lint.
* `erlang.linter-erlc.include`: List of directories to include with -I
* `erlang.linter-erlc.pa`: List of module paths to search with -pa
* `erlang.linter-erlc.pz`: List of module paths to search with -pz
* `erlang.linter-erlc.deps`: List of paths to search for directories containing an ebin subdirectory, which will be added as pa paths

## Acknowledgements

Based on [hoovercj's ruby linter](https://github.com/hoovercj/vscode-ruby-linter), which in turn is based on Microsoft's own PHPValidationProvider.

Logo lifted from the [Erlang/OTP source](https://github.com/erlang/otp)

## Release Notes

### 0.1

Initial release of vscode-linter-erlc

