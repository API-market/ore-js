
const { Keygen } = require('eosjs-keygen');
const ecc = require('eosjs-ecc');
const { mockAction, mockOptions } = require('./helpers/eos');
const { constructOrejs, mockGetAccount, mockGetAccountWithAlreadyExistingAccount, mockGetInfo, mockGetBlock,
  mockGetTransaction } = require('./helpers/orejs');

describe('createbridge', () => {
  let spyTransaction;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  describe('init', () => {
    beforeEach(() => {
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    it('initialises createbridge', () => {
      const contractName = "createbridge";
      const permission = 'active';
      const symbol = "SYS";
      const precision = 4;
      const newAccountContract = "eosio";
      const minimumRAM = 4096;
      const options = {contractName};
      orejs.init(symbol, precision, newAccountContract, minimumRAM, options);
      expect(spyTransaction).toHaveBeenCalledWith({
        actions: [
          mockAction({account: contractName, name:"init", authorization: { actor: contractName, permission }, data:{
            symbol: precision+","+symbol,
            newaccountcontract: newAccountContract,
            minimumram: minimumRAM,
          }})
        ]
      },mockOptions());
    });
  });

  describe('define', () => {

    beforeEach(() => {
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    it('registers an app with createbridge', () => {
        const contractName = "createbridge";
        const accountName = 'eosio';
        const permission = 'active';
        const authorizingAccount = {accountName, permission};
        const appName = Math.random().toString();
        const ram = 4096;
        const net = "1.0000 SYS";
        const cpu = "1.0000 SYS";
        const airdropContract = "";
        const airdropToken = "0 SYS";
        const airdropLimit = "0 SYS";
        const options = {airdropContract, airdropToken, airdropLimit, contractName};
        orejs.define(authorizingAccount, appName, ram, net, cpu, options);
        expect(spyTransaction).toHaveBeenCalledWith({
          actions: [
            mockAction({account: contractName, name:"define", authorization: { permission }, data:{
              owner: accountName,
              dapp: appName,
              ram_bytes: ram,
              net: net,
              cpu: cpu,
              airdrop: {
                contract: airdropContract,
                tokens: airdropToken,
                limit: airdropLimit
              },
            }})
          ]
        },mockOptions());
      });
  });

  describe('whitelist', () => {
    beforeEach(() => {
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    it('whitelist an account as a custodian for an app', () => {
      const contractName = "createbridge";
      const accountName = 'eosio';
      const permission = 'active';
      const authorizingAccount = {accountName, permission};
      const whitelistAccount = 'app.oreid';
      const appName = Math.random().toString();
      const options = {contractName};
      orejs.whitelist(authorizingAccount, whitelistAccount, appName,options);
      expect(spyTransaction).toHaveBeenCalledWith({
        actions: [
          mockAction({account: contractName, name:"whitelist", authorization: { permission }, data:{
            owner: accountName,
            account: whitelistAccount,
            dapp: appName,
          }})
        ]
      },mockOptions()); 
    });
  });

  describe('transfer', () => {
    beforeEach(() => {
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    it('transfers the contribution amount from the contributor to createbridge', () => {
      const contractName = "eosio.token";
      const accountName = 'eosio';
      const permission = 'active';
      const authorizingAccount = {accountName, permission};
      const appName = Math.random().toString();
      const amount = "1.000 SYS";
      const ramPercentage = 50;
      const totalAccounts = 10;
      const options = {contractName};
      orejs.transfer(authorizingAccount, appName, amount, ramPercentage, totalAccounts,options);
      expect(spyTransaction).toHaveBeenCalledWith({
        actions: [
          mockAction({account: contractName, name:"transfer", authorization: { permission }, data:{
            from: accountName,
            to: "createbridge",
            quantity: amount,
            memo: appName + "," + ramPercentage + "," + totalAccounts,
          }})
        ]
      },mockOptions());
    });
  });

  describe('reclaim', () => {
    beforeEach(() => {
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    it('reclaims the contributor\'s remaining core token balance from createbridge', () => {
      const contractName = "createbridge";
      const accountName = 'eosio';
      const permission = 'active';
      const authorizingAccount = {accountName, permission};
      const appName = Math.random().toString();
      const symbol = 'SYS';
      const options = {contractName};
      orejs.reclaim(authorizingAccount, appName, symbol,options);
      expect(spyTransaction).toHaveBeenCalledWith({
        actions: [
          mockAction({account: contractName, name:"reclaim", authorization: { permission }, data:{
            reclaimer: accountName,
            dapp: appName,
            sym: symbol,  
          }})
        ]
      },mockOptions());
    })

    it('reclaims the contributor\'s remaining app token balance from createbridge', () => {
      const contractName = "createbridge";
      const accountName = 'eosio';
      const permission = 'active';
      const authorizingAccount = {accountName, permission};
      const appName = Math.random().toString();
      // example app token
      const symbol = 'EX';
      const options = {contractName};
      orejs.reclaim(authorizingAccount, appName, symbol,options);
      expect(spyTransaction).toHaveBeenCalledWith({
        actions: [
          mockAction({account: contractName, name:"reclaim", authorization: { permission }, data:{
            reclaimer: accountName,
            dapp: appName,
            sym: symbol,  
          }})
        ]
      },mockOptions());
    });
  });
});