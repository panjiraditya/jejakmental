import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AuthProvider } from './lib/auth'
import Home from './pages/Home'
import Directory from './pages/Directory'
import FacilityDetail from './pages/FacilityDetail'
import Screening from './pages/Screening'
import Emergency from './pages/Emergency'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import Admin from './pages/Admin'
import About from './pages/About'
import { NotFound, Privacy } from './pages/Static'
import './styles/base.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="direktori" element={<Directory />} />
            <Route path="direktori/:slug" element={<FacilityDetail />} />
            <Route path="skrining" element={<Screening />} />
            <Route path="bantuan" element={<Emergency />} />
            <Route path="masuk" element={<Login />} />
            <Route path="daftar" element={<Register />} />
            <Route path="akun" element={<Account />} />
            <Route path="admin" element={<Admin />} />
            <Route path="tentang" element={<About />} />
            <Route path="privasi" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
