/* ──────────────────────────────────────────────
 *  App root – provides Redux store & router
 * ────────────────────────────────────────────── */
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './app/store';
import router from './app/routes';
import ToastContainer from './components/common/ToastContainer';
import './styles/global.css';

const App = () => (
  <Provider store={store}>
    <RouterProvider router={router} />
    <ToastContainer />
  </Provider>
);

export default App;
