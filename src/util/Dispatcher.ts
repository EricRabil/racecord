import * as Flux from "flux";
import {Action} from "../types/structures/action";

export class RacecordDispatcher<Action> extends Flux.Dispatcher<Action> {
   public dirtyDispatch(action: Action) {
       const dispatch = this.dispatch.bind(this, action);
       this.isDispatching() ? setImmediate(dispatch) : dispatch();
   }
}

export const Dispatcher = (new RacecordDispatcher() as RacecordDispatcher<Action>);
