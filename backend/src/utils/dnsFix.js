import dns from 'node:dns';
import { execSync } from 'node:child_process';

const originalResolveSrv = dns.promises.resolveSrv.bind(dns.promises);
const originalResolveTxt = dns.promises.resolveTxt.bind(dns.promises);
const originalCallbackSrv = dns.resolveSrv.bind(dns);
const originalCallbackTxt = dns.resolveTxt.bind(dns);

function fallbackResolveSrv(name) {
  // Check known MongoDB Atlas clusters first for sub-millisecond resolution
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

  // Windows PowerShell fallback
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

function fallbackResolveTxt(name) {
  return [['authSource=admin']];
}

// Monkey patch promises API
dns.promises.resolveSrv = async function (name) {
  try {
    return await originalResolveSrv(name);
  } catch (err) {
    if (err && (err.code === 'EBADRESP' || err.code === 'ENOTFOUND' || err.code === 'ESERVFAIL')) {
      return fallbackResolveSrv(name);
    }
    throw err;
  }
};

dns.promises.resolveTxt = async function (name) {
  try {
    return await originalResolveTxt(name);
  } catch (err) {
    if (err && (err.code === 'EBADRESP' || err.code === 'ENOTFOUND' || err.code === 'ESERVFAIL')) {
      return fallbackResolveTxt(name);
    }
    throw err;
  }
};

// Monkey patch callback API
dns.resolveSrv = function (name, cb) {
  originalCallbackSrv(name, (err, records) => {
    if (err && (err.code === 'EBADRESP' || err.code === 'ENOTFOUND' || err.code === 'ESERVFAIL')) {
      try {
        const fallback = fallbackResolveSrv(name);
        return cb(null, fallback);
      } catch (fbErr) {
        return cb(fbErr);
      }
    }
    return cb(err, records);
  });
};

dns.resolveTxt = function (name, cb) {
  originalCallbackTxt(name, (err, records) => {
    if (err && (err.code === 'EBADRESP' || err.code === 'ENOTFOUND' || err.code === 'ESERVFAIL')) {
      try {
        const fallback = fallbackResolveTxt(name);
        return cb(null, fallback);
      } catch (fbErr) {
        return cb(fbErr);
      }
    }
    return cb(err, records);
  });
};

export default true;
