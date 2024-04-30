import passport from 'passport';
import passportJWT from 'passport-jwt'
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
import User from  "../models/Authentication.js"

let opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'ownertnahihai',
    passReqToCallback : true
}

passport.use(new JWTStrategy(opts, async function (req, jwtPayload, done) {
    console.log('LOG : Passing through passport Jwt')
    User.findById(jwtPayload._id)
        .then(user => {
            if (user) {
                req.user = user
                return done(null, user)
            } else {
                console.log('LOG : User unidentified')
                return done(null, false);
            }
        })
        .catch(err => {
            console.log('Error finding user through JWT._id', err);
        })
}))

export default  passport
