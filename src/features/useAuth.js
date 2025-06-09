import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginUserMutation, useSignUpUserMutation } from './RTKQUERY';
import { setCredentials, setError, setLoading, logout } from './authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginUser] = useLoginUserMutation();
  const [signUpUser] = useSignUpUserMutation();

  const login = async (credentials) => {
    try {
      dispatch(setLoading(true));
      const result = await loginUser(credentials).unwrap();
      console.log('Login Response:', result);
      dispatch(setCredentials(result));
      navigate('/', { replace: true });
      return result;
    } catch (error) {
      console.error('Login Error:', error);
      dispatch(setError(error.data?.message || 'Login failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signup = async (userData) => {
    try {
      dispatch(setLoading(true));
      // First sign up the user
      const signupResult = await signUpUser(userData).unwrap();
      console.log('Signup Response:', signupResult);
      
      // Then automatically sign in with the same credentials
      const loginCredentials = {
        email: userData.email,
        password: userData.password
      };
      
      const loginResult = await loginUser(loginCredentials).unwrap();
      console.log('Auto-login Response:', loginResult);
      
      dispatch(setCredentials(loginResult));
      navigate('/', { replace: true });
      return loginResult;
    } catch (error) {
      console.error('Signup Error:', error);
      dispatch(setError(error.data?.message || 'Signup failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/signin');
  };

  return {
    login,
    signup,
    logout: handleLogout,
  };
}; 