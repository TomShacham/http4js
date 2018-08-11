import * as crypto from 'crypto';

export interface ZipkinSpan {
    parentId: number | undefined,
    spanId: number,
    traceId: number,
    start: number,
    end: number,
    timeTaken: number,
    children: ZipkinSpan[],
}

export enum ZipkinHeaders {
    PARENT_ID = "x-b3-parentspanid",
    SPAN_ID = 'x-b3-spanid',
    TRACE_ID = 'x-b3-traceid',
    SAMPLED = 'x-b3-sampled',
    DEBUG = 'x-b3-debug',
}

export interface IdGenerator {
    newId(size: number): string
}

export class ZipkinIdGenerator implements IdGenerator {
    newId(size: number): string {
        return crypto.randomBytes(size).toString('hex');
    }
}

export function ZipkinCollector(logLines: string[], extractor: (logLine: string) => ZipkinSpan): ZipkinSpan {
    const zipkinSpans = logLines.reduce((spans: ZipkinSpan[], line: string) => {
        const zipkinSpan = extractor(line);
        spans.push(zipkinSpan);
        return spans;
    }, []);
    const topLevelRequest = zipkinSpans.find(it => !it.parentId);
    return treeStructure(topLevelRequest!, zipkinSpans);

    function treeStructure(root: ZipkinSpan, spans: ZipkinSpan[]): ZipkinSpan {
        const children = spans.filter(it => it.parentId === root.spanId);
        root.children = children.map(child => treeStructure(child, spans));
        return root;
    }
}