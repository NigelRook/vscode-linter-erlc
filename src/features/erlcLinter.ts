'use strict';
import * as path from 'path';
import * as fs from 'fs';

import { workspace, Disposable, Diagnostic, DiagnosticSeverity, Range, TextDocument } from 'vscode';

import { LintingProvider, LinterConfiguration, Linter } from './utils/lintingProvider';

export default class ErlcLintingProvider implements Linter {
    public languageId = 'erlang';
    private deps:string[];
    private include:string[];
    private pa:string[];
    private pz:string[];

    public activate(subscriptions: Disposable[]) {
        let provider = new LintingProvider(this);
        provider.activate(subscriptions)
    }

    public loadConfiguration():LinterConfiguration {
        let section = workspace.getConfiguration(this.languageId);
        if (!section) return;

        this.deps = section.get<string[]>('linter-erlc.deps', []);
        this.include = section.get<string[]>('linter-erlc.include', []);
        this.pa = section.get<string[]>('linter-erlc.pa', []);
        this.pz = section.get<string[]>('linter-erlc.pz', []);

        return {
            executable: section.get<string>('linter-erlc.executablePath', 'erlc'),
            extraArgs: ['-W', '-o', process.platform == 'win32' ? 'nul' : '/dev/null'],
            runTrigger: section.get<string>('linter-erlc.run', 'onType')
        }
    }

    public getTargetArgs(textDocument: TextDocument): string[] {
        let fileDir = path.dirname(textDocument.fileName);
        let projectDir = workspace.rootPath;

        let depsDirs = this.substituteDirs(this.deps, fileDir, projectDir);
        let include = this.substituteDirs(this.include, fileDir, projectDir);
        let pa = this.substituteDirs(this.pa, fileDir, projectDir);
        let pz = this.substituteDirs(this.pz, fileDir, projectDir);

        let deps = depsDirs.map(this.getDeps)
                           .reduce((acc, dep) => acc.concat(dep), []);

        return [].concat(this.makeParams('-I', include),
                         this.makeParams('-pa', pa),
                         this.makeParams('-pz', pz),
                         this.makeParams('-pa', deps));
    }

    private substituteDirs(paths:string[], fileDir:string, projectDir:string): string[] {
        const fileDirSubRegex = /\$\{directory\}/;
        const projectDirSubRegex = /\$\{workspaceRoot\}/;
        if (fileDir) {
            paths = paths.map((path) => path.replace(fileDirSubRegex, fileDir));
        }
        if (projectDir) {
            paths = paths.map((path) => path.replace(projectDirSubRegex, projectDir));
        }
        return paths;
    }

    private getDeps(depsDir:string):string[] {
        if (!fs.existsSync(depsDir)) {
            return [];
        }
        let stat = fs.statSync(depsDir);
        if (!stat || !stat.isDirectory()) {
            return [];
        }
        let subDirs = fs.readdirSync(depsDir);
        return subDirs.filter((dir) => {
            dir = path.join(depsDir, dir);
            let stat = fs.statSync(dir);
            if (!stat || !stat.isDirectory()) {
                return false;
            }
            let ebin = path.join(dir, 'ebin');
            if (!fs.existsSync(ebin)) {
                return false;
            }
            stat = fs.statSync(ebin);
            if (!stat || !stat.isDirectory()) {
                return false;
            }
            return true;
        }).map((dir) => path.join(depsDir, dir, 'ebin'));
    }

    private makeParams(type:string, params:string[]): string[] {
        return params.map((param) => [type, param])
                     .reduce((acc, params) => acc.concat(params), []);
    }

    public process(lines: string[]): Diagnostic[] {
        let diagnostics: Diagnostic[] = [];
        lines.forEach(function (line) {
            const regex = /.+:(\d+):\s*(.+:)?\s(.+)/;
            const matches = regex.exec(line);
            if (matches === null) {
              return;
            }
            diagnostics.push({
                range: new Range(parseInt(matches[1]) - 1, 0, parseInt(matches[1]) - 1, Number.MAX_VALUE),
                severity: !matches[2] || matches[2].toLowerCase().includes("error") ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
                message: matches[3],
                code: null,
                source: ''
            });
        });
        return diagnostics;
    }
}
