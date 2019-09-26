import * as effects from "redux-saga/effects";
import * as constants from "../actions/constants";

function* processTaskTimeConsuming() {
  const delay = 1000 + 1000 * Math.random();
  console.log("delay time", delay);
  yield effects.delay(delay);
  if (Math.random() > 0.5) {
    return true;
  } else {
    console.log("processerror");
    throw new Error("Something is not right!");
  }
}

function processTaskTimeConsumingReal() {
  return fetch("https://swapi.co/api/people/1/")
    .then(response => response)
    .catch(e => {
      throw new Error("error in request");
    });
}

function* doProcessTask(action) {
  const actionName = action.name;
  console.log("action", actionName);
  yield effects.put({ type: constants.TASK_PROCESS_START, name: actionName });
  console.log("action dispatcehd");
  let result;
  try {
    result = yield effects.call(processTaskTimeConsuming);
    console.log("request finished", result);
    yield effects.put({
      type: constants.TASK_PROCESS_DONE,
      name: actionName
    });
  } catch (error) {
    console.log("error", error);
    yield effects.put({
      type: constants.TASK_PROCESS_ERROR,
      name: actionName
    });
  } finally {
    yield effects.put({
      type: constants.TASK_PROCESS_RESET,
      name: actionName
    });
  }
}

export function* rootSaga() {
  console.log("hi from sagas");
  //  Takelatest will change the action performed if any is running | doesn't needs a while true
  yield effects.takeLatest(constants.TASK_PROCESS, doProcessTask);
}
