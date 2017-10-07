/**
 * Should ignore JSDoc extra indent.
 * @class testClass
 *
 */
class testClass {
    constructor(param) {

    }

    /**
     * JSDoc with more index.
     *  should ignore errors and still show high-level indent
     * @memberof testClass
     */
    test() {
        //
    }
     error() {
     //   this should contain indent errors
     // ignore // lines
     }
}