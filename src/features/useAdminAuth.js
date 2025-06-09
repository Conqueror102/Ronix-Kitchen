import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginAdminMutation, useSignUpAdminMutation } from './RTKQUERY';
import { setAdminCredentials, setAdminError, setAdminLoading, adminLogout } from './adminSlice';

export const useAdminAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginAdmin] = useLoginAdminMutation();
  const [signUpAdmin] = useSignUpAdminMutation();

  const login = async (credentials) => {
    try {
      dispatch(setAdminLoading(true));
      const result = await loginAdmin(credentials).unwrap();
      console.log('Admin Login Response:', result);
      
      dispatch(setAdminCredentials(result));
      navigate('/admin/dashboard', { replace: true });
      return result;
    } catch (error) {
      console.error('Admin Login Error:', error);
      dispatch(setAdminError(error.data?.message || 'Login failed'));
      throw error;
    } finally {
      dispatch(setAdminLoading(false));
    }
  };

  const signup = async (adminData) => {
    try {
      dispatch(setAdminLoading(true));
      const result = await signUpAdmin(adminData).unwrap();
      console.log('Admin Signup Response:', result);
      
      // After successful signup, automatically log in
      const loginCredentials = {
        email: adminData.email,
        password: adminData.password
      };
      
      return await login(loginCredentials);
    } catch (error) {
      console.error('Admin Signup Error:', error);
      dispatch(setAdminError(error.data?.message || 'Signup failed'));
      throw error;
    } finally {
      dispatch(setAdminLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  return {
    login,
    signup,
    logout: handleLogout,
  };
}; 