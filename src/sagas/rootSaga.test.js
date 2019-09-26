import { rootSaga } from "./rootSaga";
import { expectSaga } from "redux-saga-test-plan";
import * as effects from "redux-saga/effects";
import * as constants from "../actions/constants";
import { processTask } from "./rootSaga";

test("it should fork processTask and wsHandler", () => {
  const it = rootSaga();
  expect(it.next().value).toEqual(
    effects.takeEvery(constants.TASK_PROCESS, processTask)
  );
});

test("handles TASK_PROCESS!", () => {
  return expectSaga(rootSaga)
    .put({
      type: constants.TASK_PROCESS_START,
      name: "a name"
    })

    .dispatch({
      type: constants.TASK_PROCESS,
      name: "a name"
    })
    .run();
});

test("handles TASK_PROCESS!", () => {
  return expectSaga(rootSaga)
    .provide([[effects.call(processTaskTimeConsuming), "mock return value"]])
    .put({
      type: constants.TASK_PROCESS_START,
      name: "a name"
    })

    .dispatch({
      type: constants.TASK_PROCESS,
      name: "a name"
    })
    .run();
});

test("handles TASK_PROCESS!", () => {
  return expectSaga(rootSaga)
    .provide([[effects.call(processTaskTimeConsuming)]])
    .put({
      type: constants.TASK_PROCESS_START,
      name: "a name"
    })
    .put({
      type: constants.TASK_PROCESS_ERROR,
      name: "a name"
    })
    .dispatch({
      type: constants.TASK_DONE,
      name: "a name"
    })
    .run();
});

test("handles TASK_PROCESS!", () => {
  return expectSaga(rootSaga)
    .provide([[effects.call(processTaskTimeConsuming), throwError("an error")]])
    .put({
      type: constants.TASK_PROCESS_START,
      name: "a name"
    })
    .put({
      type: constants.TASK_PROCESS_ERROR,
      name: "a name"
    })
    .dispatch({
      type: constants.TASK_PROCESS,
      name: "a name"
    })
    .run();
});
