import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginUserMutation, useSignUpUserMutation } from './RTKQUERY';
import { setCredentials, setError, setLoading, logout } from './authSlice';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginUser] = useLoginUserMutation();
  const [signUpUser] = useSignUpUserMutation();

  const login = async (credentials) => {
    try {
      dispatch(setLoading(true));
      const result = await loginUser(credentials).unwrap();
      if (result.user && result.token) {
        dispatch(setCredentials(result));
        navigate('/', { replace: true });
        return result;
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      dispatch(setError(error.data?.message || 'Login failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signup = async (userData) => {
    try {
      dispatch(setLoading(true));
      const signupResult = await signUpUser(userData).unwrap();
      
      if (!signupResult.user) {
        throw new Error('Signup successful but no user data received');
      }

      const loginCredentials = {
        email: userData.email,
        password: userData.password
      };
      
      const loginResult = await loginUser(loginCredentials).unwrap();
      
      if (loginResult.user && loginResult.token) {
        dispatch(setCredentials(loginResult));
        navigate('/', { replace: true });
        return loginResult;
      } else {
        throw new Error('Invalid login response after signup');
      }
    } catch (error) {
      dispatch(setError(error.data?.message || 'Signup failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/auth/signin');
  };

  // Function to handle token expiration
  const handleTokenExpiration = () => {
    dispatch(logout());
    toast.error('Your session has expired. Please log in again.');
    navigate('/auth/signin');
  };

  return {
    login,
    signup,
    logout: handleLogout,
    handleTokenExpiration,
  };
}; 