import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import Auth from './pages/Auth'
import Feed from './pages/Feed'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Container from './components/Container'
import './App.css'

// Ensure credentials (cookies) are sent with requests
axios.defaults.withCredentials = true;

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-black text-white">
       <Header toggleSidebar={toggleSidebar} />
       <Sidebar isOpen={isSidebarOpen} />
       
       <main 
         className={`
           pt-20 px-4 pb-8 transition-all duration-300 ease-in-out
           ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
         `}
       >
         <Container>
            <Outlet />
         </Container>
       </main>
       <ScrollRestoration />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: "/feed",
        element: <Feed />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      // Placeholder for other sidebar links to avoid 404
      { path: "/liked-videos", element: <div className='pt-20 text-center'>Liked Videos Coming Soon</div> },
      { path: "/history", element: <div className='pt-20 text-center'>History Coming Soon</div> },
      { path: "/subscriptions", element: <div className='pt-20 text-center'>Subscriptions Coming Soon</div> },
      { path: "/settings", element: <div className='pt-20 text-center'>Settings Coming Soon</div> },
    ]
  },
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "/signup",
    element: <Auth />,
  },
])

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
