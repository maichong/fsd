require('dotenv').config();

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, '\nreason:', reason);
  process.exit(1);
});

const Path = require('path');
const glob = require('glob');
const del = require('del');
const mkdirp = require('mkdirp');

const FSD = require('../packages/fsd/src/fsd');
const FSAdapter = require('../packages/fsd-fs/src/index');
const OSSAdapter = require('../packages/fsd-oss/src/index');
const VODAdapter = require('../packages/fsd-vod/src/index');

glob('vod/*', {
  cwd: __dirname
}, (error, files) => {
  {
    // VOD
    let adapter = new VODAdapter({
      accessKeyId: process.env.VOD_KEYID,
      accessKeySecret: process.env.VOD_SECRET,
      templateGroupId: process.env.VOD_TEMPLATE_GROUP_ID,
    });

    for (let file of files) {
      if (file.indexOf('/') === -1) continue;
      let cases = require(Path.join(__dirname, file)).default;
      cases(FSD({ adapter }));
    }
  }
});

glob('cases/*', {
  cwd: __dirname
}, (error, files) => {
  {
    // FS
    del.sync('/tmp/fsd', { force: true });
    mkdirp.sync('/tmp/fsd');
    mkdirp.sync('/tmp/fsd-tmp');
    let adapter = new FSAdapter({
      root: '/tmp/fsd',
      urlPrefix: 'http://localhost',
      tmpdir: '/tmp/fsd-tmp'
    });

    for (let file of files) {
      if (file.indexOf('/') === -1) continue;
      let cases = require(Path.join(__dirname, file)).default;
      cases(FSD({ adapter }));
    }
  }

  {
    // OSS
    let adapter = new OSSAdapter({
      accessKeyId: process.env.FILE_OSS_KEYID,
      accessKeySecret: process.env.FILE_OSS_SECRET,
      bucket: process.env.FILE_OSS_BUCKET,
      endpoint: process.env.FILE_OSS_ENDPOINT,
      urlPrefix: 'http://localhost',
      publicRead: true,
      root: '/fsd-test'
    });

    for (let file of files) {
      if (file.indexOf('/') === -1) continue;
      let cases = require(Path.join(__dirname, file)).default;
      cases(FSD({ adapter }));
    }
  }
});
