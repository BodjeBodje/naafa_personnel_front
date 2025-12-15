import React from 'react';
import { Route } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Attendance } from '../pages/Attendance';
import { Employees } from '../pages/Employees';
import { Leaves } from '../pages/Leaves';
import { Reports } from '../pages/Reports';
import { Profile } from '../pages/Profile';
import { Permission } from '../pages/Permission';
import { DaysOff } from '../pages/DaysOff';
const RhRoutes = () => (
  <>
   <Route path="/manager-dashboard" element={<Dashboard />} />
   <Route path="/attendance" element={<Attendance />} />
   <Route path="/leaves" element={<Leaves />} />
   <Route path="/employees" element={<Employees />} />
   <Route path="/reports" element={<Reports />} />
   <Route path="/profile" element={<Profile />} />
   <Route path="/permission" element={<Permission />} />
   <Route path="/days_off" element={<DaysOff />} />

  </>
);

export default RhRoutes;
