/* global ORE_TESTA_ACCOUNT_NAME:true */
/* global ORE_NETWORK_URI:true */
const { mockBlock, mockInfo } = require('./helpers/fetch');
const { constructOrejs, mockGetAccount, mockGetInfo, mockGetBlock, mockGetBlockError, mockGetTransaction } = require('./helpers/orejs');

describe('eos', () => {
  let orejs;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  describe('awaitTransaction via sendTransaction', () => {
    let transaction;
    let info;
    let block;
    let spyInfo;
    let spyBlock;

    beforeAll(() => {
      transaction = mockGetTransaction(orejs);
      info = mockGetInfo(orejs);
      block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id } }] });
      spyInfo = jest.spyOn(orejs.eos.rpc, 'get_info');
      spyBlock = jest.spyOn(orejs.eos.rpc, 'get_block');
    });

    it('returns the transaction', async () => {
      await orejs.sendTransaction(async () => {
        await setTimeout(() => true, 10);
        return transaction;
      }, true, { blocksToCheck: 10, checkInterval: 10 });
      expect(spyInfo).toHaveBeenCalledWith({});
      expect(spyBlock).toHaveBeenCalledWith(block.block_num - 1);
    });

    describe('when the transaction is not found', () => {
      beforeAll(() => {
        jest.clearAllMocks();
        transaction = mockGetTransaction(orejs);
        info = mockGetInfo(orejs);
        block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id + 1 } }] });
      });

      it('throws an error with the block number', async () => {
        const result = orejs.sendTransaction(async () => {
          await setTimeout(() => true, 10);
          return transaction;
        }, true, { blocksToCheck: 2, checkInterval: 10 });
        await expect(result).rejects.toThrow(/Await Transaction Timeout/);
      });
    });

    describe('when maxBlockAttemptReached', () => {
      beforeAll(() => {
        jest.clearAllMocks();
        transaction = mockGetTransaction(orejs);
        info = mockGetInfo(orejs);
        block = mockGetBlockError(orejs);
      });

      xit('throws an error with the block number', async () => {
        try {
          await orejs.sendTransaction(async () => {
            await setTimeout(() => true, 100);
            return transaction;
          }, true, { blocksToCheck: 2, checkInterval: 10, getBlockAttempts: 1 });
        } catch (err) {
          await expect(err.name).toBe('maxBlockReadAttemptsTimeout');
        }
      });
    });
  });

  describe('hasTransaction', () => {
    let block;
    let transactionId;
    let transaction;

    beforeAll(() => {
      transactionId = 'asdf';
      transaction = {
        trx: {
          id: transactionId
        }
      };
    });

    describe('when the block includes the transaction', () => {
      beforeAll(() => {
        block = {
          transactions: [transaction]
        };
      });

      it('returns true', async () => {
        const hasTransaction = await orejs.hasTransaction(block, transactionId);
        expect(hasTransaction).toEqual(true);
      });
    });

    describe('when the block does not include the transaction', () => {
      beforeAll(() => {
        block = {
          transactions: []
        };
      });

      it('returns false', async () => {
        const hasTransaction = await orejs.hasTransaction(block, transactionId);
        expect(hasTransaction).toEqual(false);
      });
    });
  });
});
