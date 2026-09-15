import { SagaContext, SagaStep, SagaStepName } from "../../types/saga.js";
import * as txnsService from '../../service/txns.js'
import { TxnStatus } from '../../types/txns.js'

export class UpdateTxnsStatusCreditStep implements SagaStep {
    getName(): SagaStepName {
        return SagaStepName.UPDATE_TXNS_STATUS_CREDIT;
    }

    async execute(context: SagaContext): Promise<SagaContext> {

        const updatedTxns = await txnsService.updateTxnsStatus(
            context.idempotencyKey,
            TxnStatus.CREDITED,
            context.to_user
        );

        context.transaction = updatedTxns;

        return context;
    }

    async compensate(context: SagaContext): Promise<void> {

        await txnsService.updateTxnsStatus(
            context.idempotencyKey,
            TxnStatus.PENDING,
            context.to_user
        );
        
    }
}