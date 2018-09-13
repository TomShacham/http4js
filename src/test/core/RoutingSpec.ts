import {deepEqual, deepStrictEqual, equal} from 'assert';
import {get, post, route, routes} from '../../main/core/Routing';
import {Req, ReqOf} from '../../main/core/Req';
import {HttpHandler} from '../../main/core/HttpMessage';
import {Headers, HeaderValues} from '../../main/core/Headers';
import {ResOf} from "../../main/core/Res";
import {MountedHttpHandler} from "../../main/core/Routing";
import {Readable} from "stream";
import {HttpServer} from "../../main/servers/NativeServer";

describe('routing', async () => {

    it('takes request and gives response', async () => {
        const response = await get('/test', async(req: Req) => ResOf(200, req.body))
            .serve(ReqOf('GET', '/test', 'Got it.'));

        equal(response.bodyString(), 'Got it.');
    });

    it('does not nest handlers', async () => {
        const routing = get('/test', async() => ResOf(200))
            .withHandler('GET', '/nest', async() => ResOf(200, 'fullPath'));
        const nested = await routing.serve(ReqOf('GET', '/test/nest'));
        const fullPath = await routing.serve(ReqOf('GET', '/nest'));

        equal(nested.status, 404);
        equal(fullPath.bodyString(), 'fullPath');
    });

    it('add a filter', async () => {
        const response = await get('/test', async () => {
            return ResOf(200);
        })
            .withFilter(() => {
                return async () => {
                    return ResOf(200, 'filtered');
                }
            })
            .serve(ReqOf('GET', '/test'));

        equal(response.bodyString(), 'filtered');
    });

    it('chains filters', async () => {
        const response = await get('/test', async() => ResOf(200))
            .withFilter(() => {
                return async() => ResOf(200, 'filtered');
            })
            .withFilter((handler: HttpHandler) => {
                return async(req: Req) => {
                    const response = await handler(req);
                    return response.withHeader('another', 'filter');
                }
            })
            .serve(ReqOf('GET', '/test'));

        equal(response.bodyString(), 'filtered');
        equal(response.header('another'), 'filter');

    });

    it('chains filters and handlers', async () => {
        const response = await get('/test', async() => ResOf(200))
            .withHandler('GET', '/nest', async() => ResOf(200, 'nested'))
            .withFilter((handler: HttpHandler) => {
                return (req: Req) => {
                    return handler(req).then(response => response.withHeader('a', 'filter1'));
                }
            })
            .withFilter((handler: HttpHandler) => {
                return (req: Req) => {
                    return handler(req).then(response => response.withHeader('another', 'filter2'));
                }
            })
            .serve(ReqOf('GET', '/nest'));

        equal(response.bodyString(), 'nested');
        equal(response.header('a'), 'filter1');
        equal(response.header('another'), 'filter2');
    });

    it('ordering - filters apply in order they are declared', async () => {
        const response = await get('/', async() => ResOf(200, 'hello, world!'))
            .withFilter((handler) => async(req) => {
                return handler(req).then(response => response.replaceHeader('person', 'tosh'));
            }).withFilter((handler) => async(req) => {
                return handler(req).then(response => response.replaceHeader('person', 'bosh'));
            })
            .serve(ReqOf('GET', '/'));

        equal(response.header('person'), 'bosh');
    });

    it('can add stuff to request using filters', async () => {
        const response = await get('/', async(req) => {
            return ResOf(200, req.header('pre-filter' || 'hello, world!'));
        }).withFilter((handler) => async(req) => {
            return handler(req.withHeader('pre-filter', 'hello from pre-filter'))
        })
            .serve(ReqOf('GET', '/'));

        equal(response.bodyString(), 'hello from pre-filter');
    });

    it('withRoutes mounts handlers but not filters except for top level filters which apply to all routes', async () => {
        const nestedTwice = get('/nested/twice', async () => {
            return ResOf(200).withBody('hi there nested twice.')
        }).withFilter((handler) => {
            return (req) => handler(req).then(response => response.withHeader('nested-twice', 'true'))
        });

        const nestedOnce = get('/nested/once', async () => {
            return ResOf(200).withBody('hi there nested once.')
        }).withFilter((handler) => {
            return (req) => handler(req).then(response => response.withHeader('nested-once', 'true'))
        })
        .withRoutes(nestedTwice);

        const anotherNestedOnce = get('/another/nested/once', async () => {
            return ResOf(200).withBody('hi there another nested once.')
        }).withFilter((handler) => {
            return (req) => handler(req).then(response => response.withHeader('another-nested-once', 'true'))
        });

        const composedRoutes = get('/', async() => ResOf(200, 'top level'))
            .withRoutes(nestedOnce)
            .withRoutes(anotherNestedOnce)
            .withFilter((handler) => {
                return (req) => handler(req).then(response => response.withHeader('top-level', 'true'))
            });

        const topLevelResponse = await composedRoutes.serve(ReqOf('GET', '/'));
        console.log('nested response ********************************')
        const nestedResponse = await composedRoutes.serve(ReqOf('GET', '/nested/once'));
        console.log('another nested response ********************************')
        const anotherNestedOnceResponse = await composedRoutes.serve(ReqOf('GET', '/another/nested/once'));
        console.log('nested twice response ********************************')
        const nestedTwiceResponse = await composedRoutes.serve(ReqOf('GET', '/nested/twice'));

        equal(topLevelResponse.header('top-level'), 'true');
        equal(topLevelResponse.header('nested-once'), undefined);
        equal(topLevelResponse.header('another-nested-once'), undefined);
        equal(topLevelResponse.header('nested-twice'), undefined);
        equal(topLevelResponse.bodyString(), 'top level');

        equal(nestedResponse.header('top-level'), 'true');
        equal(nestedResponse.header('nested-once'), 'true');
        equal(nestedResponse.header('another-nested-once'), undefined);
        equal(nestedResponse.header('nested-twice'), undefined);
        equal(nestedResponse.bodyString(), 'hi there nested once.');

        equal(anotherNestedOnceResponse.header('top-level'), 'true');
        // equal(anotherNestedOnceResponse.header('another-nested-once'), 'true');
        equal(anotherNestedOnceResponse.header('nested-once'), undefined);
        // equal(anotherNestedOnceResponse.bodyString(), 'hi there another nested once.');

        equal(nestedTwiceResponse.header('top-level'), 'true');
        equal(nestedTwiceResponse.header('nested-once'), 'true');
        equal(nestedTwiceResponse.header('nested-twice'), 'true');
        equal(nestedTwiceResponse.header('another-nested-once'), undefined);
        equal(nestedTwiceResponse.bodyString(), 'hi there nested twice.');
    });

    it('nested routes when not found, filters only through top level filters', async () => {
        const nested = get('/nested', async () => {
            return ResOf(200).withBody('hi there deeply.')
        }).withFilter((handler) => {
            return (req) => handler(req).then(response => response.withHeader('nested', 'routes'))
        });

        const response = await get('/', async () => ResOf(200))
            .withFilter((handler) => {
                return (req) => handler(req).then(response => response.withHeader('top-level', 'routes'))
            })
            .withRoutes(nested)
            .serve(ReqOf('GET', '/unknown-path'));

        equal(response.header('top-level'), 'routes');
        equal(response.header('nested'), undefined);
        equal(response.bodyString(), 'GET to /unknown-path did not match routes');
    });

    it('matches path params only if specified a capture in route', async () => {
        const response = await get('/family', async() => ResOf(200, 'losh,bosh,tosh'))
            .serve(ReqOf('GET', '/family/123'));

        equal(response.bodyString(), 'GET to /family/123 did not match routes');
    });

    it('unknown route returns a 404', async () => {
        const response = await get('/', async() => ResOf(200, 'hello, world!'))
            .serve(ReqOf('GET', '/unknown'));

        equal(response.status, 404);
    });

    it('custom 404s using filters', async () => {
        const response = await get('/', async() => ResOf(200, 'hello, world!'))
            .withFilter((handler: HttpHandler) => {
                return async (req: Req) => {
                    const response = await handler(req);
                    if (response.status == 404) {
                        return ResOf(404, 'Page not found');
                    } else {
                        return response;
                    }
                }
            })
            .serve(ReqOf('GET', '/unknown'));

        equal(response.status, 404);
        equal(response.bodyString(), 'Page not found');

    });

    it('exact match beats fuzzy match', async () => {
        const response = await get('/', async() => ResOf(200, 'root'))
            .withHandler('GET', '/family/{name}', async() => ResOf(200, 'fuzzy'))
            .withHandler('GET', '/family', async() => ResOf(200, 'exact'))
            .withHandler('POST', '/family', async() => ResOf(200, 'post'))
            .serve(ReqOf('GET', '/family'));

        equal(response.bodyString(), 'exact');
    });

    it('Post redirect.', async () => {
        const friends: any = [];
        const routes = get('/', async () => ResOf(200, 'root'))
            .withHandler('GET', '/family', async () => ResOf(200, friends.join(', ')))
            .withHandler('GET', '/family/{name}', async () => ResOf(200, 'fuzzy'))
            .withHandler('POST', '/family', async (req) => {
                friends.push(req.formField('name'));
                return ResOf(302).withHeader('Location', '/family');
            });

        const postSideEffect1 = routes.serve(ReqOf('POST', '/family', 'name=tosh'));
        const postSideEffect2 = routes.serve(ReqOf('POST', '/family', 'name=bosh'));
        const postSideEffect3 = routes.serve(ReqOf('POST', '/family', 'name=losh'));

        const response = await routes.serve(ReqOf('GET', '/family'));
        equal(response.bodyString(), 'tosh, bosh, losh');
    });

    it('extract form params', async () => {
        const request = ReqOf('POST', '/family', 'p1=1&p2=tom&p3=bosh&p4=losh')
            .withHeader('Content-Type', 'application/x-www-form-urlencoded');

        const response = await post('/family', async(req) => ResOf(200, JSON.stringify(req.bodyForm())))
            .serve(request);

        deepStrictEqual(response.bodyString(), JSON.stringify({p1: '1', p2: 'tom', p3: 'bosh', p4: 'losh'}));
    });

    it('matches method by regex', async () => {
        const response = await routes('.*', '/', async () => ResOf(200, 'matched'))
            .serve(ReqOf('GET', '/'));

        equal(response.bodyString(), 'matched');
    });

    it('matches path by regex', async () => {
        const response = await routes('.*', '.*', async () => ResOf(200, 'matched'))
            .serve(ReqOf('GET', '/any/path/matches'));

        equal(response.bodyString(), 'matched');
    });

    it('more precise routing beats less precise', async () => {
        const response = await get('/', async() => ResOf(200, 'root'))
            .withHandler('GET', '/family/{name}', async() => ResOf(200, 'least precise'))
            .withHandler('GET', '/family/{name}/then/more', async() => ResOf(200, 'most precise'))
            .withHandler('POST', '/family/{name}/less', async() => ResOf(200, 'medium precise'))
            .serve(ReqOf('GET', '/family/shacham/then/more'));

        equal(response.bodyString(), 'most precise');
    });

    it('withX convenience method', async () => {
        const response = await get('/', async() => ResOf())
            .withGet('/tom', async() => ResOf(200, 'Hiyur'))
            .serve(ReqOf('GET', '/tom'));

        equal(response.bodyString(), 'Hiyur');
    });

    it('add route using a Req obj', async() => {
        const request = ReqOf('GET', '/tom');
        const response = await route(ReqOf('GET', '/root'), async() => ResOf(200, 'Hiyur'))
            .withRoute(request, async() => ResOf(200, 'Hiyur withRoute'))
            .serve(request);

        equal(response.bodyString(), 'Hiyur withRoute');
    });

    it('can route by headers', async() => {
        const requestAcceptText = ReqOf('GET', '/tom').withHeader(Headers.ACCEPT, HeaderValues.APPLICATION_JSON);
        const requestAcceptJson = ReqOf('GET', '/tom').withHeader(Headers.ACCEPT, HeaderValues.TEXT_HTML);

        const response = await route(ReqOf('GET', '/'), async() => ResOf(200, 'Hiyur'))
            .withRoute(requestAcceptText, async() => ResOf(200, 'Hiyur text'))
            .withRoute(requestAcceptJson, async() => ResOf(200, 'Hiyur json'))
            .serve(requestAcceptText);

        equal(response.bodyString(), 'Hiyur text');
    });

    it('gives you your routing rules in a list', async() => {
        deepEqual(
            get('/', async() => ResOf())
                .withRoute(ReqOf('POST', '/tosh', '', {[Headers.CONTENT_TYPE]: HeaderValues.APPLICATION_JSON}),
                    async() => ResOf())
                .withPut('/putsch', async() => ResOf())
                .routes(),
            [
                {method: 'GET', path: '/', headers: {}, name: 'unnamed'},
                {method: 'POST', path: '/tosh', headers: {'Content-Type': 'application/json'}, name: 'unnamed'},
                {method: 'PUT', path: '/putsch', headers: {}, name: 'unnamed'},
            ]
        );
    });
    
    it('route matches with or without a trailing slash', async() => {
        const response = await get('/tosh', async() => ResOf(200, 'Cool beans.'))
            .serve(ReqOf('GET', '/tosh/'));
        equal(response.bodyString(), 'Cool beans.');
    });

    it('serves a request e2e if you have a server attached', async () => {
        const response = await get('/', async() => ResOf()).asServer(HttpServer(3004))
            .serveE2E(ReqOf('GET', '/'));
        equal(response.status, 200);
    });

    it('res body is a stream if req body is a stream', async () => {
        const readable = new Readable({read(){}});
        readable.push('some body');
        readable.push(null);
        const response = await post('/', async(req) => ResOf(200, req.bodyStream()!))
            .serve(ReqOf('POST', '/', readable));
        equal(response.bodyStream(), readable);
    });

    it('reverses routing: get handler by name', async() => {
        const handler = get('/path', async() => ResOf(200, 'OK path'), {'Cache-control': 'private'}, 'root')
            .handlerByName('root') as MountedHttpHandler;
        equal(handler.path, '/path');
        equal(handler.method, 'GET');
        deepEqual(handler.headers, {'Cache-control': 'private'});
        equal(handler.name, 'root');
    });

    it('reverses routing: get handler by path', async() => {
        const handler = get('/path', async() => ResOf(200, 'OK path'), {'Cache-control': 'private'})
            .handlerByPath('/path') as MountedHttpHandler;
        equal(handler.path, '/path');
        equal(handler.method, 'GET');
        deepEqual(handler.headers, {'Cache-control': 'private'});
    });

});
