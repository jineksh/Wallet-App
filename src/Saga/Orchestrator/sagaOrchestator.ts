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
import { getShardId } from '../../utils/shardReslover.js';


class SagaOrchestrator {
    private steps: SagaStep[] = [
        new CreateTxnsStep(),
        new DebitAmountStep(),
        new UpdateTxnsStatusDebitStep(),
        new CreditAmountStep(),
        new UpdateTxnsStatusCreditStep()
    ]

    async transfer(from_user: bigint, to_user: bigint, amount: bigint, idempotencyKey: string): Promise<any> {

        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }

        if(from_user === to_user){
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
        }

        const executedSteps: SagaStep[] = [];

        try {
            for (let i = 0; i < this.steps.length; i++) {


                if(sagaContext.transaction){

                    const status = sagaContext.transaction.status;


                    if(status === 'CREDITED'){
                        return sagaContext;
                    }

                    if(status === 'FAILED'){
                        throw new Error("")
                    }

                    if(status === 'DEBITED'){
                        
                        if(i < 3){
                            continue;
                        }
                        executedSteps.push(this.steps[i]);
                    }


                }

                const step = this.steps[i];

                sagaContext = await step.execute(sagaContext);

                executedSteps.push(step);
            }
        } catch (error) {
            for (let i = executedSteps.length - 1; i >= 0; i--) {

                try {

                    await executedSteps[i].compensate(sagaContext);

                } catch (compensateError) {

                    console.error(`Compensation failed for step ${executedSteps[i].getName()}`, compensateError);

                }
            }
            throw error;
        }

        return sagaContext;
    }
}

export default new SagaOrchestrator();