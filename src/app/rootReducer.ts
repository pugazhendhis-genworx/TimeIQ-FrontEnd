/* ──────────────────────────────────────────────
 *  Root reducer – combines all feature slices
 * ────────────────────────────────────────────── */
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import clientReducer from '../features/client/clientSlice';
import whitelistReducer from '../features/whitelist/whitelistSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  client: clientReducer,
  whitelist: whitelistReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
