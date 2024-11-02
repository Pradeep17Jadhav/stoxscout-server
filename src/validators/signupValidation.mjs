import {body} from 'express-validator';

const signupValidation = [
    body('name')
        .isLength({min: 6, max: 50})
        .custom((value) => {
            if (!value) throw new Error('name_required');
            return true;
        }),
    body('username')
        .isLength({min: 6, max: 30})
        .custom((value) => {
            if (!value) throw new Error('username_required');
            return true;
        }),
    body('email')
        .isEmail()
        .custom((value) => {
            if (!value) throw new Error('email_required');
            return true;
        })
        .normalizeEmail(),
    body('password').custom((value) => {
        const errors = [];
        if (!value) {
            errors.push('password_required');
        } else {
            if (value.length < 8) errors.push('password_too_short');
            if (!/[a-z]/.test(value)) errors.push('password_no_lowercase');
            if (!/[A-Z]/.test(value)) errors.push('password_no_uppercase');
            if (!/[0-9]/.test(value)) errors.push('password_no_number');
            if (!/[\W_]/.test(value)) errors.push('password_no_special');
        }
        if (errors.length) {
            throw new Error(errors.join(','));
        }
        return true;
    })
];

export {signupValidation};
