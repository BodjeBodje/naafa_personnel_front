import React from 'react';
import { Route } from 'react-router-dom';
import { EmployeePermission } from '../pages/EmployeePermission';
import { EmployeeDashboard } from '../pages/EmployeeDashboard';
import { EmployeeLeaves } from '../pages/EmployeeLeaves';
import EmployeeAttendance from '../pages/EmployeeAttendance';

const EmployeeRoutes = () => (
  <>
    <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
    <Route path="/employee-attendance" element={<EmployeeAttendance />} />
    <Route path="/employee-permissions" element={<EmployeePermission />} />
    <Route path="/employee-leaves" element={<EmployeeLeaves />} />

  </>
);

export default EmployeeRoutes;
