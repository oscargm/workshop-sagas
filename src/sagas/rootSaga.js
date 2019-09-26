import * as effects from "redux-saga/effects";
import { END, eventChannel } from "redux-saga";
import * as constants from "../actions/constants";
import io from "socket.io-client";

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
  const effectsToRun = tasks.map(task =>
    effects.fork(doProcessTask, task.name)
  );
  yield effects.all(effectsToRun);
}

function wsEmitter() {
  return eventChannel(emitter => {
    const socket = io("http://localhost:3001");
    socket.on("disconnect", reason => {
      emitter(END);
      socket.close();
    });
    socket.on("message", event => emitter(event));
    // The subscriber must return an unsubscribe function
    return () => {
      socket.close();
    };
  });
}

function* wsHandler() {
  const wsChan = yield effects.call(wsEmitter);
  while (true) {
    const event = yield effects.take(wsChan);
    if (event.type === "create") {
      yield effects.put({ type: constants.TASK_CREATE, name: event.name });
    }
  }
}

export function* rootSaga() {
  yield effects.takeEvery(constants.TASK_PROCESS_ALL, processAll);
  yield effects.takeEvery(constants.TASK_PROCESS, processTask);
  yield effects.fork(wsHandler);
}
