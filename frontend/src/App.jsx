// # frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/dashboard/Dashboard';
import JobsList from './pages/jobs/JobsList';
import JobDetails from './pages/jobs/JobDetails';
import JobForm from './components/jobs/JobForm';
import LocationsList from './pages/locations/LocationsList';
import LocationDetails from './pages/locations/LocationDetails';
import LocationForm from './components/locations/LocationForm';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';
import { useAuth } from './context/AuthContext';
import './App.css';

const App = () => {
  const { isAuthenticated, } = useAuth();
  
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
          } />
          
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          {/* Job Routes */}
          <Route path="/jobs" element={
            <PrivateRoute>
              <JobsList />
            </PrivateRoute>
          } />
          <Route path="/jobs/new" element={
            <PrivateRoute>
              <JobForm />
            </PrivateRoute>
          } />
          <Route path="/jobs/:id" element={
            <PrivateRoute>
              <JobDetails />
            </PrivateRoute>
          } />
          <Route path="/jobs/:id/edit" element={
            <PrivateRoute>
              <JobForm isEditing={true} />
            </PrivateRoute>
          } />
          
          {/* Location Routes */}
          <Route path="/locations" element={
            <PrivateRoute>
              <LocationsList />
            </PrivateRoute>
          } />
          <Route path="/locations/new" element={
            <PrivateRoute>
              <LocationForm />
            </PrivateRoute>
          } />
          <Route path="/locations/:id" element={
            <PrivateRoute>
              <LocationDetails />
            </PrivateRoute>
          } />
          <Route path="/locations/:id/edit" element={
            <PrivateRoute>
              <LocationForm isEditing={true} />
            </PrivateRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default App;