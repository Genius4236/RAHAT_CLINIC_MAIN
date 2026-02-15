import { useState } from 'react'
import { TiHome } from 'react-icons/ti'
import { RiLogoutBoxFill } from 'react-icons/ri'
import { AiFillMessage } from 'react-icons/ai'
import { GiHamburgerMenu } from 'react-icons/gi'
import { FaUserDoctor } from 'react-icons/fa6'
import { MdAddModerator } from 'react-icons/md'
import { IoPersonAddSharp } from 'react-icons/io5'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const Sidebar = ({ isAuthenticated, setIsAuthenticated }) => {
  const [show, setShow] = useState(false)
  const navigateTo = useNavigate()

  const gotoHomePage = () => {
    navigateTo('/')
    setShow(!show)
  }

  const gotoDoctorsPage = () => {
    navigateTo('/doctors')
    setShow(!show)
  }

  const gotoMessagesPage = () => {
    navigateTo('/messages')
    setShow(!show)
  }

  const gotoAddNewDoctor = () => {
    navigateTo('/doctor/addnew')
    setShow(!show)
  }

  const gotoAddNewAdmin = () => {
    navigateTo('/admin/addnew')
    setShow(!show)
  }

  const handleLogout = async () => {
    try {
      await api.logoutAdmin()
      toast.success('Admin Logout Successfully!')
      localStorage.removeItem('isLoggedIn')
      setIsAuthenticated(false)
      navigateTo('/login')
    } catch (err) {
      toast.error(err.message || 'Logout failed')
      // Still clear auth state even if logout fails
      localStorage.removeItem('isLoggedIn')
      setIsAuthenticated(false)
      navigateTo('/login')
    }
  }

  return (
    <>
      <nav
        style={!isAuthenticated ? { display: 'none' } : { display: 'flex' }}
        className={show ? 'show sidebar' : 'sidebar'}
      >
        <div className="links">
          <TiHome onClick={gotoHomePage} />
          <FaUserDoctor onClick={gotoDoctorsPage} />
          <MdAddModerator onClick={gotoAddNewAdmin} />
          <IoPersonAddSharp onClick={gotoAddNewDoctor} />
          <AiFillMessage onClick={gotoMessagesPage} />
          <RiLogoutBoxFill onClick={handleLogout} />
        </div>
      </nav>
      <div
        className="wrapper"
        style={!isAuthenticated ? { display: 'none' } : { display: 'flex' }}
      >
        <GiHamburgerMenu className="hamburger" onClick={() => setShow(!show)} />
      </div>
    </>
  )
}

export default Sidebar
