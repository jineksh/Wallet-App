import {
    CreateTxnsStep,
    DebitAmountStep,
    UpdateTxnsStatusDebitStep,
    CreditAmountStep,
    UpdateTxnsStatusCreditStep
} from '../steps/index.js'
import {
    SagaContext,
    SagaStep
} from '../../types/saga.js'
import { ShardId } from '../../types/shard.js'
import { TxnStatus } from '../../types/txns.js';
import { getShardId } from '../../utils/shardReslover.js';
import logger from '../../config/logger.js';


class SagaOrchestrator {
    private steps: SagaStep[] = [
        new CreateTxnsStep(),
        new DebitAmountStep(),
        new UpdateTxnsStatusDebitStep(),
        new CreditAmountStep(),
        new UpdateTxnsStatusCreditStep()
    ]

    async transfer(from_user: bigint, to_user: bigint, amount: bigint, idempotencyKey: string): Promise<any> {

        logger.info('Saga transfer started', {
            from_user: from_user.toString(),
            to_user: to_user.toString(),
            amount: amount.toString(),
            idempotencyKey,
        });

        if (amount <= 0) {
            logger.warn('Saga transfer rejected - amount must be positive', { amount: amount.toString() });
            throw new Error('Amount must be positive');
        }

        if (from_user === to_user) {
            logger.warn('Saga transfer rejected - same user transfer', {
                from_user: from_user.toString(),
                to_user: to_user.toString(),
            });
            throw new Error('Cannot transfer money to same user');
        }

        const from_shardId: ShardId = getShardId(from_user);
        const to_shardId: ShardId = getShardId(to_user);

        let sagaContext: SagaContext = {
            from_User: from_user,
            to_user: to_user,
            amount: amount,
            idempotencyKey: idempotencyKey,
            from_user_shard: from_shardId,
            to_user_shard: to_shardId,
            isDebbited: false,
            isCredited: false
        };

        const executedSteps: SagaStep[] = [];

        try {
            for (let i = 0; i < this.steps.length; i++) {
                if (sagaContext.transaction) {
                    const status = sagaContext.transaction.status;

                    if (status === TxnStatus.CREDITED) {
                        logger.info('Saga transfer completed successfully', { idempotencyKey, status });
                        return sagaContext;
                    }

                    if (status === TxnStatus.FAILED) {
                        logger.warn('Saga transfer failed during execution', { idempotencyKey, status });
                        throw new Error('Transaction failed');
                    }

                    if (status === TxnStatus.DEBITED) {
                        if (i < 3) {
                            continue;
                        }
                        executedSteps.push(this.steps[i]);
                    }
                }

                const step = this.steps[i];
                logger.info('Executing saga step', { step: step.getName(), idempotencyKey });
                sagaContext = await step.execute(sagaContext);
                executedSteps.push(step);
            }
        } catch (error) {
            logger.error('Saga execution failed, running compensation', {
                idempotencyKey,
                error: error instanceof Error ? error.message : error,
            });
            for (let i = executedSteps.length - 1; i >= 0; i--) {
                try {
                    await executedSteps[i].compensate(sagaContext);
                    logger.info('Saga compensation completed', { step: executedSteps[i].getName(), idempotencyKey });
                } catch (compensateError) {
                    logger.error(`Compensation failed for step ${executedSteps[i].getName()}`, {
                        idempotencyKey,
                        error: compensateError instanceof Error ? compensateError.message : compensateError,
                    });
                }
            }
            throw error;
        }

        logger.info('Saga transfer completed', {
            idempotencyKey,
            transactionId: sagaContext.transaction?.id?.toString(),
        });
        return sagaContext;
    }
}

export default new SagaOrchestrator();