import { SagaContext, SagaStep, SagaStepName } from "../../types/saga.js";
import * as txnsService from '../../service/txns.js'
import { TxnStatus } from '../../types/txns.js'

export class UpdateTxnsStatusDebitStep implements SagaStep {
    getName(): SagaStepName {
        return SagaStepName.UPDATE_TXNS_STATUS_DEBIT;
    }

    async execute(context: SagaContext): Promise<SagaContext> {
        const updatedTxns = await txnsService.updateTxnsStatus(
            context.idempotencyKey,
            TxnStatus.DEBITED,
            context.from_User
        );

        context.transaction = updatedTxns;

        return context;


    }

    async compensate(context: SagaContext): Promise<void> {

        if (!context.transaction) {

        }

        await txnsService.updateTxnsStatus(
            context.idempotencyKey,
            TxnStatus.PENDING,
            context.from_User
        );

    }
}