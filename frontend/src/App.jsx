// # frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/routing/PrivateRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import JobsList from './pages/jobs/JobsList';
import JobDetails from './pages/jobs/JobDetails';
import LocationsList from './pages/locations/LocationsList';
import LocationDetails from './pages/locations/LocationDetails';
import LocationForm from './components/locations/LocationForm';
import OrganizationsList from './pages/organizations/OrganizationsList';
import JobForm from './components/jobs/JobForm';
import OrganizationForm from './components/organizations/OrganizationForm';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Dashboard />} />
            
            {/* Jobs routes */}
            <Route path="jobs" element={<JobsList />} />
            <Route path="jobs/new" element={<JobForm />} />
            <Route path="jobs/edit/:id" element={<JobForm isEditing />} />
            <Route path="jobs/:id" element={<JobDetails />} />
            
            {/* Locations routes */}
            <Route path="locations" element={<LocationsList />} />
            <Route path="locations/new" element={<LocationForm />} />
            <Route path="locations/edit/:id" element={<LocationForm isEditing />} />
            <Route path="locations/:id" element={<LocationDetails />} />
            
            {/* Organizations routes */}
            <Route path="organizations" element={<OrganizationsList />} />
            <Route path="organizations/new" element={<OrganizationForm />} />
            <Route path="organizations/edit/:id" element={<OrganizationForm isEditing />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      
      {/* Toast notifications container */}
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;