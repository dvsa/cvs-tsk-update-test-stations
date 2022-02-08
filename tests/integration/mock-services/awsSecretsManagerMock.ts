const awsSecretsManagerMock = (nock, hostname) =>
  nock(hostname)
  .persist()
  .post('/')
  .reply(200, { SecretString: 'SITE-1,SITE-2,SITE-3' });

module.exports = awsSecretsManagerMock;
