const fs = require('fs');
const path = require('path');
// const storage = require('@google-cloud/storage');

export class ApiExamples {
    constructor(serviceName) {
        this.bucketName = 'api-examples';
        this.pathToExampleDir = '__apiExamples';
        this.apiExamples = null;
        this.serviceName = serviceName;
    }

    private readApiExamples() {
        const pathToServiceExamples = `${this.pathToExampleDir}/${this.serviceName}`;
        return fs.readdirSync(pathToServiceExamples)
            .filter(file => fs.statSync(`${pathToServiceExamples}/${file}`).isFile())
            .map(file => JSON.parse(fs.readFileSync(`${pathToServiceExamples}/${file}`, 'utf8')));
    }

    private static generate(req, res) {
        return {
            request: {
                method: req.method,
                path: req.uri.path()
            },
            response: {
                status: res.status,
                headers: res.headers,
                body: res.body,
            }
        };
    };

    async save(fileName, req, res) {
        const example = ApiExamples.generate(req, res);
        fs.writeFileSync(`${this.pathToExampleDir}/${fileName}.json`, JSON.stringify(example, null, 2));
    }

    findMatchingExample(options) {
        if (!this.apiExamples) {
            this.apiExamples = this.readApiExamples()
        }
        return this.apiExamples.find(example => {
            return Object.keys(options).every(
                requestOption => {
                    if (options[requestOption] instanceof RegExp) {
                        return options[requestOption].test(example.request[requestOption]);
                    }
                    return example.request[requestOption] === options[requestOption];
                }
            );
        }).response;
    };


    async pullApiExamples() {
        const bucket = storage().bucket(this.bucketName);
        const response = await bucket.getFiles();
        const files = response[0];
        await Promise.all(
            files.map(eg => new Promise(resolve => {
                    const fileName = `${this.pathToExampleDir}/${eg.name}`;
                    this._ensureDirectoryExistence(fileName);
                    eg.createReadStream()
                        .on('end', () => {
                            resolve()
                        })
                        .pipe(fs.createWriteStream(fileName));
                })
            )
        )
    }

    _ensureDirectoryExistence(filePath) {
        let dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) {
            return true;
        }
        this._ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }
}
