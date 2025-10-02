// Debug utility for authentication issues
export const debugAuth = () => {
  console.log('=== AUTH DEBUG INFO ===');
  
  // Check if user data exists in localStorage
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('✅ User data found in localStorage:');
      console.log('- User ID:', user.id || user._id);
      console.log('- User name:', user.name);
      console.log('- User email:', user.email);
      console.log('- Token exists:', !!user.token);
      
      if (user.token) {
        // Decode JWT token payload (just for debugging, not for validation)
        try {
          const payload = JSON.parse(atob(user.token.split('.')[1]));
          console.log('- Token payload:');
          console.log('  - User ID:', payload.id);
          console.log('  - Issued at:', new Date(payload.iat * 1000));
          console.log('  - Expires at:', new Date(payload.exp * 1000));
          console.log('  - Is expired:', payload.exp < Date.now() / 1000);
        } catch (e) {
          console.log('- Token format error:', e.message);
        }
      } else {
        console.log('❌ No token found in user data');
      }
    } catch (error) {
      console.log('❌ Error parsing user data:', error.message);
    }
  } else {
    console.log('❌ No user data found in localStorage');
  }
  
  console.log('- API URL:', process.env.REACT_APP_API_URL);
  console.log('=======================');
};

// Function to clear auth data for testing
export const clearAuth = () => {
  localStorage.removeItem('user');
  console.log('🗑️ Authentication data cleared');
};

// Function to simulate login for testing
export const testAuth = (token, userId, userName, userEmail) => {
  const testUser = {
    token: token,
    id: userId,
    name: userName,
    email: userEmail
  };
  localStorage.setItem('user', JSON.stringify(testUser));
  console.log('🧪 Test user data set:', testUser);
};