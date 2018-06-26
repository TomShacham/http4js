import {deepEqual, deepStrictEqual, equal} from 'assert';
import {get, post, route, routes} from '../../main/core/Routing';
import {Req, ReqOf} from '../../main/core/Req';
import {HttpHandler} from '../../main/core/HttpMessage';
import {Headers, HeaderValues} from '../../main/core/Headers';
import {ResOf} from "../../main/core/Res";

describe('routing', async () => {

    it('takes request and gives response', async () => {
        const response = await get('/test', async(req: Req) => ResOf(200, req.body))
            .serve(ReqOf('GET', '/test', 'Got it.'));

        equal(response.bodyString(), 'Got it.');
    });

    it('nests handlers', async () => {
        const response = await get('/test', async() => ResOf(200))
            .withHandler('GET', '/nest', async() => ResOf(200, 'nested'))
            .serve(ReqOf('GET', '/test/nest'));

        equal(response.bodyString(), 'nested');
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
            .serve(ReqOf('GET', '/test/nest'));

        equal(response.bodyString(), 'nested');
        equal(response.header('a'), 'filter1');
        equal(response.header('another'), 'filter2');
    });

    it('withRoutes mounts handlers and filters', async () => {
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
            .serve(ReqOf('GET', '/nested'));

        equal(response.header('top-level'), 'routes');
        equal(response.header('nested'), 'routes');
        equal(response.bodyString(), 'hi there deeply.');
    });

    it('matches path params only if specified a capture in route', async () => {
        const response = await get('/family', async() => ResOf(200, 'losh,bosh,tosh'))
            .serve(ReqOf('GET', '/family/123'));

        equal(response.bodyString(), 'GET to /family/123 did not match routes');
    });

    it('extracts path param', async () => {
        const response = await get('/{name}/test', async(req) => ResOf(200, req.pathParams['name']))
            .serve(ReqOf('GET', '/tom-param/test'));

        equal(response.bodyString(), 'tom-param');
    });

    it('extracts multiple path params', async () => {
        const response = await get('/{name}/test/{age}/bob/{personality}/fred', async(req) => {
            return ResOf(200, `${req.pathParams['name']}, ${req.pathParams['age']}, ${req.pathParams['personality']}`)
        })
            .serve(ReqOf('GET', '/tom/test/26/bob/odd/fred'));

        const pathParams = response.bodyString().split(', ');
        equal(pathParams[0], 'tom');
        equal(pathParams[1], '26');
        equal(pathParams[2], 'odd');
    });

    it('extracts query params', async () => {
        const response = await get('/test', async(req) => {
            const queries = [
                req.query('tosh'),
                req.query('bosh'),
                req.query('losh'),
            ];
            return ResOf(200, queries.join('|'));
        })
            .serve(ReqOf('GET', '/test?tosh=rocks&bosh=pwns&losh=killer'));

        equal(response.bodyString(), 'rocks|pwns|killer');
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

    it('exact match beats fuzzy match', async () => {
        const response = await get('/', async() => ResOf(200, 'root'))
            .withHandler('GET', '/family/{name}', async() => ResOf(200, 'fuzzy'))
            .withHandler('GET', '/family', async() => ResOf(200, 'exact'))
            .withHandler('POST', '/family', async() => ResOf(200, 'post'))
            .serve(ReqOf('GET', '/family'));

        equal(response.bodyString(), 'exact');
    });

    it('Post redirect.', async () => {
        const friends = [];
        const routes = get('/', async () => ResOf(200, 'root'))
            .withHandler('GET', '/family', async () => ResOf(200, friends.join(', ')))
            .withHandler('GET', '/family/{name}', async () => ResOf(200, 'fuzzy'))
            .withHandler('POST', '/family', async (req) => {
                friends.push(req.form['name']);
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
        // console.log(request)
        const response = await post('/family', async(req) => ResOf(200, JSON.stringify(req.form)))
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
        const response = await route(ReqOf('GET', '/'), async() => ResOf(200, 'Hiyur'))
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
                {method: 'GET', path: '/', headers: {}},
                {method: 'POST', path: '/tosh', headers: {'Content-Type': 'application/json'}},
                {method: 'PUT', path: '/putsch', headers: {}},
            ]
        );
    });
    
    it('route matches with or without a trailing slash', async() => {
        const response = await get('/tosh', async() => ResOf(200, 'Cool beans.'))
            .serve(ReqOf('GET', '/tosh/'));
        equal(response.bodyString(), 'Cool beans.');
    })

});
