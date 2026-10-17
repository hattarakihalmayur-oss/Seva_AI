const dns = require('dns');
const { execSync } = require('child_process');

function fallbackResolveSrv(name) {
  if (name.includes('39xxkjj.mongodb.net')) {
    return [
      { name: 'ac-owfxzof-shard-00-00.39xxkjj.mongodb.net', port: 27017, priority: 0, weight: 0 },
      { name: 'ac-owfxzof-shard-00-01.39xxkjj.mongodb.net', port: 27017, priority: 0, weight: 0 },
      { name: 'ac-owfxzof-shard-00-02.39xxkjj.mongodb.net', port: 27017, priority: 0, weight: 0 },
    ];
  }
  if (name.includes('2fc0vrt.mongodb.net')) {
    return [
      { name: 'ac-uafuzkf-shard-00-00.2fc0vrt.mongodb.net', port: 27017, priority: 0, weight: 0 },
      { name: 'ac-uafuzkf-shard-00-01.2fc0vrt.mongodb.net', port: 27017, priority: 0, weight: 0 },
      { name: 'ac-uafuzkf-shard-00-02.2fc0vrt.mongodb.net', port: 27017, priority: 0, weight: 0 },
    ];
  }

  if (process.platform === 'win32') {
    try {
      const psCmd = `powershell -NoProfile -Command "Resolve-DnsName -Name '${name}' -Type SRV | Select-Object NameTarget, Port, Priority, Weight | ConvertTo-Json -Compress"`;
      const stdout = execSync(psCmd, { encoding: 'utf8', timeout: 5000 }).trim();
      if (stdout) {
        const parsed = JSON.parse(stdout);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        return list.map((item) => ({
          name: (item.NameTarget || '').trim().replace(/\.$/, ''),
          port: item.Port || 27017,
          priority: item.Priority || 0,
          weight: item.Weight || 0,
        }));
      }
    } catch {
      // ignore
    }
  }

  throw new Error(`Failed to resolve SRV record for ${name}`);
}

function fallbackResolveTxt() {
  return [['authSource=admin']];
}

const origSrv = dns.promises.resolveSrv.bind(dns.promises);
const origTxt = dns.promises.resolveTxt.bind(dns.promises);

dns.promises.resolveSrv = async function (name) {
  try {
    return await origSrv(name);
  } catch (err) {
    if (err && (err.code === 'EBADRESP' || err.code === 'ENOTFOUND' || err.code === 'ESERVFAIL' || err.syscall === 'querySrv')) {
      return fallbackResolveSrv(name);
    }
    throw err;
  }
};

dns.promises.resolveTxt = async function (name) {
  try {
    return await origTxt(name);
  } catch (err) {
    if (err && (err.code === 'EBADRESP' || err.code === 'ENOTFOUND' || err.code === 'ESERVFAIL')) {
      return fallbackResolveTxt();
    }
    throw err;
  }
};

module.exports = true;
