import test from 'tape';
import type { fsd as fsdFn } from 'fsd';

export default function (fsd: fsdFn) {
  test('exists', (troot) => {
    let dirPath = '/abc/bcd/';
    let validPath = '/qwe/asd';
    test('exists true', async(t) => {
      let dir = fsd(dirPath);
      await dir.mkdir(true);
      let isExists = await dir.exists();
      t.ok(isExists, 'exists true OK');
      await dir.unlink();
      t.end();
    });

    test('exists false', async(t) => {
      let dir = fsd(validPath);
      await dir.unlink();
      let isExists = await dir.exists();
      t.ok(!isExists, 'exists false Ok');
      t.end();
    });

    test('clear exists', async(t) => {
      let file = fsd(dirPath);
      let validFile = fsd(validPath);
      if (await file.exists()){
        await file.unlink();
      }
      if (await validFile.exists()){
        await validFile.unlink();
      }
      t.end();
    });

    troot.end();
  });
}
