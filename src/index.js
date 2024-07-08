import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './Pages/Dashboard/Dashboard';
import Login from './Pages/Login/Login';
import Signup from './Pages/Signup/Signup';
import Visualisation from './Pages/Visualisation/Visualisation';
import Compare from './Pages/Compare/Compare';
import DataContext from '../src/Context/Context';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <DataContext>
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/Signup" element={<Signup />} />
        <Route exact path="/Dashboard" element={<Dashboard />} />
        <Route exact path="/Visualisation" element={<Visualisation />} />
        <Route exact path="/CompareMode" element={<Compare />} />
      </Routes>
    </Router>
  </DataContext>
);
