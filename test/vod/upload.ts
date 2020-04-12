import * as fs from 'fs';
import * as test from 'tape';
import delay from 'delay';
import { FileGenerator } from '../../packages/fsd';

export default function (fsd: FileGenerator) {
  const buffer = fs.readFileSync('test/test.mp4');

  test(`${fsd.adapter.name} > append`, (troot) => {
    troot.test(`${fsd.adapter.name} > append buffer`, async (t) => {
      let videoId = await fsd.adapter.alloc({ name: 'test append.mp4' });
      let file = fsd(videoId);
      await file.append(buffer);
      await delay(2000);
      t.ok(await file.exists(), 'Video exists');
      t.equal(await file.size(), buffer.length, 'Video size');
      let url = await file.createUrl();
      t.ok(url.startsWith('http'), 'createUrl');

      // @ts-ignore
      let playInfo = await fsd.adapter.getPlayInfo(videoId);
      t.ok(playInfo.PlayInfoList.PlayInfo, 'PlayInfo');

      // await file.unlink();
      t.end();
    });

    troot.test(`${fsd.adapter.name} > append stream`, async (t) => {
      let videoId = await fsd.adapter.alloc({ name: 'test append stream.mp4' });
      let file = fsd(videoId);
      await file.append(fs.createReadStream('test/test.mp4'));
      await delay(200);
      t.ok(await file.isFile(), 'isFile()');
      // await file.unlink();
      t.end();
    });

    troot.test(`${fsd.adapter.name} > write buffer`, async (t) => {
      let videoId = await fsd.adapter.alloc({ name: 'test write buffer.mp4' });
      let file = fsd(videoId);
      await file.write(buffer);
      await delay(200);
      t.ok(await file.exists(), 'Video exists');
      t.equal(await file.size(), buffer.length, 'Video size');

      let stream = await file.createReadStream();
      stream.pipe(fs.createWriteStream('/tmp/download.mp4')).on('close', async () => {
        let data = fs.readFileSync('/tmp/download.mp4');
        t.ok(data.equals(buffer), 'download');
        // await file.unlink();
        t.end();
      });
    });

    troot.test(`${fsd.adapter.name} > multipart upload`, async (t) => {
      let videoId = await fsd.adapter.alloc({ name: 'test multipart upload.mp4' });
      let file = fsd(videoId);
      let index = 120 * 1024; // 120KB
      let part1 = buffer.slice(0, index - 1);
      let part2 = buffer.slice(index - 1);

      let tasks = await file.initMultipartUpload(2);
      t.equal(tasks.length, 2, 'part count');

      let parts = [];
      parts.push(await file.writePart(tasks[0], part1));

      // eslint-disable-next-line
      file = fsd(videoId);

      parts.push(await file.writePart(tasks[1], part2));

      await file.completeMultipartUpload(parts);
      await delay(200);
      t.ok(await file.exists(), 'multipart upload completed');

      let stream = await file.createReadStream({ start: 0, end: part1.length - 1 });
      stream.pipe(fs.createWriteStream('/tmp/download.part1.mp4')).on('close', async () => {
        let data = fs.readFileSync('/tmp/download.part1.mp4');
        t.ok(data.equals(part1), 'download part');
        // await file.unlink();
        t.end();
      });
    });

    troot.end();
  });
}
