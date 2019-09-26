import { rootSaga } from "./rootSaga";
import * as effects from "redux-saga/effects";
import * as constants from "../actions/constants";
import { processTask } from "./rootSaga";

test("it should fork processTask and wsHandler", () => {
  const it = rootSaga();
  expect(it.next().value).toEqual(
    effects.takeEvery(constants.TASK_PROCESS, processTask)
  );
});
