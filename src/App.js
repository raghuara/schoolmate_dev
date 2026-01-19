import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { HashRouter as Router, useNavigate } from 'react-router-dom';
import './App.css';
import RouterPage from './Router';
import store, { persistor } from './Redux/Store';
import { PersistGate } from 'redux-persist/integration/react';
import { generateToken, messaging } from './Components/Notification/Firebase';
import { onMessage } from 'firebase/messaging';
import toast, { Toaster } from 'react-hot-toast';
import { initSessionListener } from './Redux/Slices/sessionManager';
import { logout } from './Redux/Slices/AuthSlice';

const AppContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const auth = useSelector((state) => state.auth); 

  useEffect(() => {
    const isValidAuth =
      auth?.isAuthenticated &&
      auth?.rollNumber?.trim() !== '' &&
      auth?.userType?.trim() !== '';
  
    if (!isValidAuth) {
      dispatch(logout());
      navigate('/');
    }
  }, [auth, dispatch]);

  useEffect(() => {
    generateToken();

    initSessionListener(() => {
      dispatch(logout());
      toast.error('You have been logged out (session mismatch)');
      navigate('/');
    });
  }, [dispatch]);

  return <RouterPage />;
};

function App() {

  useEffect(() => {
    generateToken();

    // const unsubscribe = onMessage(messaging, (payload) => {
    //   console.log("Foreground Notification Received:", payload);

    //   if (document.visibilityState === "visible") {
    //     toast(`${payload.notification?.title}: ${payload.notification?.body}`, {
    //       position: "top-right",
    //     });
    //   }
    // });

    // return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <Toaster position="top-right" reverseOrder={false} />
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <AppContent />
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;