import * as effects from "redux-saga/effects";
import * as constants from "../actions/constants";

function* processTaskTimeConsuming() {
  yield effects.delay(1000 + 1000 * Math.random());
}

function* doProcessTask(name) {
  try {
    yield effects.put({ type: constants.TASK_PROCESS_START, name });
    yield effects.call(processTaskTimeConsuming);
    yield effects.put({ type: constants.TASK_PROCESS_DONE, name });
  } catch (error) {
    yield effects.put({ type: constants.TASK_PROCESS_ERROR, name });
  } finally {
    if (yield effects.cancelled()) {
      yield effects.put({ type: constants.TASK_PROCESS_RESET, name });
    }
  }
}

function* processTask(action) {
  yield effects.call(doProcessTask, action.name);
}

function* processTaskTimed(action) {
  yield effects.race({
    response: effects.call(doProcessTask, action.name),
    cancelled: effects.take(constants.TASK_PROCESS_CANCEL_ALL)
  });
}
function* processAll() {
  const tasks = yield effects.select(state =>
    state.tasks.filter(task => task.status === constants.statuses.IDLE)
  );
  for (let task of tasks) {
    yield effects.fork(doProcessTask, task.name);
  }
}

export function* rootSaga() {
  yield effects.takeEvery(constants.TASK_PROCESS, processTaskTimed);
  yield effects.takeEvery(constants.TASK_PROCESS_ALL, processAll);
}
