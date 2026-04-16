export function isLoggedIn(req, res, next) { //next vai avanti nella prossima funzione
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated' });
}