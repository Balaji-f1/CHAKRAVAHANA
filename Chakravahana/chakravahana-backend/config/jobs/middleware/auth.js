// Optional authentication - ఐచ్ఛిక ఆథెంటికేషన్
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        let user;
        if (decoded.type === 'customer') {
          user = await Customer.findById(decoded.id).select('-password');
        } else if (decoded.type === 'mechanic') {
          user = await Mechanic.findById(decoded.id).select('-password');
        }

        if (user && user.isActive) {
          req.user = user;
          req.userType = decoded.type;
          
          // Update last login time
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });
        }
      } catch (jwtError) {
        // Token invalid, but continue without authentication
        console.log('Optional auth failed:', jwtError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};