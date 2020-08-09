import { OwnershipError } from '../lib/custom_errors'

const checkIsInRole = (...roles) => (req, res, next) => {
    console.log('\n\n\n user: ', req.user.role, '\n\n\n')
    console.log('\n\n\n Rolesssssss: ', roles, ' \n\n\n')

    // if (!req.user) {
    //     throw new BadCredentialsError();
    // }

    const hasRole = roles.find(role => req.user.role === role)
    if (!hasRole) {
        // return res.redirect('/login')
        throw new OwnershipError();
    }

    return next()
}

export default checkIsInRole;