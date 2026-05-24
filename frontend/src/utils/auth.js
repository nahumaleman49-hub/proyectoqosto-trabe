export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

export const isAdmin = () => {
  const user = getUser();
  return user.role === 'admin';
};