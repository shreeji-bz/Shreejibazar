import { Routes, Route } from 'react-router-dom';

export const AppProviders = ({ routes }: { routes: any[] }) => (
  <Routes>
    {routes.map((r) => (
      <Route key={r.path} path={r.path} element={r.element}>
        {r.children?.map((child: any) => (
          <Route key={child.path || 'index'} path={child.path || ''} element={child.element} />
        ))}
      </Route>
    ))}
  </Routes>
);
