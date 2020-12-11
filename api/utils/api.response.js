class ApiResponse {
    constructor(success=false, data=undefined, error) {
        this.success = success
        this.data    = data
        this.error   = error
    }

    toJSON() {
        return Object.getOwnPropertyNames(this).reduce((a, b) => {
            a[b] = this[b]
            return a
        }, {})
    }

}

module.exports = ApiResponse