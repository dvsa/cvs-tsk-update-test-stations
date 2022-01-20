# cvs-svc-template

The template for CVS lambda services

## Dependencies

The project runs on node 10.x with typescript and serverless framework. For further details about project dependencies, please refer to the `package.json` file.
[nvm](https://github.com/nvm-sh/nvm/blob/master/README.md) is used to managed node versions and configuration explicitly done per project using an `.npmrc` file.

## Running the project

Once the dependencies are installed, you will be required to rename the `/config/env.example` file to `.env.local` as we use dotenv files for configuration for local local development for example. Further information about [variables](https://www.serverless.com/framework/docs/providers/aws/guide/variables/) and [environment variables](https://www.serverless.com/framework/docs/environment-variables/) with serverless.
Please note that multiple `.env` files can be created per environments. Our current development environment is 'local'.

The application runs on port `:3001` by default when no stage is provided.

To get started, please change the meta data of your `package.json` and `serverless.yml` file accordingly as well as base api route for your express router.
The router is currently being mounted in the following file `src/infrastructure/api/index.ts`.

The service has local environmental variables (please see `env` placeholder file) set locally however should we wish to further extend the service, the environmental variables will need to be ported over to the CI/CD pipeline which currently uses `BRANCH` and `BUCKET`.

### Environments

We use `NODE_ENV` environment variable to set multi-stage builds (region, stages) with the help of dotenv through npm scripts to load the relevant `.env.<NODE_ENV>` file from `./config` folder into the `serverless.yml` file as we don't rely on serverless for deployment.
If no `NODE_ENV` value is provided when running the scripts, it will default its `NODE_ENV` value to 'development' with the `.env.development` config file.

The defaulted values for 'stage' and 'region' are `'local'`. Please refer to the values provided in the `serverless.yml` file.

The following values can be provided when running the scripts with `NODE_ENV`:

```ts
// ./config/.env.<NODE_ENV> files
'local'; // used for local development
'development'; // used development staging should we wish to require external services
'test'; // used during test scripts where local services, mocks can be used in conjonction
```

```ts
/** Running serverless offline as an example for a specific stage - 'local'.
* Stage 'local' will be injected in the serverless.yml
**/
NODE_ENV=local serverless offline

```

Further details about environment setup can be found in the provided documentation and `env.example` file.

All secrets the secrets are will stored in `AWS Secrets Manager`.

### Scripts

The following scripts are available, for further information please refer to the project `package.json` file:

- <b>start</b>: `npm start` - _launch serverless offline service_
- <b>dev</b>: `npm run dev` - _run in parallel the service and unit tests in_ `--watch` _mode with live reload_.
- <b>test</b>: `npm t` - _execute the unit test suite_
- <b>build</b>: `npm run build` - _bundle the project for production_
- <b>production build</b>: `npm run build:production` - _generate the project with bundled libraries, minified, concatenated code_

### Offline

Serverless-offline with webpack is used to run the project locally. Please use `npm run dev` script to do so. Go to `http://localhost:3001/local/version` to confirm that everything has loaded correctly, you should see that the version is the same as the version in the `package.json`

The below routes are available as default routes from this scaffolding

```
(GET) http://localhost:3009/local-stage/version
(GET) http://localhost:3009/local-stage/*/service-name/
(POST) http://localhost:3009/local-stage/*/service-name/:id/something
```

### Lambda locally

Serverless can invoke lambda functions locally which provide a close experience to the real service if you decide not use the offline mode. `events` and `paths` can be found under `/local` folder.
For further details using lambda locally please refer to the [serverless documentation](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/).

### Debugging

Existing configuration to debug the running service has been made available for vscode, please refer to `.vscode/launch.json` file. Serverless offline will be available on port `:4000`. 2 jest configurations are also provided which will allow to run a test or multiple tests.
Should you wish to change the ports when debugging, please change the config args accordingly.

For further information about debugging, please refer to the following documentation:

- [Run-a-function-locally-on-source-changes](https://github.com/serverless-heaven/serverless-webpack#run-a-function-locally-on-source-changes)

- [VSCode debugging](https://github.com/serverless-heaven/serverless-webpack#vscode-debugging)

- [Debug process section](https://www.serverless.com/plugins/serverless-offline#usage-with-webpack)

## Testing

[json-serverless](https://github.com/pharindoko/json-serverless) has been added to the repository should we wish to mock external services during development and can be used in conjunction with the `test` environment.

### Unit

Jest is used for unit testing.
Please refer to the [Jest documentation](https://jestjs.io/docs/en/getting-started) for further details.

### Integration

To be added and customised depending on needs, supertest is used but we could be looking at other packages such as nock, ts-mockito, typemoq, wiremock, etc.. or testing (pactjs, hoverfly, mockserver, etc..)

## Infrastructure

<Insert Design>

### Release

Releases (tag, release notes, changelog, github release, assets) are automatically managed by [semantic-release](https://semantic-release.gitbook.io/semantic-release/) and when pushing (or merging) to `develop` branch which is protected. [semver](https://semver.org/) convention is followed.

Please be familiar with conventional commit as described in the Contributing section below.

Default preset used is angular for conventional commits, please see the [angular conventions](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional#type-enum).

The `<type>` `'breaking'` in the commit message will trigger a major version bump as well as any of the following text contained in the commit body: `"BREAKING CHANGE", "BREAKING CHANGES", "BREAKING_CHANGES", "BREAKING", "BREAKING_CHANGE"`. Please refer to the `.releaserc.json` file for the full configuration.

The script `npm run release` will automatically trigger the release in CI. To manually test the release the following flags -`--dry-run --no-ci` - can be passed to the release script.

Publishing and artifacts are managed separately by the pipeline.

## Contributing

To facilitate the standardisation of the code, a few helpers and tools have been adopted for this repository.

### External dependencies

The projects has multiple hooks configured using [husky](https://github.com/typicode/husky#readme) which will execute the following scripts: `audit`, `lint`, `build`, `test` and format your code with [eslint](https://github.com/typescript-eslint/typescript-eslint#readme) and [prettier](https://github.com/prettier/prettier).

You will be required to install [git-secrets](https://github.com/awslabs/git-secrets) (_brew approach is recommended_) and DVSA [repo-security-scanner](https://github.com/UKHomeOffice/repo-security-scanner) that runs against your git log history to find accidentally committed passwords, private keys.

We follow the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/) when we commit code to the repository and follow the [angular convention](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional#type-enum).

The type is mandatory and must be all lowercase.
The scope of your commit remain is also mandatory, it must include your ticket number and be all lowercase. The format for the ticket number can be set in the commitlint.config.js file.

```js
// Please see /commitlint.config.js for customised format

type(scope?): subject

// examples
'chore(cvsb-1234): my commit msg' // pass
'CHORE(cvsb-1234): my commit msg' // will fail

```

### Code standards

#### Code structure

Domain Drive Design diagram with Interfaces, Application, Domain layers and Infrastructure across the layers.

<p align="center">
  <img src="./docs/DDD_architecture.jpg" alt="Domain Drive Design diagram with Interfaces, Application, Domain layers and Infrastructure across the layers" >
</p>

#### Toolings

The code uses [eslint](https://eslint.org/docs/user-guide/getting-started), [typescript clean code standards](https://github.com/labs42io/clean-code-typescript) as well as sonarqube for static analysis.
SonarQube is available locally, please follow the instructions below if you wish to run the service locally (brew is the preferred approach):

- _Brew_:

  - Install sonarqube using brew
  - Change `sonar.host.url` to point to localhost, by default, sonar runs on `http://localhost:9000`
  - run the sonar server `sonar start`, then perform your analysis `npm run sonar-scanner`

- _Manual_:
  - Add sonar-scanner in environment variables in your \_profile file add the line: `export PATH=<PATH_TO_SONAR_SCANNER>/sonar-scanner-3.3.0.1492-macosx/bin:$PATH`
  - Start the SonarQube server: `cd <PATH_TO_SONARQUBE_SERVER>/bin/macosx-universal-64 ./sonar.sh start`
  - In the microservice folder run the command: `npm run sonar-scanner`
