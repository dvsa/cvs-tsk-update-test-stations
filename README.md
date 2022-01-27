# cvs-tsk-update-test-stations

AWS Lambda function that updates the list of test stations in the ATF Sites DynamoDB from the master list in Dynamics CE.

Designed to be invoked by a timer every night to pick up the previous days changes, but can be invoked manually.

## Description

The function authenticates with Azure AD, and uses the returned token to retrieve the details of test stations that have changed from Dynamics CE using OData. Each updated test station is added to EventBridge as a separate event, and EventBridge is then responsible for invoking the Test Station API to perform the actual update in DynamoDB.

The test stations are queried on their `modifiedon` property; **by default this is midnight yesterday**, but any valid ISO-formatted date can be passed in.

For example, to update all test stations that have been modified on or since the 1st of December 2021:
```json
{
  "lastModifiedDate": "2021-12-01"
}
```

The solution design can be found in [Confluence](https://wiki.dvsacloud.uk/display/HVT/Selected+Solution+Detail)

## Dependencies

The project runs on node 14.x with typescript. For further details about project dependencies, please refer to the `package.json` file.
[nvm](https://github.com/nvm-sh/nvm/blob/master/README.md) is used to managed node versions and configuration explicitly done per project using an `.npmrc` file.

### Scripts

The following scripts are available, for further information please refer to the project `package.json` file:

- <b>start</b>: `npm start` - _launch serverless offline service_
- <b>dev</b>: `npm run dev` - _run in parallel the service and unit tests in_ `--watch` _mode with live reload_.
- <b>test</b>: `npm run test` - _execute the unit test suite_
- <b>build</b>: `npm run build` - _bundle the project for production_
- <b>production build</b>: `npm run build:production` - _generate the project with bundled libraries, minified, concatenated code_

## Testing

### Unit

Jest is used for unit testing.
Please refer to the [Jest documentation](https://jestjs.io/docs/en/getting-started) for further details.

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

You will be required to install [git-secrets](https://github.com/awslabs/git-secrets) (_brew approach is recommended_) and DVSA [repo-security-scanner](https://github.com/UKHomeOffice/repo-security-scanner) that runs against your git log history to find accidentally committed passwords or private keys.

We follow the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/) when we commit code to the repository and follow the [angular convention](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional#type-enum).

The type is mandatory and must be all lowercase.
The scope of your commit remain is also mandatory, it must include your ticket number and be all lowercase. The format for the ticket number can be set in the `commitlint.config.js` file.

```js
// Please see /commitlint.config.js for customised format

type(scope?): subject

// examples
'chore(cb2-1234): my commit msg' // pass
'CHORE(cb2-1234): my commit msg' // will fail

```
