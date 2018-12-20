const fetch = require('node-fetch');
const eosjs = require('eosjs');
const { TextDecoder, TextEncoder } = require('text-encoding');
const accounts = require('./accounts');
const cpu = require('./tokens/cpu');
const crypto = require('./modules/crypto');
const eos = require('./eos');
const instrument = require('./instrument');
const ore = require('./tokens/ore');
const oreStandardToken = require('./orestandardtoken');
const rightsRegistry = require('./rightsregistry');
const usageLog = require('./usagelog');
const verifier = require('./verifier');

class Orejs {
  constructor(config = {}) {
    this.constructEos(config);

    /* Mixins */
    Object.assign(this, accounts);
    Object.assign(this, cpu);
    Object.assign(this, crypto);
    Object.assign(this, eos);
    Object.assign(this, instrument);
    Object.assign(this, ore);
    Object.assign(this, oreStandardToken);
    Object.assign(this, rightsRegistry);
    Object.assign(this, usageLog);
    Object.assign(this, verifier);
  }

  constructEos(config) {
    this.config = {
      chainName: 'ore',
      ...config
    };
    this.signatureProvider = this.config.signatureProvider || new eosjs.JsSignatureProvider(this.config.privateKeys || []);
    this.rpc = new eosjs.JsonRpc(this.config.httpEndpoint, { fetch: this.config.fetch || fetch });
    this.eos = new eosjs.Api({
      chainId: this.config.chainId,
      rpc: this.rpc,
      signatureProvider: this.signatureProvider,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    });
  }
}

// NOTE: Working with multiple http endpoints, allows our RPC calls to keep working, in the event that one endpoint goes down
// NOTE: Call this method with multiple endpoints, to ensure RPC endpoint redundancy
// NOTE: This will simply take the the first RPC URI that responds with a chain id from get_info
function getFastestHttpEndpoint(httpEndpoints) {
  return Promise.race(httpEndpoints.map(httpEndpoint => {
    return new Promise(async (resolve, reject) => {
      const rpc = new eosjs.JsonRpc(httpEndpoint, { fetch });
      const info = await rpc.get_info();
      if (info && info.chain_id) {
        resolve({ httpEndpoint, chainId: info.chain_id });
      }
    });
  }));
}

module.exports = {
  crypto,
  getFastestHttpEndpoint,
  Orejs,
};
