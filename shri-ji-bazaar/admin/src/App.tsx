import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthRoutes, AdminRoutes } from './routes';
import { ProtectedRoute } from './components/common/ProtectedRoute';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {AuthRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
          {AdminRoutes.map(r => (
            <Route key={r.path} path={r.path} element={
              <ProtectedRoute><r.element /></ProtectedRoute>
            } />
          ))}
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
