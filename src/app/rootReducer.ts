/* ──────────────────────────────────────────────
 *  Root reducer – combines all feature slices
 * ────────────────────────────────────────────── */
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import clientReducer from '../features/client/clientSlice';
import whitelistReducer from '../features/whitelist/whitelistSlice';
import employeeReducer from '../features/employee/employeeSlice';
import timesheetReducer from '../features/timesheet/timesheetSlice';
import emailReducer from '../features/email/emailSlice';
import auditReducer from '../features/audit/auditSlice';
import assignmentReducer from '../features/assignment/assignmentSlice';
import paycodeReducer from '../features/paycode/paycodeSlice';
import extractedReducer from '../features/extracted/extractedSlice';
import ruleViolationReducer from '../features/rule-violations/ruleViolationSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  client: clientReducer,
  whitelist: whitelistReducer,
  employee: employeeReducer,
  timesheet: timesheetReducer,
  email: emailReducer,
  audit: auditReducer,
  assignment: assignmentReducer,
  paycode: paycodeReducer,
  extracted: extractedReducer,
  ruleViolation: ruleViolationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
