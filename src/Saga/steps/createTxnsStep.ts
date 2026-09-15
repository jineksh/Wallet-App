import {
    SagaStepName,
    SagaContext,
    SagaStep
} from '../../types/saga.js'
import * as txnsService from '../../service/txns.js'
import { TxnStatus } from '../../types/txns.js';

export class CreateTxnsStep implements SagaStep {


    getName() {
        return SagaStepName.CREATE_TXNS;
    }

    async execute(context: SagaContext) {

        const exitingTxns = await txnsService.getTxnsByIdempotency(context.idempotencyKey, context.from_User);

        if (exitingTxns) {
            context.transaction = exitingTxns;
            return context;
        }

        const txns = await txnsService.createTxns(context.from_User, context.to_user, context.idempotencyKey, context.amount);

        context.transaction = txns;

        return context;


    }

    async compensate(context: SagaContext): Promise<void> {
        if (context.transaction) {
            await txnsService.updateTxnsStatus(context.idempotencyKey, TxnStatus.FAILED, context.from_User);
        }
    }
}




