import type { Action, AnyAction } from "@reduxjs/toolkit";

import { Communicator } from "./runtime";
import { PreloadedState, StoreState } from "./state";
import { sugar } from "./sugar";
import { validateAction } from "./validate";

/** A store whose state can be retrieved. */
export interface StoreStateGetter<S extends StoreState> {
  getState: () => S;
}

/* A store that can dispatch actions. */
export interface StoreDispatch<A extends Action = AnyAction> {
  dispatch: (action: A) => void;
}

/**
 * Listens for events from other windows and dispatches them to the store.
 *
 * @param communicator - The runtime to listen for events on.
 * @param getStore - A function returning a store to dispatch events to.
 * @param resolve - A function that resolves a promise requesting
 * the initial store state.
 */
export const listen = <S extends StoreState, A extends Action = AnyAction>(
  communicator: Communicator<S, A>,
  getStore: () => (StoreStateGetter<S> & StoreDispatch<A>) | undefined,
  resolve: (value: PreloadedState<S>) => void
): void => {
  communicator.subscribe(({ action, emitter, state, sendState }) => {
    const s = getStore();
    if (s == null) return state != null && resolve(state);
    if (action != null) {
      validateAction({ action, emitter });
      return s.dispatch(sugar(action, emitter));
    }
    if (sendState === true && communicator.isMain())
      communicator.emit({ state: s.getState() as PreloadedState<S> }, emitter);
  });
};
