import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { Toaster } from 'react-hot-toast'
import Auth from './pages/Auth'
import Feed from './pages/Feed'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import UserProfile from './pages/UserProfile'
import PlaylistDetail from './pages/PlaylistDetail'
import WatchVideo from './pages/WatchVideo'
import History from './pages/History'
import Tweets from './pages/Tweets'
import LikedVideos from './pages/LikedVideos'
import Subscriptions from './pages/Subscriptions'
import Settings from './pages/Settings'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Container from './components/Container'
import './App.css'

// Ensure credentials (cookies) are sent with requests
axios.defaults.withCredentials = true;

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith('/watch/');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-black text-white">
       <Toaster position="top-center" reverseOrder={false} />
       <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
       <Sidebar isOpen={isSidebarOpen} />
       
       <main 
         className={`
           pt-20 px-4 pb-8 transition-all duration-300 ease-in-out
           ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
         `}
       >
         {isWatchPage ? <Outlet /> : (
           <Container>
              <Outlet />
           </Container>
         )}
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
      {
        path: "/c/:username",
        element: <UserProfile />,
      },
      {
        path: "/playlist/:playlistId",
        element: <PlaylistDetail />,
      },
      {
        path: "/watch/:videoId",
        element: <WatchVideo />,
      },
      // Placeholder for other sidebar links to avoid 404
      { path: "/liked-videos", element: <LikedVideos /> },
      { path: "/history", element: <History /> },
      { path: "/tweets", element: <Tweets /> },
      { path: "/subscriptions", element: <Subscriptions /> },
      { path: "/settings", element: <Settings /> },
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
