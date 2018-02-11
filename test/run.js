const Path = require('path');
const glob = require('glob');
const del = require('del');
const mkdirp = require('mkdirp');

const FSD = require('../packages/fsd/src/fsd');
const FSAdapter = require('../packages/fsd-fs/src/index');
const OSSAdapter = require('../packages/fsd-oss/src/index');

glob('cases/*', {
  cwd: __dirname
}, (error, files) => {
  for (let file of files) {
    if (file.indexOf('/') === -1) continue;
    let cases = require(Path.join(__dirname, file)).default;

    {
      // FS
      del.sync('/tmp/fsd', { force: true });
      mkdirp.sync('/tmp/fsd');
      let adapter = new FSAdapter({
        root: '/tmp/fsd',
        urlPrefix: 'http://localhost',
        tmpdir: '/tmp/fsd-tmp'
      });
      cases(FSD({ adapter }));
    }

    {
      // OSS
      let adapter = new OSSAdapter({
        keyId: process.env.FILE_OSS_KEYID,
        secret: process.env.FILE_OSS_SECRET,
        bucket: process.env.FILE_OSS_BUCKET,
        endpoint: process.env.FILE_OSS_ENDPOINT,
        urlPrefix: 'http://localhost',
        root: '/fsd'
      });
      cases(FSD({ adapter }));
    }
  }
});
