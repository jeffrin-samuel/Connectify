import './App.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Authentication from './pages/authentication'
import { AuthProvider } from './contexts/AuthContext'
import VideoMeet from './pages/VideoMeet'
import Home from './pages/Home'
import { MeetingProvider } from './contexts/MeetingContext'
import History from './pages/History'
import NotFound from './pages/NotFound';

function App() {
  

  return (
    <div className='App'>
     
      <Router>

        <AuthProvider>

          <MeetingProvider>

            <Routes>

              <Route path = '/' element = {< LandingPage />} />
              <Route path='/auth' element = {< Authentication />} />
              <Route path='/home' element = {< Home />} />
              <Route path='/history' element = {< History />} />
              <Route path = '/meet/:url' element = {<VideoMeet />} />

              <Route path="*" element={<NotFound />} />
                
            </Routes>

          </MeetingProvider>

        </AuthProvider>

     </Router>

    </div>
  )
}

export default App
