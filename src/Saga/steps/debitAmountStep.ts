import { SagaContext, SagaStep, SagaStepName } from "../../types/saga.js";
import * as walletService from '../../service/wallet.js'
import { executeInTransaction } from "../../utils/txns.js";

export class DebitAmountStep implements SagaStep {
    getName(): SagaStepName {
        return SagaStepName.DEBIT_AMOUNT;
    }

    async execute(context: SagaContext): Promise<SagaContext> {

        if (!context.transaction) {
            throw new Error("Transaction not found in context");
        }

        return await executeInTransaction(context.from_user_shard, async (tx) => {

            context.fromQueryRunner = tx;

            const debit = await walletService.debit(
                context.from_User,
                context.amount,
                context.transaction!.id!,
                tx
            );

            if (!debit) {
                throw new Error("Failed to debit amount");
            }

            context.isDebbited = true;
            context.fromQueryRunner = undefined;

            return context;
        });
    }

    async compensate(context: SagaContext): Promise<void> {

        if (!context.transaction) {
            throw new Error("Transaction not found in context");
        }

        if (context.fromQueryRunner) {
            await context.fromQueryRunner.$rollback();
        }

        if (context.isDebbited) {
            await executeInTransaction(context.from_user_shard, async (tx) => {
                await walletService.credit(
                    context.from_User,
                    context.amount,
                    context.transaction!.id!,
                    tx
                );
            });
        }
    }
}