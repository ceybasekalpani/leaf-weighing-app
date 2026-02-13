// Utility functions for date handling
export const getCurrentDate = () => {
  const date = new Date();
  return date.getDate().toString().padStart(2, '0');
};

export const getCurrentMonth = () => {
  const date = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]}-${date.getFullYear()}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.getDate().toString().padStart(2, '0');
};

export const formatMonth = (dateString) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]}-${date.getFullYear()}`;
};