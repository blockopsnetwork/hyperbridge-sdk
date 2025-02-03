import { SubstrateEvent } from '@subql/types';
import { RequestService } from '../../../services/request.service';
import { Status } from '../../../types';
import {
 extractStateMachineIdFromSubstrateEventData,
 getHostStateMachine,
} from '../../../utils/substrate.helpers';
import { HYPERBRIDGE } from '../../../constants';

export async function handleSubstratePostRequestTimeoutHandledEvent(
 event: SubstrateEvent
): Promise<void> {
 logger.info(`Handling ISMP PostRequestTimeoutHandled Event`);

 const host = getHostStateMachine(chainId);

 const stateMachineId = extractStateMachineIdFromSubstrateEventData(
  event.event.data.toString()
 );

 if (typeof stateMachineId === 'undefined') return;

 if (!event.extrinsic) return;

 const {
  event: { data },
  extrinsic,
  block: {
   timestamp,
   block: {
    header: { number: blockNumber, hash: blockHash },
   },
  },
 } = event;

 const timeoutStatus =
  host === HYPERBRIDGE.testnet || HYPERBRIDGE.mainnet
   ? Status.HYPERBRIDGE_TIMED_OUT
   : Status.TIMED_OUT;

 const eventData = data.toJSON();
 const timeoutData = Array.isArray(eventData)
  ? (eventData[0] as { commitment: any; source: any; dest: any })
  : undefined;

 if (!timeoutData) return;

 await RequestService.updateStatus({
  commitment: timeoutData.commitment.toString(),
  chain: host,
  blockNumber: blockNumber.toString(),
  blockHash: blockHash.toString(),
  blockTimestamp: timestamp
   ? BigInt(Date.parse(timestamp.toString()))
   : BigInt(0),
  status: timeoutStatus,
  transactionHash: extrinsic.extrinsic.hash.toString(),
 });
}
