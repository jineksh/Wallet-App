import { Txns } from "./txns";
import {ShardId} from './shard'

export enum SagaStepName {
    CREATE_TXNS = 'CREATE_TXNS',
    DEBIT_AMOUNT = 'DEBIT_AMOUNT',
    UPDATE_TXNS_STATUS_DEBIT = 'UPDATE_TXNS_STATUS_DEBIT',
    CREDIT_AMOUNT = 'CREDIT_AMOUNT',
    UPDATE_TXNS_STATUS_CREDIT = 'UPDATE_TXNS_STATUS_CREDIT'
}

type prismaConnectionClient = any;


export interface SagaContext {

    transaction?: Txns,
    from_User : bigint,
    to_user : bigint,
    from_user_shard : ShardId,
    to_user_shard : ShardId,
    amount : bigint,
    idempotencyKey : string,
    isDebbited? : boolean,
    isCredited? : boolean,
    fromQueryRunner? : prismaConnectionClient,
    toQueryRunner? : prismaConnectionClient

}

export interface SagaStep {
    execute(context: SagaContext): Promise<SagaContext>;

    compensate(context: SagaContext): Promise<void>;
   
    getName(): SagaStepName;
}