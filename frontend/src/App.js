import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home/Home';
import AddItem from './components/AddItem/AddItem';
import DisplayItem from './components/DisplayItem/DisplayItem';
import UpdateItem from './components/UpdateItem/UpdateItem';

import RegisterUser from './components/Register/Register';
import Login from './components/Login/Login';
import Userprofile from './components/UserProfile/UserProfile';
import UserProfile from './components/UpdateProfile/UpdateProfile';
import DisplayUserProfile from './components/DisplayItem/DisplayUsers';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/display-item" element={<DisplayItem />} />
        <Route path="/update-item/:id" element={<UpdateItem />} />

        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-profile" element={<Userprofile />} />
        <Route path="/update-profile/:id" element={<UserProfile />} />
        <Route path="/display-users" element={<DisplayUserProfile />} />
      </Routes>
    </div>
  );
}

export default App;
