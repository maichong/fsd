import test from 'tape';
import type { fsd as fsdFn } from 'fsd';

export default function (fsd: fsdFn) {
  test(fsd.adapter.name + ' > toString', (troot) => {
    let dirPath = '/abc/';

    troot.test(fsd.adapter.name + ' > before toString', async(t) => {
      let dir = fsd(dirPath);
      await dir.mkdir();
      t.ok(await dir.exists(), 'mkdir error');
      t.end();
    });

    troot.test(fsd.adapter.name + ' > toString', async(t) => {
      let dir = fsd(dirPath);
      let data = await dir.toString();
      t.equal(data, dirPath, 'toString OK');
      t.end();
    });

    troot.test(fsd.adapter.name + ' > clear toString', async(t) => {
      let dir = fsd(dirPath);
      if (await dir.exists()) {
        await dir.unlink();
      }
      t.end();
    });

    troot.end();
  });
}
