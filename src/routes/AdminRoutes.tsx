import React from 'react';
import { Route } from 'react-router-dom';

import { Dashboard } from '../pages/Dashboard';


const AdminRoutes = () => (
  <>
    <Route path="/admin-dashboard" element={<Dashboard />} />

  </>
);

export default AdminRoutes;
