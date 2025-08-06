import { all, fork } from 'redux-saga/effects';
import authSaga from './sagas/authSaga';

// Root saga - kết hợp tất cả sagas
export default function* rootSaga() {
  yield all([fork(authSaga)]);
}
