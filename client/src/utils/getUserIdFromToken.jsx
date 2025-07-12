export function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the payload part
    return payload.userId || payload.id || payload._id || null;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
