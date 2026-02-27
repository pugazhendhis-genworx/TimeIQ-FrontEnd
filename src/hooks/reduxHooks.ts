/* ──────────────────────────────────────────────
 *  Typed Redux hooks (avoids typing useSelector/useDispatch everywhere)
 * ────────────────────────────────────────────── */
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../app/store';
import type { RootState } from '../app/rootReducer';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
