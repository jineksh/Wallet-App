import { SagaContext, SagaStep, SagaStepName } from "../../types/saga.js";
import * as walletService from '../../service/wallet.js'
import { executeInTransaction } from "../../utils/txns.js";

export class CreditAmountStep implements SagaStep {
    getName(): SagaStepName {
        return SagaStepName.CREDIT_AMOUNT;
    }

    async execute(context: SagaContext): Promise<SagaContext> {

        if (!context.transaction) {
            throw new Error("Transaction not found in context");
        }

        const credit = await executeInTransaction(context.to_user_shard, async (tx) => {
            
            return await walletService.credit(
                context.to_user,
                context.amount,
                context.transaction!.id!,
                tx
            );
        });

        if (!credit) {
            throw new Error("Failed to credit amount");
        }

        context.isCredited = true;

        return context;
    }

    async compensate(context: SagaContext): Promise<void> {

        if (!context.transaction) {
            throw new Error("Transaction not found in context");
        }

        if (context.isCredited) {

            await executeInTransaction(context.to_user_shard, async (tx) => {
                await walletService.debit(
                    context.to_user,
                    context.amount,
                    context.transaction!.id!,
                    tx
                );
            });
        }
    }
}