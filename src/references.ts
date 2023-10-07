import { ErrorDefinition } from "./types";

export function chromeHref(file: string, line: number): string {
    return `https://source.chromium.org/chromium/chromium/src/+/main:${file};l=${line}`;
}

export function chromeHrefNoscript(file: string, line: number): string {
    return `https://chromium.googlesource.com/chromium/src/+/HEAD/${file}#${line}`;
}

export function firefoxHref(file: string, line: number): string {
    return `https://searchfox.org/mozilla-central/source/${file}#${line}`;
}

export function firefoxHrefNoscript(file: string, line: number): string {
    return firefoxHref(file, line);
}

export function errorHref(error: ErrorDefinition) {
    if (error.browser === 'Chrome') {
        return chromeHref(error.file, error.line);
    }
    return firefoxHref(error.file, error.line);
}

export function errorHrefNoscript(error: ErrorDefinition) {
    if (error.browser === 'Chrome') {
        return chromeHrefNoscript(error.file, error.line);
    }
    return firefoxHrefNoscript(error.file, error.line);
}
