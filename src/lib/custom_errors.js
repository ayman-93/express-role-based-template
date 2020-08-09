class OwnershipError extends Error {
    constructor() {
        super();
        this.name = "OwnershipError";
        this.message =
            "The provided token does not match the owner of this document";
    }
}

class DocumentNotFoundError extends Error {
    constructor() {
        super();
        this.name = "DocumentNotFoundError";
        this.message = "The provided ID doesn't match any documents";
    }
}

class BadParamsError extends Error {
    constructor() {
        super();
        this.name = "BadParamsError";
        this.message = "A required parameter was omitted or invalid";
    }
}

class JWTExpiredError extends Error {
    constructor() {
        super();
        this.name = "JWTExpiredError";
        this.message = "your token expired";
    }
}

class BadCredentialsError extends Error {
    constructor() {
        super();
        this.name = "BadCredentialsError";
        this.message = "The provided username or password is incorrect";
    }
}

// this method checks if the user trying to modify a resource is the owner of
// resource, and throws an error if not

// `requestObject` should be the actual `req` object from the route file
const requireOwnership = (requestObject, resource) => {
    // `requestObject.user` will be defined in any route that uses `requireToken`
    // `requireToken` MUST be passed to the route as a second argument
    if (!requestObject.user._id.equals(resource.owner)) {
        throw new OwnershipError();
    }
};

// if the client passes an ID that isn't in the DB, we want to return 404
const handle404 = record => {
    if (!record) {
        throw new DocumentNotFoundError();
    } else {
        return record;
    }
};

export {
    OwnershipError,
    requireOwnership,
    handle404,
    BadParamsError,
    BadCredentialsError,
    JWTExpiredError
};